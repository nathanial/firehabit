import * as Freezer from 'freezer-js';
import * as _ from 'lodash';
import * as uuidv4 from 'uuid/v4';
import moment = require("moment");

export interface CaloriesState {
	selectedDate: string;
	set?(name: string, value: any);
	set?(newState: Partial<CaloriesState>);
}

export interface AppState {
	showDevTools: boolean;
	calories: CaloriesState;
	set?(name: string, value: any);
	set?(newState: Partial<AppState>);
}

interface FreezerData<T> {
	get(): T;
	on(eventName: string, callback: () => void);
}

const initialAppState: AppState = {
	showDevTools: false,
	calories: {
		selectedDate: moment().format('MM/DD/YY')
	}
};

export const state = new Freezer(initialAppState);

