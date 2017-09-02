
interface CalorieSettings {
	caloricGoal: number;
	weightStasisGoal: number;
}

interface FoodDefinition {
	name: string;
	calories: string;
}

interface ConsumedFood {
	calories: string;
}

interface Day {
	date: string;
	consumed: ConsumedFood[];
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
	index: number;
	set?(updates: Partial<Todo>);
}

interface TodoColumn {
	id: string;
	name: string;
	color: string;
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