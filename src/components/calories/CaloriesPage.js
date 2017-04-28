// Line Limit 100
import React from 'react';
import styled from 'styled-components';
import {observer} from 'mobx-react';
import CaloriesForm from "./CaloriesForm";

const CaloriesPageWrapper = styled.div`
	position: absolute;
	left: 50%;
	margin-left: -300px;
`;

class CaloriesPage extends React.Component {

	render(){
		return (
			<CaloriesPageWrapper>
				<CaloriesForm />
			</CaloriesPageWrapper>
		);
	}
}

export default observer(CaloriesPage);