import * as _ from 'lodash';
import {observable} from 'mobx';
import * as firebase from 'firebase';
import CalorieSettingsDB from './CalorieSettingsDB';
import Database = firebase.database.Database;
import Reference = firebase.database.Reference;
import DailiesDB from "./DailiesDB";
import {downloadCollection, watchCollection} from "./util";
import TodoColumnsDB from "./TodoColumnsDB";

export class DB {
	loggedIn = false;
	foodDefinitions = observable([]);
	days:Day[] = observable([]);
	user = observable({
		name: '',
		email: ''
	});

	db: Database;
	foodDefinitionsRef: Reference;
	dailiesRef: Reference;
	daysRef: Reference;
	calorieSettingsDB: CalorieSettingsDB;
	dailiesDB: DailiesDB;
	todoColumnsDB: TodoColumnsDB;

	async loadFromDB(){
		const user = firebase.auth().currentUser;
		const userId = user.uid;
		this.db = firebase.database();
		this.foodDefinitionsRef = this.db.ref(`/users/${userId}/foodDefinitions`);
		await this.initializeDaysRef();

		this.calorieSettingsDB = new CalorieSettingsDB(this.db);
		await this.calorieSettingsDB.setup();

		this.dailiesDB = new DailiesDB(this.db);
		await this.dailiesDB.setup();

		this.todoColumnsDB = new TodoColumnsDB(this.db);
		await this.todoColumnsDB.setup();

		await downloadCollection(this.foodDefinitions, this.foodDefinitionsRef);
		watchCollection(this.foodDefinitions, this.foodDefinitionsRef);
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