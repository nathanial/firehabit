import * as Freezer from 'freezer-js';
import * as _ from 'lodash';
import * as uuidv4 from 'uuid/v4';
import moment = require("moment");

export interface CalorieSettings {
	caloricGoal: number,
	weightStasisGoal: number
	set?(updates: Partial<CalorieSettings>);
}

export interface CaloriesState {
	selectedDate: string;
	'calorie-settings': CalorieSettings;
	foodDefinitions: FoodDefinition[];
	days: Day[];
	set?(name: string, value: any);
	set?(newState: Partial<CaloriesState>);
}

export interface AppState {
	showDevTools: boolean;
	calories: CaloriesState;
	todoColumns: TodoColumn[];
	set?(name: string, value: any);
	set?(newState: Partial<AppState>);
}

interface FreezerData<T> {
	get(): T;
	set(changes: Partial<T>);
	on(eventName: string, callback: (currentState: T, prevState: T) => void);
}

const initialAppState: AppState = {
	showDevTools: false,
	calories: {
		selectedDate: moment().format('MM/DD/YY'),
		foodDefinitions: [],
		days: [],
		'calorie-settings': {
			caloricGoal: 0,
			weightStasisGoal: 0
		}
	},
	todoColumns: []
};

export const state = new Freezer(initialAppState) as FreezerData<AppState>;

