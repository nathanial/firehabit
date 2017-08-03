import * as _ from 'lodash';
import * as React from 'react';
import cxs from 'cxs';

const dndClass = cxs({
	position: 'absolute',
	left: 0,
	top: 0,
	right: 0,
	bottom: 0,
	'pointer-events': 'none'
});

export type Draggable = {
	x: number;
	y: number;
	element: any;
	startX: number;
	startY: number;
	width: number;
	height: number;
	data: any;
	onCancel();
	onDrop(value: any);
}

type State = {
	draggables: Draggable[];
	dropTargets: DropTarget[];
}

type DropTarget = {
	element: HTMLElement;
	onDrop(draggable: Draggable);
};

type Dimensions = {
	left: number;
	top: number;
	right: number;
	bottom: number;
}

function intersectRect(r1: Dimensions, r2: Dimensions): boolean {
	return !(r2.left > r1.right ||
	r2.right < r1.left ||
	r2.top > r1.bottom ||
	r2.bottom < r1.top);
}

export function intersects(draggable: Draggable, rect: Dimensions){
	return intersectRect({
		left: draggable.x,
		top: draggable.y,
		right: draggable.x + draggable.width,
		bottom: draggable.y + draggable.height
	}, rect);
}

export class DragAndDropLayer extends React.Component<{},State>{

	state = {
		draggables: [],
		dropTargets: []
	} as State;

	render(){
		return (
			<div className={dndClass}>
				{this.state.draggables.map((draggable, i) => {
					const left = draggable.x;
					const top = draggable.y;
					return (
						<div key={i} style={{left, top, position: 'fixed'}}>
							{draggable.element}
						</div>
					);
				})}
			</div>
		);
	}

	componentDidMount(){
		dndService.registerLayer(this);
		document.addEventListener('mousemove', this.onMouseMove);
		document.addEventListener('mouseup', this.onMouseUp, true);

	}

	componentWillUnmount(){
		dndService.layer = null;
		document.removeEventListener('mousemove', this.onMouseMove);
		document.removeEventListener('mouseup', this.onMouseUp);
	}

	onMouseMove = (event) => {
		if(!_.isEmpty(this.state.draggables)){
			for(let draggable of this.state.draggables){
				draggable.x = event.pageX - 10;
				draggable.y = event.pageY - 30;
				this.forceUpdate();
			}
		}
	};

	onMouseUp = (event) => {
		event.preventDefault();
		const {draggables, dropTargets} = this.state;
		this.setState({draggables: []});
		for(let draggable of draggables){
			let dropped = false;
			for(let dropTarget of dropTargets){
				if(intersects(draggable, dropTarget.element.getBoundingClientRect())){
					draggable.onDrop(dropTarget.onDrop(draggable));
					dropped = true;
					break;
				}
			}
			if(!dropped){
				draggable.onCancel();
			}
		}
	};

	async startDrag(pageX: number, pageY: number, width: number, height: number, data:any, element: React.ReactElement<any>){
		return new Promise((resolve) => {
			this.setState({
				draggables: this.state.draggables.concat({
					x: pageX,
					y: pageY,
					startX: pageX,
					startY: pageY,
					width,
					height,
					element,
					data,
					onDrop: (value: any) => {
						resolve(value);
					},
					onCancel: () => {
						resolve(false);
					}
				})
			});
		});
	}

	addDropTarget(dropTarget: DropTarget) {
		this.state.dropTargets.push(dropTarget);
		this.forceUpdate();
	}

	removeDropTarget(dropTarget: DropTarget) {
		this.setState({
			dropTargets: _.filter(this.state.dropTargets, (target) => {
				return target !== dropTarget
			})
		});
	}

}

type DndPosition = {
	x: number;
	y: number;
	width: number;
	height: number;
};

class DragAndDropService {
	public layer: DragAndDropLayer;
	private dropTargetBuffer = [];

	registerLayer(layer: DragAndDropLayer){
		this.layer = layer;
		for(let element of this.dropTargetBuffer){
			this.layer.addDropTarget(element);
		}
		this.dropTargetBuffer = [];
	}

	async startDrag(position: DndPosition, data:any, element: React.ReactElement<any>){
		return await this.layer.startDrag(position.x, position.y, position.width, position.height, data, element);
	}

	addDropTarget(dropTarget: DropTarget): () => void {
		if(!this.layer){
			this.dropTargetBuffer.push(dropTarget);
		} else {
			this.layer.addDropTarget(dropTarget);
		}
		return () => {
			this.layer.removeDropTarget(dropTarget);
		};
	}

}

export const dndService = new DragAndDropService();

