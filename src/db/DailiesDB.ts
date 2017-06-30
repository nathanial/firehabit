import * as _ from 'lodash';
import * as firebase from "firebase/app";
import {downloadCollection, watchCollection} from "./util";
import {observable} from "mobx";
import Database = firebase.database.Database;
import Reference = firebase.database.Reference;

export default class DailiesDB implements DBSection {
	dailiesRef: Reference;
	dailies: DailyEntry[] = observable([]);
	constructor(private readonly db: Database) {

	}

	async setup() {
		const user = firebase.auth().currentUser;
		const userId = user.uid;

		this.dailiesRef = this.db.ref(`/users/${userId}/dailies`);
		await downloadCollection(this.dailies, this.dailiesRef);
		watchCollection(this.dailies, this.dailiesRef);
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