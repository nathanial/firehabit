import {Todo} from './Todo';
export interface TodoColumn {
	id: string;
	name: string;
	color: string;
	confirmDeletion: boolean;
	showClearButton: boolean;
	todos: Todo[];
}
