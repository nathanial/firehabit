import _ from 'lodash';
import {observable} from 'mobx';
import firebase from 'firebase';

function allKeysBeginWithDash(value){
	return !_.some(_.keys(value), k => k[0] !== '-');
}

function flattenKeys(value){
	if(_.isEmpty(value)){
		return value;
	}
	if(_.isObject(value) && allKeysBeginWithDash(value)) {
		return _.map(_.keys(value), key => {
			return flattenKeys({id: key, ...value[key]});
		});
	} else if(_.isArray(value)) {
		return _.map(value, x => flattenKeys(x));
	} else if(_.isObject(value)) {
		const result = {};
		for(let key of _.keys(value)) {
			result[key] = flattenKeys(value[key]);
		}
		return result;
	}  else {
		return value;
	}
}

function pushAll(dst, src){
	for(const item of src){
		dst.push(item);
	}
}

async function downloadCollection(dst, ref){
	const data = await ref.once('value');
	if(data.val()){
		pushAll(dst, flattenKeys(data.val()));
	}
}

function watchCollection(dst, ref){
	ref.on('child_added', (snapshot) => {
		const existingIDs = _.map(dst, 'id');
		if(!_.includes(existingIDs, snapshot.key)){
			dst.push({id: snapshot.key, ...snapshot.val()});
		}
	});
	ref.on('child_changed', (snapshot) => {
		const target = _.find(dst, item => item.id === snapshot.key);
		if(!target) {
			throw new Error("Couldn't find changed child");
		} else {
			const changedChild = {id: snapshot.key, ...flattenKeys(snapshot.val())};
			const dstItem = _.find(dst, ({id}) => id === changedChild.id);
			for(let key of _.keys(changedChild)) {
				const newValue = changedChild[key];
				if(_.isArray(newValue)) {
					if(_.isUndefined(dstItem[key])) {
						dstItem[key] = observable([]);
					}
					dstItem[key].splice(0, dstItem[key].length);
					pushAll(dstItem[key], newValue);
				} else {
					dstItem[key] = newValue;
				}
			}

			for(let key of _.keys(dstItem)){
				if(_.isUndefined(changedChild[key])){
					if(_.isObject(dstItem[key]) && dstItem[key].length > 0) {
						dstItem[key].splice(0, dstItem[key].length);
					} else {
						delete dstItem[key];
					}
				}
			}
		}
	});
	ref.on('child_removed', (snapshot) => {
		const entry = _.find(dst, {id: snapshot.key});
		dst.splice(dst.indexOf(entry), 1);
	});
}

export class AppState {
	loggedIn = observable(false);
	foodDefinitions = observable([]);
	days = observable([]);
	user = observable({
		name: '',
		email: ''
	});
	todoColumns = observable([]);

	async loadFromDB(){
		const user = firebase.auth().currentUser;
		const userId = user.uid;
		this.db = firebase.database();
		this.foodDefinitionsRef = this.db.ref(`/users/${userId}/foodDefinitions`);
		await this.initializeColumnsRef()
		await this.initializeDaysRef();
		await downloadCollection(this.foodDefinitions, this.foodDefinitionsRef);
		watchCollection(this.foodDefinitions, this.foodDefinitionsRef);
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

	async removeConsumedFood(day, food){
		this.daysRef.child(day.id + '/consumed/' + food.id).remove();
	}

	async addFoodDefinition(definition){
		this.foodDefinitionsRef.push(definition);
	}

	async removeFoodDefinition(definition){
		this.foodDefinitionsRef.child(definition.id).remove();
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
			return !_.isUndefined(_.find(column.todos, t => t.id === todo.id));
		});
		this.todoColumnsRef.child(`${column.id}/todos/${todo.id}`).update(_.omit(todo, 'id'));
	}

	async moveTodo(todo, column){
		await this.removeTodo(todo);
		this.todoColumnsRef.child(`${column.id}/todos`).push(_.omit(todo, 'id'));
	}

	async removeTodo(todo) {
		const columns = _.filter(this.todoColumns, (column) => {
			return !_.isUndefined(_.find(column.todos, t => t.id === todo.id));
		});
		for(let column of columns){
			await this.todoColumnsRef.child(`${column.id}/todos/${todo.id}`).remove();
		}
	}
}