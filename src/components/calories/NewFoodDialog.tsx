// Line Limit 50
import * as React from 'react';
import {Button} from "@blueprintjs/core/dist/components/button/buttons";
import {Dialog} from "@blueprintjs/core/dist/components/dialog/dialog";
import {Intent} from '@blueprintjs/core';
import styled from 'styled-components';
import {db} from '../../util';

const NewFoodDialogWrapper = styled.div`
	margin-top: 20px;
`;

interface Props {
	defaultName: string;
	foodDefinitions: FoodDefinition[];
}

interface State {
	isOpen: boolean;
	foodName: string;
}

export default class NewFoodDialog extends React.Component<Props, State> {

	state = {
		isOpen: false,
		foodName: ''
	};

	foodName: HTMLInputElement;
	calories: HTMLInputElement;

	render(){
		return (
			<NewFoodDialogWrapper>
				<Button onClick={this.openDialog} text="Add New Food..." />
				<Dialog
					iconName="inbox"
					isOpen={this.state.isOpen}
					title="Add New Food"
				>
					<div className="pt-dialog-body">
						<label className="pt-label">
							Food Name
							<span className="pt-text-muted">(required)</span>
							<input ref={(foodName) => this.foodName = foodName} className="pt-input"
									 type="text" placeholder="Food Name"
									 dir="auto"
									 value={this.state.foodName}
									 onChange={(event) => this.setState({foodName: this.foodName.value})} />
						</label>
						<label className="pt-label">
							Calories
							<span className="pt-text-muted">(required)</span>
							<input ref={calories => this.calories = calories} className="pt-input" style={{width: 200}} type="text" placeholder="Calories" dir="auto" />
						</label>
					</div>
					<div className="pt-dialog-footer">
						<div className="pt-dialog-footer-actions">
							<Button text="Cancel" onClick={this.onCancel} />
							<Button
								intent={Intent.PRIMARY}
								onClick={this.onAddFood}
								text="Add Food"
							/>
						</div>
					</div>
				</Dialog>
			</NewFoodDialogWrapper>
		);
	}

	openDialog = () => this.setState({ isOpen: true, foodName: this.props.defaultName });

	onAddFood = async () => {
		this.props.foodDefinitions.push({
			name: this.foodName.value,
			calories: this.calories.value
		});
		this.setState({
			isOpen: false
		});
	};

	onCancel = () => {
		this.setState({
			isOpen: false
		});
	}
}