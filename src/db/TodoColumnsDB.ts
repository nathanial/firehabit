import * as _ from 'lodash';
import * as firebase from "firebase/app";
import {downloadCollection} from "./util";
import Database = firebase.database.Database;
import Reference = firebase.database.Reference;
import * as uuidv4 from 'uuid/v4';
import * as Freezer from 'freezer-js';

type MoveTodoOptions = {
	index: number;
}

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

export default class TodoColumnsDB implements DBSection {
	todoColumnsRef: Reference;
	todoColumns: FreezerArray<TodoColumn> = new Freezer([])

	constructor(private readonly db: Database) {

	}

	async setup() {
		const user = firebase.auth().currentUser;
		const userId = user.uid;

		this.todoColumnsRef = this.db.ref(`/users/${userId}/todoColumns`);
		this.todoColumns = await downloadCollection<TodoColumn>(this.todoColumnsRef);
		for(let todoColumn of this.todoColumns){
			if(_.isEmpty(todoColumn.todos)){
				todoColumn.todos = [];
			}
		}
	}
}