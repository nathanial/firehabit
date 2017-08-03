import * as _ from 'lodash';
import {downloadCollection, watchCollection} from "./util";
import * as firebase from "firebase/app";
import Database = firebase.database.Database;
import Reference = firebase.database.Reference;

export default class DaysDB implements DBSection {
	daysRef: Reference;
	days: Day[] = [];

	constructor(private readonly db: Database) {

	}

	async setup(){
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
}