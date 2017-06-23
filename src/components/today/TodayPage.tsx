import * as React from 'react';
import cxs from 'cxs';
import * as $ from 'jquery';
import * as _ from 'lodash';
import SmallTimeSlot from "./SmallTimeSlot";
import {TweenMax, Power2, TimelineMax} from 'gsap';
import {findDOMNode} from "react-dom";

const todayPageClass = cxs({
	width: '800px',
	marginLeft: '-400px',
	left: '50%',
	marginTop: '10px',
	position: 'absolute'
});

const columnLength = 6;

interface Props {
	timeSlots: TimeSlot[];
}

export default class TodayPage extends React.Component<Props, {}> {
	render(){
		return (
			<div className={todayPageClass}>
				{this.renderTimeSlots()}
			</div>
		);
	}

	renderTimeSlots = () => {
		const oneSlotIsActive = _.some(this.props.timeSlots, slot => slot.active);
		return _.map(this.props.timeSlots,(slot) => {
			const {left,top} = this.getSlotLocation(slot);
			if(slot.active) {
				return (
					<SmallTimeSlot key={slot.id}
								   slot={slot}
								   style={{position: 'absolute', left: 0, top: 0, width: 700, height: 400, zIndex: 999}}
								   onActivationChanged={this.onActivationChanged}/>
				);
			} else {
				const opacity = oneSlotIsActive ? 0 : 1;
				return (
					<SmallTimeSlot key={slot.id}
								   slot={slot}
								   style={{position: 'absolute', left, top, zIndex: 0, opacity}}
								   onActivationChanged={this.onActivationChanged}/>
				);
			}
		});
	};

	getSlotLocation = (slot) => {
		const index = this.props.timeSlots.indexOf(slot);
		return {
			left: (index % columnLength) * 120,
			top: Math.floor(index / columnLength) * 50
		};
	};

	onActivationChanged = (slot) => {
		if(!slot.active){
			this.animateOpenSlot(slot);
		} else {
			this.animateCloseSlot(slot);
		}
	};

	animateOpenSlot = (slot) => {
		const root = $(findDOMNode(this));
		const otherSlots = _.map(root.find(`.slot:not(.slot-${slot.id})`), (el) => el);
		const targetSlots = _.map(root.find(`.slot.slot-${slot.id}`), (el) => el);
		const targetContents = _.map($(targetSlots).find('.visible-when-opened'), (el) => el);
		$(targetSlots).css({zIndex: 999});
		const timeline = new TimelineMax({
			onComplete: () => {
				slot.set('active', !slot.active);
			}
		});
		timeline.pause();
		timeline.to(otherSlots, 0.3, {opacity: 0});
		timeline.to(targetSlots, 0.3, {left: 0, top: 0, width: 700, height: 400});
		timeline.to(targetContents, 0.3, {opacity: 1}, '-=0.3');
		timeline.play();
	};

	animateCloseSlot = (slot) => {
		const root = $(findDOMNode(this));
		const otherSlots = _.map(root.find(`.slot:not(.slot-${slot.id})`), (el) => el);
		const targetSlots = _.map(root.find(`.slot.slot-${slot.id}`), (el) => el);
		const targetContents = _.map($(targetSlots).find('.visible-when-opened'), (el) => el);
		const timeline = new TimelineMax({
			onComplete: () => {
				slot.set('active', !slot.active);
			}
		});
		timeline.pause();
		timeline.to(targetSlots, 0.3, {width: 100, height: 40, ...this.getSlotLocation(slot)});
		timeline.to(targetContents, 0.3, {opacity: 0}, '-=0.3');
		timeline.to(otherSlots, 0.3, {opacity: 1});
		timeline.play();
	}
}