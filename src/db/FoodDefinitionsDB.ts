import * as _ from 'lodash';
import * as firebase from "firebase/app";
import Reference = firebase.database.Reference;
import {downloadCollection} from "./util";
import Database = firebase.database.Database;

export default class FoodDefinitionsDB implements DBSection {
	foodDefinitionsRef: Reference;
	foodDefinitions: FoodDefinition[] = [];

	constructor(private readonly db: Database){

	}

	async setup(){
		const user = firebase.auth().currentUser;
		const userId = user.uid;
		this.foodDefinitionsRef = this.db.ref(`/users/${userId}/foodDefinitions`);
		this.foodDefinitions = await downloadCollection<FoodDefinition>(this.foodDefinitionsRef);
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