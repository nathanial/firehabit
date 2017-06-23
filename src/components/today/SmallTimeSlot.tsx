import * as React from 'react';
import * as colors from '../../theme/colors';
import cxs from 'cxs';
import * as moment from 'moment';
import * as color from 'color';
import {Button} from "@blueprintjs/core";

const timeSlotClass = cxs({
	position: 'relative',
	display: 'inline-block',
	border: `1px solid ${colors.primaryColor2}`,
	textAlign: 'left',
	margin: 10,
	padding: 10,
	width: '100px',
	cursor: 'pointer',
	userSelect: 'none',
	overflow: 'hidden',
	':hover': {
		background: colors.primaryColor1
	}
});

const expiredTimeClass = cxs({
	textDecoration:'line-through',
	color: color(colors.primaryColor2).fade(0.1).string()
});

const activeClass = cxs({
	background: colors.primaryColor2,
	':hover': {
		background: colors.primaryColor2,
		fontWeight: 'bold',
	}
});

const activeAndEditingClass = cxs({
	width: 700,
	height: 600,
	zIndex:999,
	background: colors.primaryColor1,
	'.visible-when-opened': {
		opacity: 1
	}
});

const buttonContainerClass = cxs({
	position: 'absolute',
	right: '10px',
	top: '10px'
});

const textAreaClass = cxs({
	position: 'absolute',
	display: 'block',
	left: 20,
	top: 60,
	bottom: 20,
	width: 'calc(100% - 40px)'
});

interface Props {
	slot: TimeSlot;
	style: any;
	onActivationChanged(slot: TimeSlot);
}

export default class SmallTimeSlot extends React.PureComponent<Props,{}> {
	render(){
		const slot = this.props.slot;
		const now = this.getNow();
		const slotTime = this.formatTime();
		let classes = timeSlotClass;
		let outerClasses = 'slot';
		outerClasses += ` slot-${this.props.slot.id}`;
		if(!this.props.slot.active){
			if(now === slotTime){
				classes += ' ' + activeClass;
			} else if(this.getSlotTime() < new Date().getTime()) {
				classes += ' ' + expiredTimeClass;
			}
		} else {
			classes += ' ' + activeAndEditingClass;
		}
		return (
			<div className={outerClasses + ' ' + classes}
				 style={this.props.style}
				 onClick={this.onTimeSlotClick}>
				<span>{slotTime}</span>
				<div className="visible-when-opened">
					<div className={buttonContainerClass}>
						<Button onClick={this.onCloseClick}>Close</Button>
					</div>
					<textarea className={`pt-input ${textAreaClass}`}
							  dir="auto"
							  value={slot.text}
							  onChange={this.onTextChanged}>
					</textarea>
				</div>
			</div>
		);
	}

	onTimeSlotClick = () => {
		if(!this.props.slot.active){
			this.props.onActivationChanged(this.props.slot);
		}
	};

	onCloseClick = () => {
		this.props.onActivationChanged(this.props.slot);
	};

	formatTime = () => {
		const {slot} = this.props;
		return moment(slot.hour + ':' + slot.minutes, ["HH:mm"]).format("h:mm A");
	};

	getSlotTime = () => {
		const {slot} = this.props;
		return moment(slot.hour + ':' + slot.minutes, ["HH:mm"]).toDate().getTime();
	};

	getNow = () => {
		const now = new Date();
		if(now.getMinutes() > 30){
			now.setMinutes(30);
		} else {
			now.setMinutes(0);
		}
		return moment(now).format('h:mm A');
	};

	onTextChanged = (event) => {
		this.props.slot.set('text', event.target.value);
	};
}
