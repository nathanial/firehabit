import * as _ from 'lodash';
import * as firebase from "firebase/app";
import Reference = firebase.database.Reference;
import {observable} from "mobx";
import {downloadCollection, watchCollection} from "./util";
import Database = firebase.database.Database;

export default class FoodDefinitionsDB implements DBSection {
	foodDefinitionsRef: Reference;
	foodDefinitions: FoodDefinition[] = observable([]);

	constructor(private readonly db: Database){

	}

	async setup(){
		const user = firebase.auth().currentUser;
		const userId = user.uid;
		this.foodDefinitionsRef = this.db.ref(`/users/${userId}/foodDefinitions`);
		await downloadCollection(this.foodDefinitions, this.foodDefinitionsRef);
		watchCollection(this.foodDefinitions, this.foodDefinitionsRef, () => ({}));
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

}