import * as Freezer from 'freezer-js';

export interface AppState {
	todoColumns: TodoColumn[];
	showDevTools: boolean;
	set(name: string, value: any);
	set(state: Partial<AppState>);
}

declare global {
	interface Array<T> {
		reset(newValue: T[]);
		toJS(): Array<T>;
	}
}

interface FreezerData<T> {
	get(): T;
	on(eventName: string, callback: () => void);
}

export const state = new Freezer({
	showDevTools: false,
	todoColumns: []
}) as FreezerData<AppState>;

state.on('update', (...args: any[]) => {
	console.log("State Changed", args);
});
