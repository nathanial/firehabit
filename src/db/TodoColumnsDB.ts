import * as _ from 'lodash';
import * as firebase from "firebase/app";
import {downloadCollection, watchCollection} from "./util";
import Database = firebase.database.Database;
import Reference = firebase.database.Reference;

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
	todoColumns: TodoColumn[] = [];

	constructor(private readonly db: Database) {

	}

	async setup() {
		const user = firebase.auth().currentUser;
		const userId = user.uid;

		this.todoColumnsRef = this.db.ref(`/users/${userId}/todoColumns`);
		await downloadCollection(this.todoColumns, this.todoColumnsRef);
		watchCollection(this.todoColumns, this.todoColumnsRef);
		for(let todoColumn of this.todoColumns){
			if(_.isUndefined(todoColumn.todos)){
				todoColumn.todos = [];
			}
			if(_.isUndefined(todoColumn.confirmDeletion)){
				todoColumn.confirmDeletion = true;
			}
		}
	}

	async addTodoColumn(name) {
		this.todoColumnsRef.push({
			name
		});
	}

	async deleteTodoColumn(column){
		this.todoColumnsRef.child(column.id).remove();
	}

	async updateTodoColumn(id, values) {
		this.todoColumnsRef.child(id).update(values);
	}

	async addTodo(column, todo) {
		this.todoColumnsRef.child(`${column.id}/todos`).push(todo);
	}

	async updateTodo(todo){
		const column = _.find(this.todoColumns, (column) => {
			return !_.isUndefined(_.find(column.todos, (t: any) => t.id === todo.id));
		});
		this.todoColumnsRef.child(`${column.id}/todos/${todo.id}`).update(_.omit(todo, 'id'));
	}

	async moveTodo(todo: Todo, column: TodoColumn, options: MoveTodoOptions){
		await this.deleteTodo(todo);
		this.todoColumnsRef.child(`${column.id}/todos`).push({
			..._.omit(todo, 'id')
		});
	}

	async deleteTodo(todo) {
		const columns = _.filter(this.todoColumns, (column) => {
			return !_.isUndefined(_.find(column.todos, (t: any) => t.id === todo.id));
		});
		for(let column of columns){
			await this.todoColumnsRef.child(`${column.id}/todos/${todo.id}`).remove();
		}
	}

	async reset(columns: TodoColumn[]) {
		console.log('Reset');
		await this.todoColumnsRef.remove();
		(this.todoColumns as any).clear();
		await this.todoColumnsRef.set(encode(columns));
	}
}