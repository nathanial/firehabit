import * as _ from 'lodash';
import * as firebase from "firebase/app";
import {downloadCollection, watchCollection} from "./util";
import {observable} from "mobx";
import Database = firebase.database.Database;
import Reference = firebase.database.Reference;
import * as mobx from "mobx";
import * as uuidv4 from 'uuid/v4';

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
	todoColumns: TodoColumn[] = observable([]);

	constructor(private readonly db: Database) {

	}

	async setup() {
		const user = firebase.auth().currentUser;
		const userId = user.uid;

		this.todoColumnsRef = this.db.ref(`/users/${userId}/todoColumns`);
		await downloadCollection(this.todoColumns, this.todoColumnsRef);
		watchCollection(this.todoColumns, this.todoColumnsRef, () => {
			return {todos: observable([])};
		});
		for(let todoColumn of this.todoColumns){
			if(_.isUndefined(todoColumn.todos)){
				todoColumn.todos = observable([]);
			}
			if(_.isUndefined(todoColumn.confirmDeletion)){
				todoColumn.confirmDeletion = true;
			}
			await this.sortColumn(todoColumn);
		}
	}

	async addTodoColumn(name) {
		this.todoColumnsRef.push({
			name,
			todos: {}
		});
	}

	async deleteTodoColumn(column){
		this.todoColumnsRef.child(column.id).remove();
	}

	async updateTodoColumn(id: string, values: Partial<TodoColumn>) {
		values = _.cloneDeep(mobx.toJS(values));
		if(values.todos){
			const todos = values.todos;
			const newTodos = {} as any;
			for(const todo of todos){
				newTodos[todo.id] = _.omit(todo, ['id']);
			}
			values.todos = newTodos;
		}
		this.todoColumnsRef.child(id).update(_.omit(values, ['id']));
	}

	async addTodo(column, todo) {
		this.todoColumnsRef.child(`${column.id}/todos`).push(todo);
	}

	async updateTodo(todo){
		const column = _.find(this.todoColumns, (column) => {
			return !_.isUndefined(_.find(column.todos, (t: any) => t.id === todo.id));
		});
		for(let t of column.todos){
			if(t.id === todo.id){
				_.extend(t, todo);
			}
		}
		await this.updateTodoColumn(column.id, column);
	}

	async moveTodo(todo: Todo, column: TodoColumn, options: MoveTodoOptions){
		await this.deleteTodo(todo);
		this.todoColumnsRef.child(`${column.id}/todos`).push({
			..._.omit(mobx.toJS(todo), 'id'),
			index: options.index
		});
		await this.sortColumn(column);
	}

	async deleteTodo(todo) {
		const columns = _.filter(this.todoColumns, (column) => {
			return !_.isUndefined(_.find(column.todos, (t: any) => t.id === todo.id));
		});
		for(let column of columns){
			await this.todoColumnsRef.child(`${column.id}/todos/${todo.id}`).remove();
		}
	}

	async sortColumn(column: TodoColumn) {
		const todos = _.sortBy(column.todos, (todo) => todo.index);
		for(let i = 0; i < todos.length; i++){
			const todo = todos[i];
			if(todo.index !== i){
				todo.index = i;
			}
		}
		await this.updateTodoColumn(column.id, column);
	}

	async reset(columns: TodoColumn[]) {
		await this.todoColumnsRef.remove();
		(this.todoColumns as any).clear();
		await this.todoColumnsRef.set(encode(columns));
	}
}