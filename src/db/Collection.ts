import * as firebase from 'firebase';
import Reference = firebase.database.Reference;
import Database = firebase.database.Database;
import {downloadCollection} from "./util";
import * as _ from 'lodash';

interface IHasID {
    id: string;
}

interface Deserializer<T>{
    (item: T): T;
}

interface Serializer<T> {
    (item: T): any;
}

type CollectionOptions<T> = {
    deserialize?: Deserializer<T>,
    serialize?: Serializer<T>,
    afterLoad?(item: T, index: number);
}

export class Collection<T extends IHasID> {
	public ref: Reference;
	public dirtyItems: string[] = [];
    public deletedItems: string[] = [];
    
    constructor(
        public readonly key: string, 
        private readonly db: Database,
        private readonly options: CollectionOptions<T> = {
            deserialize: (item: T): T => item,
            serialize: (item: T): any => _.omit(item, 'id'),
            afterLoad: (item: T, index: number) => {}
        }
    ){
        const user = firebase.auth().currentUser;
        this.ref = this.db.ref(`/users/${user.uid}/${this.key}`);
        _.defaults(options, {
            deserialize: (item: T): T => item,
            serialize: (item: T): any => _.omit(item, 'id'),
            afterLoad: (item: T, index: number) => {}
        });
    }

    async load(): Promise<T[]> {
        let items = await downloadCollection<T>(this.ref);
        items = _.map(items, (item, index) => this.options.deserialize(item));
        items = _.sortBy(items, 'index');
        _.each(items, (item, index) => {
            this.options.afterLoad(item, index);
        });
        return items;
    }

    update(newItems:T[], oldItems:T[]){
        let changed = false;
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
        if(this.dirtyItems.length <= 0 && this.deletedItems.length <= 0){
            return;
        }
		for(let id of _.uniq(this.dirtyItems)){
			const item = _.find(currentItems, n => n.id === id);
            this.ref.child(id).set(this.options.serialize(item));
		}
		for(let id of _.uniq(this.deletedItems)) {
            this.ref.child(id).remove();
        }
        let changed = false;
		if(this.dirtyItems.length > 0 || this.deletedItems.length > 0){
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