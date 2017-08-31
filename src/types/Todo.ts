import {Subtask} from './Subtask';
import * as _ from 'lodash';

export interface Todo {
	id: string;
	name: string;
	subtasks: Subtask[];
	index: number;
}

export function updateSubtask(todo: Todo, index: number, update: Partial<Subtask>): Todo {
    const updatedTodo = _.cloneDeep(todo);
    updatedTodo.subtasks[index] = <Subtask>_.extend(updatedTodo.subtasks[index], update);
    return updatedTodo;
}
