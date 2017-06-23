import * as Freezer from 'freezer-js';
import * as _ from 'lodash';
import * as uuidv4 from 'uuid/v4';

const timeSlots = _.flatten(_.times(24, (hour) => {
	return _.times(2, (minutes) => {
		return {
			id: uuidv4(),
			hour,
			minutes: minutes * 30,
			active: false
		};
	})
}));

export interface AppState {
	timeSlots: TimeSlot[];
}

interface FreezerData<T> {
	get(): T;
	on(eventName: string, callback: () => void);
}

export const state = new Freezer({
	timeSlots
}) as FreezerData<AppState>;

