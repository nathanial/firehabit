import * as _ from 'lodash';
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
	private dirtyFoodDefinitions: string[] = [];
	private deletedFoodDefinitions: string[] = [];

	private daysRef: Reference;
	private dirtyDays: string[] = [];
	private dirtyCalorieSettings = false;

	async load(){

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

		this.addListeners();
		this.startSync(userId);
	}

	async loadTodoColumns(userId: string): Promise<TodoColumn[]>{
		this.todoColumnsRef = this.db.ref(`/users/${userId}/todoColumns`);
		const todoColumns = await downloadCollection<TodoColumn>(this.todoColumnsRef);
		for(let todoColumn of todoColumns){
			if(_.isEmpty(todoColumn.todos)){
				todoColumn.todos = [];
			}
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
		setInterval(() => this.sync(userId), 1000);
	}

	async sync(userId){
		this.syncTodoColumns();
		this.syncFoodDefinitions();
		this.syncDays(userId);
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
		this.dirtyDays = [];

		if(this.dirtyCalorieSettings){
			this.db.ref(`/users/${userId}/calorie-settings`).set({...appState.calories['calorie-settings']});
		}

		this.dirtyCalorieSettings = false;
	}

}