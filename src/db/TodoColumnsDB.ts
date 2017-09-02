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
	todoColumns: TodoColumn[] = new Freezer([])

	constructor(private readonly db: Database) {

	}

	async setup() {
		const user = firebase.auth().currentUser;
		const userId = user.uid;

		this.todoColumnsRef = this.db.ref(`/users/${userId}/todoColumns`);
		this.todoColumns = await downloadCollection<TodoColumn>(this.todoColumnsRef);
		for(let todoColumn of this.todoColumns){
			console.log("Todo Column", todoColumn);
			if(_.isEmpty(todoColumn.todos)){
				todoColumn.todos = [];
			}
		}
	}

	addTodoColumn(attrs: Partial<TodoColumn>) {
		const newRef = <any>this.todoColumnsRef.push({});
		const id = newRef.key;
		const todoColumn = <TodoColumn>{
			todos: [],
			...attrs,
			id
		};
		newRef.set(todoColumn);
		this.todoColumns.push(todoColumn);
	}

	deleteTodoColumn(columnID: string){
		this.todoColumnsRef.child(columnID).remove();
		this.todoColumns.splice(_.findIndex(this.todoColumns, col => col.id === columnID), 1);
	}

	async updateTodoColumn(id: string, values: Partial<TodoColumn>) {
		values = _.cloneDeep(values);
		if(values.todos){
			const todos = values.todos;
			const newTodos = {} as any;
			for(const todo of todos){
				newTodos[todo.id] = _.omit(todo, ['id']);
			}
			values.todos = newTodos;
		}
		await this.todoColumnsRef.child(id).update(_.omit(values, ['id']));
	}

	async addTodo(column: TodoColumn, todo: Partial<Todo>) {
		const newRef = this.todoColumnsRef.child(`${column.id}/todos`).push({});
		const id = newRef.key;
		const newTodo = <Todo>{
			...todo,
			id
		};
		newRef.set(newTodo);
		column.todos.push(newTodo);
	}

	async updateTodo(todo: Todo){
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
		await this.todoColumnsRef.child(`${column.id}/todos`).push({
			..._.omit(todo, 'id'),
			index: options.index
		});
		await this.sortColumn(column);
	}

	async deleteTodo(todo: Todo) {
		const columns = _.filter(this.todoColumns, (column) => {
			return !_.isUndefined(_.find(column.todos, (t: any) => t.id === todo.id));
		});
		for(let column of columns){
			this.todoColumnsRef.child(`${column.id}/todos/${todo.id}`).remove();
			const index = _.findIndex(column.todos, t => t.id === todo.id);
			column.todos.splice(index, 1);
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
		this.todoColumns.length = 0;
		await this.todoColumnsRef.set(encode(columns));
	}
}