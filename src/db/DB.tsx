import * as React from 'react';
import * as _ from 'lodash';
import * as firebase from 'firebase';
import Database = firebase.database.Database;
import Reference = firebase.database.Reference;
import DialogService from '../services/DialogService';
import {state, TodoPageState} from '../state';
import * as moment from 'moment';
import * as config from './config';
import {Collection} from './Collection';
import {generatePushID} from './util';

export const LAST_COMPLETED_FORMAT = "MM/DD/YY HH:mm";

export class DB {
	loggedIn = false;
	user = {
		name: '',
		email: ''
	};

	private db: Database;

	private versionRef: Reference;

	private syncInterval: any;
	private loaded: boolean = false;
	private localVersion: number = 0;

	private notesCollection: Collection<Note>;
	private calendarEventsCollection: Collection<BigCalendarEvent>;
	private foodDefinitionsCollection: Collection<FoodDefinition>;
	private todoColumnsCollection: Collection<TodoColumn>;
	private daysCollection: Collection<Day>;

	private transactionInProgress: boolean = false;

	private async loadData(){
		const user = firebase.auth().currentUser;
		const userId = user.uid;
		const notes = await this.notesCollection.load();
		const calendarEvents = await this.calendarEventsCollection.load();
		const foodDefinitions = await this.foodDefinitionsCollection.load();
		const todoColumns = await this.todoColumnsCollection.load();
		const days = await this.daysCollection.load();
		const selectedDate = moment().format('MM/DD/YY');
		const calorieSettings = (await this.db.ref(`/users/${userId}/calorie-settings`).once('value')).val() as CalorieSettings;
		const todoPageState = (await this.db.ref(`/users/${userId}/todo-page-state`).once('value')).val() as TodoPageState || {mode: "column-view"};
		if(_.isEmpty(todoColumns)){
			todoColumns.push({
				id: generatePushID(),
				name: 'Some Example Todos',
				color: '#394B59',
				enableTabs: false,
				tabs: [
					{
						id: '0',
						title: 'Default'
					}
				],
				activeTab: '0',
				showTodoCount: false,
				editingName: false,
				confirmDeletion: false,
				showClearButton: false,
				todos: [
					{
						id: generatePushID(),
						name: 'Example Todo 1',
						subtasks: [],
						attachments: [],
						startStopEvents: []
					},
					{
						id: generatePushID(),
						name: 'Example Todo 2',
						subtasks: [],
						attachments: [],
						startStopEvents: []
					}
				],
				index: 0,
				showSettings: false
			});
		}

		if(_.isEmpty(notes)){
			notes.push({
				id: generatePushID(),
				title: 'Example Note',
				editing: true,
				text: "{\"entityMap\":{},\"blocks\":[{\"key\":\"7qpco\",\"text\":\"An example note\",\"type\":\"header-one\",\"depth\":0,\"inlineStyleRanges\":[{\"offset\":0,\"length\":15,\"style\":\"fontsize-24\"}],\"entityRanges\":[],\"data\":{}},{\"key\":\"ee49o\",\"text\":\"With a list\",\"type\":\"ordered-list-item\",\"depth\":0,\"inlineStyleRanges\":[{\"offset\":0,\"length\":11,\"style\":\"fontsize-24\"}],\"entityRanges\":[],\"data\":{}},{\"key\":\"180g6\",\"text\":\"Of things\",\"type\":\"ordered-list-item\",\"depth\":0,\"inlineStyleRanges\":[{\"offset\":0,\"length\":9,\"style\":\"fontsize-24\"}],\"entityRanges\":[],\"data\":{}},{\"key\":\"8o8gu\",\"text\":\"About Stuff\",\"type\":\"ordered-list-item\",\"depth\":0,\"inlineStyleRanges\":[{\"offset\":0,\"length\":11,\"style\":\"fontsize-24\"}],\"entityRanges\":[],\"data\":{}}]}"
			});
		}

		state.set({
			search: '',
			todoColumns: todoColumns,
			calories: {
				selectedDate,
				foodDefinitions,
				days,
				'calorie-settings': {
					caloricGoal: _.get(calorieSettings, 'caloricGoal', 0),
					weightStasisGoal: _.get(calorieSettings, 'weightStasisGoal', 2300)
				}
			},
			todoPageState,
			notes,
			calendarEvents
		});

		if(!this.loaded){
			this.loaded = true;
			this.addListeners();
		}
	}

