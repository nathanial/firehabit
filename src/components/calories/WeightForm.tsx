import * as _ from 'lodash';
import * as React from 'react';
import styled from 'styled-components';
import {observer} from 'mobx-react';
import {db} from '../../util';

const Wrapper = styled.div`
	display: block;
	width: 300px;
	position: relative;
`;

interface WeightFormProps {
	date: string;
}

@observer
export default class WeightForm extends React.Component<WeightFormProps, {}> {
	render(){
		const day = _.find(db.days, day => day.date === this.props.date);
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
		db.updateDay(this.props.date, {weight: newWeight});
	}
}