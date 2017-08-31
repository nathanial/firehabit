import { Record } from 'immutable';

export interface ISubtask {
	name: string;
	complete: boolean;
}

const SubtaskRecord = Record({
    name: '',
	complete: false
});

export class Subtask extends SubtaskRecord implements ISubtask {
    readonly name: string;
	readonly complete: boolean;
    constructor(props: ISubtask) {
        super(props);
    }
}
