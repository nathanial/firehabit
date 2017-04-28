// Line Limit 50
import React from 'react';
import {Button} from "@blueprintjs/core/dist/components/button/buttons";
import {Dialog} from "@blueprintjs/core/dist/components/dialog/dialog";
import {Intent} from '@blueprintjs/core';
import styled from 'styled-components';
import firebase from 'firebase';

const NewFoodDialogWrapper = styled.div`
	margin-top: 20px;
`;

export default class NewFoodDialog extends React.Component {

	state = {
		isOpen: false
	};

	render(){
		return (
			<NewFoodDialogWrapper>
				<Button onClick={this.openDialog} text="Add New Food..." />
				<Dialog
					iconName="inbox"
					isOpen={this.state.isOpen}
					onClose={this.toggleDialog}
					title="Add New Food"
				>
					<div className="pt-dialog-body">
						<label className="pt-label .modifier">
							Food Name
							<span className="pt-text-muted">(required)</span>
							<input ref="foodName" className="pt-input" type="text" placeholder="Food Name" dir="auto" />
						</label>
						<label className="pt-label .modifier">
							Calories
							<span className="pt-text-muted">(required)</span>
							<input ref="calories" className="pt-input" style={{width: 200}} type="text" placeholder="Calories" dir="auto" />
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

	openDialog = () => this.setState({ isOpen: true });

	onAddFood = async () => {
		const user = firebase.auth().currentUser;
		const userId = user.uid;
		const allFoodsRef = firebase.database().ref(`/users/${userId}/allFoods`);
		await allFoodsRef.push({
			name: this.refs.foodName.value,
			calories: this.refs.calories.value
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