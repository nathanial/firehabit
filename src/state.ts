import Freezer from 'freezer-js';
import * as _ from 'lodash';
import * as uuidv4 from 'uuid/v4';
import moment = require("moment");

export type TodoPageMode = "column-view" | "list-view"

export interface TodoPageState {
	mode: TodoPageMode;

    set?(updates: Partial<TodoPageState>);
}

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
	calendarEvents: BigCalendarEvent[];
	loadingData?: boolean;
	showDevTools: boolean;
	calories: CaloriesState;
	todoColumns: TodoColumn[];
	todoPageState: TodoPageState;
	notes: Note[];
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
	todoPageState: {
		mode: "column-view"
	},
	calendarEvents: [],
	calories: {
		selectedDate: moment().format('MM/DD/YY'),
		foodDefinitions: [],
		days: [],
		'calorie-settings': {
			caloricGoal: 0,
			weightStasisGoal: 0
		}
	},
	notes: [],
	todoColumns: []
};

const state = new Freezer(initialAppState, {live: true}) as FreezerData<AppState>;
window['state'] = state;
export {state};

