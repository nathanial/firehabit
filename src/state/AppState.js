import _ from 'lodash';
import {observable} from 'mobx';
import firebase from 'firebase';

export class AppState {
	loggedIn = observable(false);
	foodDefinitions = observable([]);
	consumedFoods = observable([]);
	user = observable({
		name: '',
		email: ''
	});

	async loadFromDB(){
		const user = firebase.auth().currentUser;
		const userId = user.uid;
		this.foodDefinitionsRef = firebase.database().ref(`/users/${userId}/foodDefinitions`);
		this.consumedFoodsRef = firebase.database().ref(`/users/${userId}/consumedFoods`);

		const consumedFoodsSnapshot = await this.consumedFoodsRef.once('value');
		const consumedFoodsValue = consumedFoodsSnapshot.val();
		for(const foodKey of _.keys(consumedFoodsValue)){
			this.consumedFoods.push({id: foodKey, ...consumedFoodsValue[foodKey]});
		}

		const foodDefinitionsSnapshot = await this.foodDefinitionsRef.once('value');
		const foodDefinitionsValue = foodDefinitionsSnapshot.val();
		for(const foodKey of _.keys(foodDefinitionsValue)){
			this.foodDefinitions.push({id: foodKey, ...foodDefinitionsValue[foodKey]});
		}

		this.consumedFoodsRef.on('child_added', (snapshot) => {
			const existingIDs = _.map(this.consumedFoods, 'id');
			if(!_.includes(existingIDs, snapshot.key)){
				this.consumedFoods.push({id: snapshot.key, ...snapshot.val()});
			}
		});
		this.foodDefinitionsRef.on('child_added', (snapshot) => {
			const existingIDs = _.map(this.foodDefinitions, 'id');
			console.log("Existing IDS", existingIDs, snapshot.key);
			if(!_.includes(existingIDs, snapshot.key)){
				this.foodDefinitions.push({id: snapshot.key, ...snapshot.val()});
			}
		});
		this.consumedFoodsRef.on('child_removed', (snapshot) => {
			const entry = _.find(this.consumedFoods, {id: snapshot.key});
			this.consumedFoods.splice(this.consumedFoods.indexOf(entry), 1);
		});
	}

	async addConsumedFood(food) {
		food = _.omit(food, ['id']);
		this.consumedFoodsRef.push(food);
	}

	async removeConsumedFood(food){
		this.consumedFoodsRef.child(food.id).remove();
	}

	async addFoodDefinition(food){
		this.foodDefinitionsRef.push(food);
	}
}