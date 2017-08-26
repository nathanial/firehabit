import * as _ from 'lodash';
import {observable} from "mobx";

function allKeysBeginWithDash(value){
	return !_.some(_.keys(value), k => k[0] !== '-');
}

function flattenKeys(value){
	if(_.isEmpty(value)){
		return value;
	}
	if(_.isObject(value) && allKeysBeginWithDash(value)) {
		return _.map(_.keys(value), key => {
			return flattenKeys({id: key, ...value[key]});
		});
	} else if(_.isArray(value)) {
		return _.map(value, x => flattenKeys(x));
	} else if(_.isObject(value)) {
		const result = {};
		for(let key of _.keys(value)) {
			result[key] = flattenKeys(value[key]);
		}
		return result;
	}  else {
		return value;
	}
}

function pushAll(dst, src){
	for(const item of src){
		dst.push(item);
	}
}

export async function downloadCollection(dst, ref){
	const data = await ref.once('value');
	if(data.val()){
		dst.replace(flattenKeys(data.val()));
	}
}

export function watchCollection(dst, ref, createDefaults: () => Object){
	ref.on('child_added', (snapshot) => {
		const existingIDs = _.map(dst, 'id');
		if(!_.includes(existingIDs, snapshot.key)){
			dst.push({id: snapshot.key, ...createDefaults(), ...snapshot.val()});
		}
	});
	ref.on('child_changed', (snapshot) => {
		const target = _.find(dst, (item: any) => item.id === snapshot.key);
		if(!target) {
			throw new Error("Couldn't find changed child");
		} else {
			const changedChild = {id: snapshot.key, ...flattenKeys(snapshot.val())};
			const dstItem = _.find(dst, ({id}) => id === changedChild.id);
			for(let key of _.keys(changedChild)) {
				const newValue = changedChild[key];
				if(_.isArray(newValue)) {
					if(_.isUndefined(dstItem[key])) {
						dstItem[key] = observable([]);
					}
					dstItem[key].replace(newValue);
				} else {
					dstItem[key] = newValue;
				}
			}

			for(let key of _.keys(dstItem)){
				if(_.isUndefined(changedChild[key])){
					if(_.isObject(dstItem[key]) && dstItem[key].length > 0) {
						dstItem[key].splice(0, dstItem[key].length);
					} else {
						delete dstItem[key];
					}
				}
			}
		}
	});
	ref.on('child_removed', (snapshot) => {
		const entry = _.find(dst, {id: snapshot.key});
		dst.splice(dst.indexOf(entry), 1);
	});
}
