import React from 'react';
import PropTypes from 'prop-types';

export default class FoodDefinitionForm extends React.Component {

	static propTypes = {
		foodDefinition: PropTypes.object.isRequired,
		onChange: PropTypes.func.isRequired
	};

	state = {
		name: this.props.foodDefinition.name,
		calories: this.props.foodDefinition.calories
	};

	render(){
		return (
			<div>
				<label className="pt-label .modifier">
					Food Name
					<span className="pt-text-muted">(required)</span>
					<input ref="name" className="pt-input"
								 type="text" placeholder="Food Name"
								 dir="auto"
								 value={this.state.name}
								 onChange={this.updateFoodName} />
				</label>
				<label className="pt-label .modifier">
					Calories
					<span className="pt-text-muted">(required)</span>
					<input ref="calories" className="pt-input" style={{width: 200}}
								 type="text" placeholder="Calories" dir="auto"
								 value={this.state.calories}
								 onChange={this.updateCalories} />
				</label>
			</div>
		);
	}

	updateFoodName = (event) => {
		const name = this.refs.name.value;
		this.setState({name}, () => {
			this.props.onChange(this.state);
		});
	};

	updateCalories = (event) => {
		const calories = parseInt(event.target.value, 10);
		this.setState({calories}, () => {
			this.props.onChange(this.state);
		});
	}
}