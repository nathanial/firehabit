import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
	background: red;
	border-radius: 4px;
	height: 100px;
	width: 400px;
	margin: 10px;
	opacity: 0.1;
	text-align: center;
	vertical-align: middle;
	line-height: 100px;
	
	& > .pt-icon {
		position: relative;
		font-size: 42px;
		top: -5px;
	}
`;

export default class GarbageBin extends React.Component {
	render(){
		return (
			<Wrapper>
				<div className="pt-icon pt-icon-trash"></div>
			</Wrapper>
		);
	}
}