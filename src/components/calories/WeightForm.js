import * as _ from 'lodash';
import React from 'react';
import styled from 'styled-components';
import {observer} from 'mobx-react';
import {appState} from '../../util';

const Wrapper = styled.div`
	display: block;
	width: 300px;
	position: relative;
`;


@observer
export default class WeightForm extends React.Component {
	static propTypes = {
		date: React.PropTypes.string.isRequired
	};

	render(){
		const day = _.find(appState.days, day => day.date === this.props.date);
		const weight = _.get(day, 'weight', '');
		return (
			<Wrapper className="pt-card pt-elevation-2" >
				<div className="pt-input-group">
					<span className="pt-icon pt-icon-step-chart"></span>
					<input type="text" className="pt-input" placeholder="Weight of the day..." value={weight} onChange={this.onUpdateWeight}/>
				</div>
			</Wrapper>
		);
	}

	onUpdateWeight = (event) => {
		const newWeight = parseInt(event.target.value, 10);
		appState.updateDay(this.props.date, {weight: newWeight});
	}
}