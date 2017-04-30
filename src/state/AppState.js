import _ from 'lodash';
import {observable} from 'mobx';
import firebase from 'firebase';

function flattenKeys(value){
	return _.map(_.keys(value), key => {
		return {id: key, ...value[key]};
	});
}

function pushAll(dst, src){
	for(const item of src){
		dst.push(item);
	}
}

async function downloadRef(dst, ref){
	const data = await ref.once('value');
	pushAll(dst, flattenKeys(data.val()));
}

function watchRef(dst, ref){
	ref.on('child_added', (snapshot) => {
		const existingIDs = _.map(dst, 'id');
		if(!_.includes(existingIDs, snapshot.key)){
			dst.push({id: snapshot.key, ...snapshot.val()});
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

	async loadFromDB(){
		const user = firebase.auth().currentUser;
		const userId = user.uid;
		this.foodDefinitionsRef = firebase.database().ref(`/users/${userId}/foodDefinitions`);
		this.daysRef = firebase.database().ref(`/users/${userId}/days`);

		await downloadRef(this.days, this.daysRef);
		await downloadRef(this.foodDefinitions, this.foodDefinitionsRef);

		watchRef(this.days, this.daysRef);
		watchRef(this.foodDefinitions, this.foodDefinitionsRef);
	}

	async addConsumedFood(date, food) {
		food = _.omit(food, ['id']);
		const day = _.find(this.days, d => d.date === date);
		if(day){
			this.daysRef.child(day.id+'/consumed').push(day);
		} else {
			const childRef = this.daysRef.push({date});
			this.daysRef.child(childRef.key + '/consumed').push(food);
		}
	}

	async removeConsumedFood(food){
		this.days.child(food.id).remove();
	}

	async addFoodDefinition(definition){
		this.foodDefinitionsRef.push(definition);
	}

	async removeFoodDefinition(definition){
		this.foodDefinitionsRef.child(definition.id).remove();
	}
}