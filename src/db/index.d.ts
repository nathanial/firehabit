
interface CalorieSettings {
	caloricGoal: number;
	weightStasisGoal: number;
}

interface FoodDefinition {
	id: string;
	name: string;
	calories: string;
	set?(definition: Partial<FoodDefinition>);
}

interface ConsumedFood {
	calories: string;
	name: string;
}

interface Day {
	date: string;
	weight: number;
	consumed: ConsumedFood[];
	set?(day: Partial<Day>);
}

interface TimeSlot {
	id: string;
	active: boolean;
	text: string;
	hour: number;
	minutes: number;

	set?(name: string, value: any);
}

interface Subtask {
	name: string;
	complete: boolean;
	set?(updates: Partial<Subtask>);
}

interface Todo {
	id: string;
	name: string;
	subtasks: Subtask[];
	set?(updates: Partial<Todo>);
}

interface TodoColumn {
	id: string;
	name: string;
	color: string;
	editingName: boolean;
	confirmDeletion: boolean;
	showClearButton: boolean;
	todos: Todo[];
	showSettings: boolean;
	set?(updates: Partial<TodoColumn>);
}

interface DBSection {
	setup(): Promise<void>;
}

interface DailyEntry {
	id: string;
	name: string;
	records: {[day: string]: boolean};
}

interface Array<T> { 
	reset(data: T[]): void;
}