import * as _ from 'lodash';
import * as $ from 'jquery';
import * as firebase from 'firebase';
import Database = firebase.database.Database;
import Reference = firebase.database.Reference;
import {downloadCollection} from "./util";
import {state} from '../state';
import * as moment from 'moment';
import * as config from './config';
import {Collection} from './Collection';

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

	private notesCollection: Collection<Note>;
	private calendarEventsCollection: Collection<BigCalendarEvent>;

	private async loadData(){
		const user = firebase.auth().currentUser;
		const userId = user.uid;
		const notes = await this.notesCollection.load();
		const todoColumns = await this.loadTodoColumns(userId);
		const foodDefinitions = await this.loadFoodDefinitions(userId);
		const days = await this.loadDays(userId);
		const selectedDate = moment().format('MM/DD/YY');
		const calorieSettings = <CalorieSettings>(await this.db.ref(`/users/${userId}/calorie-settings`).once('value')).val();
		const calendarEvents = await this.calendarEventsCollection.load();
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
			},
			notes,
			calendarEvents
		});

		if(!this.loaded){
			this.loaded = true;
			this.addListeners();
		}
	}

	private async getServerVersion(userId: string): Promise<number> {
		return new Promise<number>(resolve => {
			this.versionRef = this.db.ref(`/users/${userId}/version`);
			this.versionRef.once('value', (snapshot) => {
				const version = snapshot.val() as number;
				resolve(version);
			});
			this.versionRef = null;
		});
	}

	async load(options = {noChanges: false}){
		const started = moment();
		if(this.syncInterval){
			clearInterval(this.syncInterval);
		}
		this.db = firebase.database();
		this.notesCollection = new Collection<Note>("notes", this.db);
		this.calendarEventsCollection = new Collection<BigCalendarEvent>("calendar-events", this.db, this.deserializeEvent, this.serializeEvent);

		const user = firebase.auth().currentUser;
		const userId = user.uid;

		const serverVersion = await this.getServerVersion(userId) || 0;

		localStorage.setItem('app-version', config.appVersion);
		await this.loadData();
		localStorage.setItem('version', serverVersion.toString());

		if(options.noChanges){
			this.dirtyCalorieSettings = false;
			this.dirtyFoodDefinitions = [];
			this.dirtyColumns = [];
			this.dirtyDays = [];
			this.notesCollection.clearChanges();
		}
		this.startSync(userId);
		if(!this.versionRef){
			this.versionRef = this.db.ref(`/users/${userId}/version`);
			this.versionRef.once('value', (snapshot) => {
				const version = snapshot.val();
				this.serverVersion = version || 0;
				this.localVersion = version || 0;
			}).then(() => {
				this.versionRef.on('value', _.debounce((snapshot) => {
					const version = snapshot.val();
					this.serverVersion = version || 0;
					if(this.serverVersion > this.localVersion){
						this.localVersion = this.serverVersion;

						this.dirtyCalorieSettings = false;
						this.dirtyColumns = [];
						this.dirtyDays = [];
						this.dirtyFoodDefinitions = [];
						this.deletedColumns = [];
						this.deletedFoodDefinitions = [];

						this.notesCollection.clearChanges();
						this.calendarEventsCollection.clearChanges();

						this.load({noChanges: true});
					} else {
						this.localVersion = this.serverVersion;
					}
				}, 3000));
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
			if(_.isUndefined(todoColumn.tabs)){
				todoColumn.tabs = [
					{
						id: '0',
						title: 'Default'
					}
				];
			}
			todoColumn.todos = _.map(todoColumn.todos, todo => {
				return {...todo, name: _.trim(todo.name)};
			})
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
				this.notesCollection.update(currentState.notes, prevState.notes);
				this.calendarEventsCollection.update(currentState.calendarEvents, prevState.calendarEvents);
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
		this.notesCollection.save(state.get().notes);
		this.calendarEventsCollection.save(state.get().calendarEvents);
		this.syncTodoColumns();
		this.syncFoodDefinitions();
		this.syncDays(userId);
		if(this.localVersion !== this.serverVersion){
			this.serverVersion = this.localVersion;
			localStorage.setItem('version', this.localVersion.toString());
			this.versionRef.set(this.localVersion);
		}
	}

	async syncTodoColumns(){
		const todoColumns = state.get().todoColumns;
		localStorage.setItem('todo-columns', JSON.stringify(todoColumns));
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
		localStorage.setItem('food-definitions', JSON.stringify(foodDefinitions));
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
		localStorage.setItem('days', JSON.stringify(days));
		for(let dayID of _.uniq(this.dirtyDays)){
			const day = _.find(days, d => d.id === dayID);
			this.daysRef.child(dayID).set(_.omit(day, 'id'));
		}
		if(this.dirtyDays.length > 0){
			this.localVersion += 1;
		}
		this.dirtyDays = [];

		if(this.dirtyCalorieSettings){
			localStorage.setItem('calorie-settings', JSON.stringify({...appState.calories['calorie-settings']}));
			this.db.ref(`/users/${userId}/calorie-settings`).set({...appState.calories['calorie-settings']});
			this.localVersion += 1;
		}


		this.dirtyCalorieSettings = false;
	}

	private eventDateFormat = 'MM/DD/YY HH:mm:ss';
	private serializeEvent(event: BigCalendarEvent){
		return {
			...event,
			start: moment(event.start).format(this.eventDateFormat),
			end: moment(event.end).format(this.eventDateFormat)
		};
	}

	private deserializeEvent(event: BigCalendarEvent): BigCalendarEvent {
		return {
			...event,
			start: moment(event.start, this.eventDateFormat).toDate(),
			end: moment(event.end, this.eventDateFormat).toDate()
		};
	}

}