	async load(){
		if(this.syncInterval){
			clearInterval(this.syncInterval);
		}
		this.db = firebase.database();
		this.notesCollection = new Collection<Note>("notes", this.db);
		this.calendarEventsCollection = new Collection<BigCalendarEvent>("calendar-events", this.db, {
			deserialize: this.deserializeEvent,
			serialize: this.serializeEvent
		});
        this.foodDefinitionsCollection = new Collection<FoodDefinition>("foodDefinitions", this.db);
		this.todoColumnsCollection = new Collection<TodoColumn>("todoColumns", this.db, {
			afterLoad(todoColumn: TodoColumn, index: number){
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
				});
				if(_.isUndefined(todoColumn.index)){
					this.todoColumnsCollection.dirtyItems.push(todoColumn.id);
				}
				todoColumn.index = index;
			}
		});
		this.daysCollection = new Collection<Day>("days", this.db);

		const user = firebase.auth().currentUser;
		const userId = user.uid;

		localStorage.setItem('app-version', config.appVersion);
		await this.loadData();

		this.startSync(userId);
		if(!this.versionRef){
			this.versionRef = this.db.ref(`/users/${userId}/version`);
			const snapshot = await this.versionRef.once('value');
			const version = snapshot.val();
			this.localVersion = version || 0;
			this.versionRef.on('value', async (snapshot) => {
				const version = snapshot.val() || 0;
				if(version > this.localVersion){
					const result = await DialogService.showDialog("New Changes on Server", "Update to Latest", "Cancel",
						<div>There are new changes on the server, would you like to update?</div>
					);
					if(result){
						window.location.reload();
					}
				}
			});
		}
	}


	async reload(){
		document.body.style.pointerEvents = "none";
		clearInterval(this.syncInterval);
		await this.load();
		document.body.style.pointerEvents = "auto";
	}

	addListeners(){
		setTimeout(() => {
			state.on('update', (currentState, prevState) => {
				const user = firebase.auth().currentUser;
				const userId = user.uid;
				this.notesCollection.update(currentState.notes, prevState.notes);
				this.calendarEventsCollection.update(currentState.calendarEvents, prevState.calendarEvents);
				this.todoColumnsCollection.update(currentState.todoColumns, prevState.todoColumns);
				if(prevState.calories !== currentState.calories){
					if(prevState.calories.foodDefinitions !== currentState.calories.foodDefinitions){
						this.foodDefinitionsCollection.update(currentState.calories.foodDefinitions, prevState.calories.foodDefinitions);
					}
					if(prevState.calories.days !== currentState.calories.days){
						this.daysCollection.update(currentState.calories.days, prevState.calories.days);
					}
					if(prevState.calories["calorie-settings"] !== currentState.calories["calorie-settings"]){
						this.db.ref(`/users/${userId}/calorie-settings`).update(currentState.calories["calorie-settings"])
					}
				}
				if(prevState.todoPageState !== currentState.todoPageState){
					this.db.ref(`/users/${userId}/todo-page-state`).update(currentState.todoPageState)
				}
			})
		}, 500);
	}

	async startSync(userId){
		this.syncInterval = setInterval(() => this.sync(userId), 1000);
	}

	async sync(userId){
		if(this.transactionInProgress){
			throw new Error('Sync during transaction');
		}
		const {notes, calendarEvents, calories, todoColumns} = state.get();
		const notesChanged = this.notesCollection.save(notes);
		const calendarChanged = this.calendarEventsCollection.save(calendarEvents);
		const foodChanged = this.foodDefinitionsCollection.save(calories.foodDefinitions);
		const todosChanged = this.todoColumnsCollection.save(todoColumns);
		const daysChanged = this.daysCollection.save(calories.days);
		const changed = notesChanged || calendarChanged || foodChanged || todosChanged || daysChanged;
		if(changed){
			this.transactionInProgress = true;
			await this.versionRef.transaction((version) => {
				this.localVersion = version + 1;
				return version + 1;
			})
			this.transactionInProgress = false;
		}
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


export async function loginToFirebase(db: DB){
	return new Promise((resolve, reject) => {
		firebase.auth().onAuthStateChanged(async function(user) {
			if (user) {
				db.loggedIn = true;
				db.user.name = user.displayName;
				db.user.email = user.email;
				resolve();
				// User is signed in.
			} else {
				if(firebase.auth().currentUser){
					db.loggedIn = true;
					resolve();
					return;
				}
				const provider = new firebase.auth.GoogleAuthProvider();
				try {
					// if(window.location.hostname === 'localhost'){
					// 	await firebase.auth().signInAnonymously();
					// 	db.loggedIn = true;
					// 	window.location.reload();
					// } else {
						await firebase.auth().signInWithRedirect(provider);
						db.loggedIn = true;
					// }
					resolve();
				} catch(error){
					console.error(error);
					db.loggedIn = false;
					reject();
				}
			}
		});
	});
}
