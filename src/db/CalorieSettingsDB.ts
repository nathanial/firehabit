import * as firebase from 'firebase';
import Database = firebase.database.Database;
import Reference = firebase.database.Reference;
import Query = firebase.database.Query;

export default class CalorieSettingsDB implements DBSection  {
	calorieSettingsRef: Reference;
	calorieSettings: CalorieSettings = {
		caloricGoal: 0,
		weightStasisGoal: 0
	};

	constructor(private readonly db: Database){

	}

	async setup(){
		const user = firebase.auth().currentUser;
		const userId = user.uid;

		this.calorieSettingsRef = this.db.ref(`/users/${userId}/calorie-settings`);
		this.calorieSettingsRef.on('value', (snapshot) => {
			const value = snapshot.val();
			if(value){
				this.calorieSettings.caloricGoal = value.caloricGoal;
				this.calorieSettings.weightStasisGoal = value.weightStasisGoal;
			}
		});
	}

	async updateCalorieSettings(values: Partial<CalorieSettings>) {
		this.calorieSettingsRef.update(values);
	}
}