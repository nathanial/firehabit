import * as _ from 'lodash';
import * as $ from 'jquery';
import * as firebase from 'firebase';
import Database = firebase.database.Database;
import Reference = firebase.database.Reference;
import {downloadCollection} from "./util";
import {state} from '../state';
import * as moment from 'moment';

function encode(columns: TodoColumn[]) {
	const copy = _.cloneDeep(columns);
	const result = {};
	for(let column of copy){
		result[column.id] = _.omit(column, ['id', 'todos']);
		result[column.id].todos = {};
		for(let todo of column.todos){
			result[column.id].todos[todo.id] = _.omit(todo, ['id']);
		}
	}
	return result;
}

export class DB {
	loggedIn = false;
	user = {
		name: '',
		email: ''
	};

	private db: Database;

	private todoColumnsRef: Reference;
	private dirtyColumns: string[] = [];
	private deletedColumns: string[] = [];

	private foodDefinitionsRef: Reference;
	private versionRef: Reference;
	private dirtyFoodDefinitions: string[] = [];
	private deletedFoodDefinitions: string[] = [];

	private daysRef: Reference;
	private dirtyDays: string[] = [];
	private dirtyCalorieSettings = false;
	private syncInterval: number;
	private loaded: boolean = false;
	private serverVersion: number = 0;
	private localVersion: number = 0;

	async load(options = {noChanges: false}){
		if(this.syncInterval){
			clearInterval(this.syncInterval);
		}
		this.db = firebase.database();

		const user = firebase.auth().currentUser;
		const userId = user.uid;

		const todoColumns = await this.loadTodoColumns(userId);
		const foodDefinitions = await this.loadFoodDefinitions(userId);
		const days = await this.loadDays(userId);
		const selectedDate = moment().format('MM/DD/YY');
		const calorieSettings = <CalorieSettings>(await this.db.ref(`/users/${userId}/calorie-settings`).once('value')).val();
		state.set({
			todoColumns,
			calories: {
				selectedDate,
				foodDefinitions,
				days,
				'calorie-settings': {
					caloricGoal: _.get(calorieSettings, 'caloricGoal', 0),
					weightStasisGoal: _.get(calorieSettings, 'weightStasisGoal', 0)
				}
			}
		});

		if(!this.loaded){
			this.loaded = true;
			this.addListeners();
		}
		if(options.noChanges){
			this.dirtyCalorieSettings = false;
			this.dirtyFoodDefinitions = [];
			this.dirtyColumns = [];
			this.dirtyDays = [];
		}
		this.startSync(userId);
		if(!this.versionRef){
			this.versionRef = this.db.ref(`/users/${userId}/version`);
			this.versionRef.once('value', (snapshot) => {
				const version = snapshot.val();
				this.serverVersion = version || 0;
				this.localVersion = version || 0;
			}).then(() => {
				this.versionRef.on('value', (snapshot) => {
					const version = snapshot.val();
					this.serverVersion = version || 0;
					if(this.serverVersion > this.localVersion){
						this.localVersion = this.serverVersion;

						this.dirtyCalorieSettings = false;
						this.dirtyColumns = [];
						this.dirtyDays = [];
						this.dirtyFoodDefinitions = [];
						this.load({noChanges: true});
					} else {
						this.localVersion = this.serverVersion;
					}
				});
			});

		}

	}


	async reload(){
		$('body').css({'pointer-events': 'none'});
		clearInterval(this.syncInterval);
		await this.load();
		$('body').css({'pointer-events': 'auto'});
	}

	async loadTodoColumns(userId: string): Promise<TodoColumn[]>{
		this.todoColumnsRef = this.db.ref(`/users/${userId}/todoColumns`);
		let todoColumns = await downloadCollection<TodoColumn>(this.todoColumnsRef);
		todoColumns = _.sortBy(todoColumns, column => column.index);
		let index = 0;
		for(let todoColumn of todoColumns){
			if(_.isEmpty(todoColumn.todos)){
				todoColumn.todos = [];
			}
			todoColumn.index = index;
			index += 1;
		}
		return todoColumns;
	}

	async loadFoodDefinitions(userId: string): Promise<FoodDefinition[]> {
		this.foodDefinitionsRef = this.db.ref(`/users/${userId}/foodDefinitions`);
		const foodDefinitions = await downloadCollection<FoodDefinition>(this.foodDefinitionsRef);
		return foodDefinitions;
	}

