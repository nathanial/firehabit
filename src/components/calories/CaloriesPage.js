// Line Limit 100
import React from 'react';
import styled from 'styled-components';
import {observer} from 'mobx-react';
import firebase from 'firebase';
import CaloriesForm from "./CaloriesForm";

const CaloriesPageWrapper = styled.div`
`;

class CaloriesPage extends React.Component {

	state = {
		allFoods: [],
		consumedFoods: []
	};

	render(){
		const allFoods = this.state.allFoods || [];
		const consumedFoods = this.state.consumedFoods || [];
		return (
			<CaloriesPageWrapper>
				<CaloriesForm consumedFoods={consumedFoods} allFoods={allFoods} />
			</CaloriesPageWrapper>
		);
	}

	componentDidMount(){
		const user = firebase.auth().currentUser;
		const userId = user.uid;
		this.allFoodsRef = firebase.database().ref(`/users/${userId}/allFoods`);

		this.allFoodsRef.on('child_added', (snapshot) => {
			const value = snapshot.val();
			console.log("Child Added", value);
			this.setState({
				allFoods: this.state.allFoods.concat(value)
			});
		});
		this.allFoodsRef.on('child_removed', (snapshot) => {
			const value = snapshot.val();
			console.log("Removed", value);
		});

		this.allFoodsRef.on('child_changed', (snapshot) => {
			const value = snapshot.val();
			console.log("Changed", value);
		});
	}
}

export default observer(CaloriesPage);