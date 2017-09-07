import * as _ from 'lodash';
import * as firebase from 'firebase';
import Database = firebase.database.Database;
import Reference = firebase.database.Reference;
import {downloadCollection} from "./util";
import {state} from '../state';

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

	async load(){

		this.db = firebase.database();

		const user = firebase.auth().currentUser;
		const userId = user.uid;

		const todoColumns = await this.loadTodoColumns(userId);
		state.set({todoColumns});

		this.addListeners();
		this.startSync();
	}

	async loadTodoColumns(userId: string){
		this.todoColumnsRef = this.db.ref(`/users/${userId}/todoColumns`);
		const todoColumns = await downloadCollection<TodoColumn>(this.todoColumnsRef);
		for(let todoColumn of todoColumns){
			if(_.isEmpty(todoColumn.todos)){
				todoColumn.todos = [];
			}
		}
		return todoColumns;
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
			})
		}, 500);
	}

	async startSync(){
		setInterval(() => this.sync(), 1000);
	}

	async sync(){
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
}