	async loadDays(userId: string): Promise<Day[]> {
		this.daysRef = this.db.ref(`/users/${userId}/days`);
		const days = await downloadCollection<Day>(this.daysRef);
		return days;
	}

	addListeners(){
		setTimeout(() => {
			state.on('update', (currentState, prevState) => {
				for(let prevColumn of prevState.todoColumns){
					if(!_.some(currentState.todoColumns, c => c.id === prevColumn.id)){
						this.deletedColumns.push(prevColumn.id);
					}
				}
				for(let currentColumn of currentState.todoColumns){
					if(!_.some(prevState.todoColumns, prevColumn => prevColumn === currentColumn)){
						this.dirtyColumns.push(currentColumn.id);
					}
				}
				if(prevState.calories !== currentState.calories){
					if(prevState.calories.foodDefinitions !== currentState.calories.foodDefinitions){
						for(let prevFoodDefinition of prevState.calories.foodDefinitions){
							if(!_.some(currentState.calories.foodDefinitions, fd => fd.id === prevFoodDefinition.id)){
								this.deletedFoodDefinitions.push(prevFoodDefinition.id);
							}
						}
						for(let currentFoodDefinition of currentState.calories.foodDefinitions){
							if(!_.some(prevState.calories.foodDefinitions, fd => fd === currentFoodDefinition)){
								this.dirtyFoodDefinitions.push(currentFoodDefinition.id);
							}
						}
					}
					if(prevState.calories.days !== currentState.calories.days){
						for(let day of currentState.calories.days){
							if(!_.some(prevState.calories.days, d => d === day)){
								this.dirtyDays.push(day.id);
							}
						}
					}
				}
				if(prevState.calories['calorie-settings'] !== currentState.calories['calorie-settings']){
					this.dirtyCalorieSettings = true;
				}
			})
		}, 500);
	}

	async startSync(userId){
		this.syncInterval = setInterval(() => this.sync(userId), 1000);
	}

	async sync(userId){
		this.syncTodoColumns();
		this.syncFoodDefinitions();
		this.syncDays(userId);
		if(this.localVersion !== this.serverVersion){
			this.serverVersion = this.localVersion;
			this.versionRef.set(this.localVersion);
		}
	}

	async syncTodoColumns(){
		const todoColumns = state.get().todoColumns;
		for(let columnID of _.uniq(this.dirtyColumns)){
			const column = _.find(todoColumns, c => c.id === columnID);
			this.todoColumnsRef.child(columnID).set(_.omit(column, 'id'));
		}
		for(let columnID of _.uniq(this.deletedColumns)){
			this.todoColumnsRef.child(columnID).remove();
		}
		if(this.dirtyColumns.length > 0 || this.deletedColumns.length > 0){
			this.localVersion += 1;
		}
		this.dirtyColumns = [];
		this.deletedColumns = [];
	}

	async syncFoodDefinitions(){
		const foodDefinitions = state.get().calories.foodDefinitions;
		for(let foodDefinitionID of _.uniq(this.dirtyFoodDefinitions)){
			const foodDefinition = _.find(foodDefinitions, f => f.id === foodDefinitionID);
			this.foodDefinitionsRef.child(foodDefinitionID).set(_.omit(foodDefinition, 'id'));
		}
		for(let foodDefinitionID of _.uniq(this.deletedFoodDefinitions)){
			this.foodDefinitionsRef.child(foodDefinitionID).remove();
		}
		if(this.dirtyFoodDefinitions.length > 0 || this.deletedFoodDefinitions.length > 0){
			this.localVersion += 1;
		}
		this.dirtyFoodDefinitions = [];
		this.deletedFoodDefinitions = [];
	}

	async syncDays(userId){
		const appState = state.get();
		const days = appState.calories.days;
		for(let dayID of _.uniq(this.dirtyDays)){
			const day = _.find(days, d => d.id === dayID);
			this.daysRef.child(dayID).set(_.omit(day, 'id'));
		}
		if(this.dirtyDays.length > 0){
			this.localVersion += 1;
		}
		this.dirtyDays = [];

		if(this.dirtyCalorieSettings){
			this.db.ref(`/users/${userId}/calorie-settings`).set({...appState.calories['calorie-settings']});
			this.localVersion += 1;
		}


		this.dirtyCalorieSettings = false;
	}

}