import * as _ from 'lodash';
import * as firebase from 'firebase';
import CalorieSettingsDB from './CalorieSettingsDB';
import Database = firebase.database.Database;
import Reference = firebase.database.Reference;
import {downloadCollection, watchCollection} from "./util";
import TodoColumnsDB from "./TodoColumnsDB";
import DaysDB from "./DaysDB";
import FoodDefinitionsDB from "./FoodDefinitionsDB";

export class DB {
	loggedIn = false;
	user = {
		name: '',
		email: ''
	};

	db: Database;
	calorieSettingsDB: CalorieSettingsDB;
	todoColumnsDB: TodoColumnsDB;
	daysDB: DaysDB;
	foodDefinitionsDB: FoodDefinitionsDB;

	async load(){

		this.db = firebase.database();

		this.calorieSettingsDB = new CalorieSettingsDB(this.db);
		await this.calorieSettingsDB.setup();

		this.todoColumnsDB = new TodoColumnsDB(this.db);
		await this.todoColumnsDB.setup();

		this.daysDB = new DaysDB(this.db);
		await this.daysDB.setup();

		this.foodDefinitionsDB = new FoodDefinitionsDB(this.db);
		await this.foodDefinitionsDB.setup();

	}


}