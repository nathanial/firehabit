import * as _ from 'lodash';
import {observable} from 'mobx';
import * as firebase from 'firebase';
import * as mobx from "mobx";
import CalorieSettingsDB from './CalorieSettingsDB';
import Database = firebase.database.Database;
import Reference = firebase.database.Reference;
import DailiesDB from "./DailiesDB";
import {downloadCollection, watchCollection} from "./util";

export class DB {
	loggedIn = false;
	foodDefinitions = observable([]);
	days:Day[] = observable([]);
	user = observable({
		name: '',
		email: ''
	});
	todoColumns = observable([]);

	db: Database;
	foodDefinitionsRef: Reference;
	dailiesRef: Reference;
	daysRef: Reference;
	todoColumnsRef: Reference;
	calorieSettingsDB: CalorieSettingsDB;
	dailiesDB: DailiesDB;

	async loadFromDB(){
		const user = firebase.auth().currentUser;
		const userId = user.uid;
		this.db = firebase.database();
		this.foodDefinitionsRef = this.db.ref(`/users/${userId}/foodDefinitions`);
		await this.initializeColumnsRef()
		await this.initializeDaysRef();
		await this.initializeDailiesRef();

		this.calorieSettingsDB = new CalorieSettingsDB(this.db);
		await this.calorieSettingsDB.setup();

		this.dailiesDB = new DailiesDB(this.db);
		await this.dailiesDB.setup();

		await downloadCollection(this.foodDefinitions, this.foodDefinitionsRef);
		watchCollection(this.foodDefinitions, this.foodDefinitionsRef);
	}

	async initializeDailiesRef(){

	}

	async initializeColumnsRef(){
		const user = firebase.auth().currentUser;
		const userId = user.uid;

		this.todoColumnsRef = this.db.ref(`/users/${userId}/todoColumns`);
		await downloadCollection(this.todoColumns, this.todoColumnsRef);
		watchCollection(this.todoColumns, this.todoColumnsRef);
		for(let todoColumn of this.todoColumns){
			if(_.isUndefined(todoColumn.todos)){
				todoColumn.todos = observable([]);
			}
			if(_.isUndefined(todoColumn.confirmDeletion)){
				todoColumn.confirmDeletion = true;
			}
		}
	}

	async initializeDaysRef(){
		const user = firebase.auth().currentUser;
		const userId = user.uid;
		this.daysRef = this.db.ref(`/users/${userId}/days`);
		await downloadCollection(this.days, this.daysRef);
		watchCollection(this.days, this.daysRef);
	}

	async addConsumedFood(date, food) {
		food = _.omit(food, ['id']);
		let day;
		if(_.isObject(date)){
			day = date;
		} else {
			day = _.find(this.days, d => d.date === date);
		}
		if(day){
			this.daysRef.child(day.id+'/consumed').push(food);
		} else {
			const childRef = this.daysRef.push({date});
			this.daysRef.child(childRef.key + '/consumed').push(food);
		}
	}

	async updateDay(date, values) {
		let day;
		if(_.isObject(date)){
			day = date;
		} else {
			day = _.find(this.days, d => d.date === date);
		}
		if(day){
			this.daysRef.child(day.id).update(values);
		} else {
			const childRef = this.daysRef.push({date});
			this.daysRef.child(childRef.key).update(values);
		}
	}


	async removeConsumedFood(day, food){
		this.daysRef.child(day.id + '/consumed/' + food.id).remove();
	}

	async addFoodDefinition(definition){
		this.foodDefinitionsRef.push(definition);
	}

	async removeFoodDefinition(definition){
		this.foodDefinitionsRef.child(definition.id).remove();
	}

	async updateFoodDefinition(definition){
		this.foodDefinitionsRef.child(definition.id).update(_.omit(definition, 'id'));
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

	async moveTodo(todo, column){
		await this.deleteTodo(todo);
		this.todoColumnsRef.child(`${column.id}/todos`).push(_.omit(mobx.toJS(todo), 'id'));
	}

	async deleteTodo(todo) {
		const columns = _.filter(this.todoColumns, (column) => {
			return !_.isUndefined(_.find(column.todos, (t: any) => t.id === todo.id));
		});
		for(let column of columns){
			await this.todoColumnsRef.child(`${column.id}/todos/${todo.id}`).remove();
		}
	}

	async addDaily(daily) {
		this.dailiesRef.push(daily);
	}

	async removeDaily(daily) {
		this.dailiesRef.child(daily.id).remove();
	}

	async updateDaily(daily) {
		this.dailiesRef.child(daily.id).update(_.omit(daily, 'id'));
	}
}