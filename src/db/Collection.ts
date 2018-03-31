import * as firebase from 'firebase';
import Reference = firebase.database.Reference;
import Database = firebase.database.Database;
import {downloadCollection} from "./util";
import * as _ from 'lodash';

interface IHasID {
    id: string;
}

export class Collection<T extends IHasID> {
	private ref: Reference;
	private dirtyItems: string[] = [];
    private deletedItems: string[] = [];
    
    constructor(
        public readonly key: string, 
        private readonly db: Database
    ){
        const user = firebase.auth().currentUser;
        this.ref = this.db.ref(`/users/${user.uid}/${this.key}`);
    }

    async load(): Promise<T[]> {
		return await downloadCollection<T>(this.ref);
    }

    update(newItems:T[], oldItems:T[]){
	    for(let prevItem of oldItems){
            if(!_.some(newItems, n => n.id === prevItem.id)){
                this.deletedItems.push(prevItem.id);
            }
        }
        for(let newItem of newItems){
            if(!_.some(oldItems, prevItem => prevItem === newItem)){
                this.dirtyItems.push(newItem.id);
            }
        }
    }

    save(currentItems:T[]): boolean {
		localStorage.setItem(this.key, JSON.stringify(currentItems));
		for(let id of _.uniq(this.dirtyItems)){
			const item = _.find(currentItems, n => n.id === id);
			this.ref.child(id).set(_.omit(item, 'id'));
		}
		for(let id of _.uniq(this.deletedItems)) {
			this.ref.child(id).remove();
        }
        let changed = false;
		if(this.dirtyItems.length > 0 || this.dirtyItems.length > 0){
            changed = true;
        }
        this.clearChanges();
	    return changed;
    }

    clearChanges(){
        this.dirtyItems = [];
        this.deletedItems = [];
    }

}