// Line Limit 50
import React from 'react';
import {observer} from 'mobx-react';
import styled from 'styled-components';
import * as colors from '../../theme/colors';
import * as _ from 'lodash';
import {Button} from '@blueprintjs/core';
import {anchorLeft} from "../../theme/mixins";

const SidePanelWrapper = styled.div`
	${anchorLeft(300)}
	background: ${colors.primaryColor1};
`;

const SidePanelListWrapper = styled.div`
	& > div {
		padding: 10px 20px;
		text-align: left;
		&:hover {
			background: ${colors.primaryColor3};
			cursor: pointer !important;
		}
		&.selected {
			background: ${colors.primaryColor2};
			&:hover {
				background:${colors.primaryColor2}
			}
		}
	}
`;

export default observer((props) => {
	return (
		<SidePanelWrapper>
			<div style={{textAlign: 'right'}}>
				<Button iconName="plus" className="pt-minimal pt-intent-success" onClick={props.onAddNotesSection}/>
			</div>
			<SidePanelListWrapper>
				{props.notesSections.map(section => {
					const className = section.id === _.get(props.selectedSection, 'id') ? 'selected' : '';
					return (
						<div key={section.id} className={className} onClick={() => props.onSelectedSectionChanged(section)}>
							<span>{section.name}</span>
						</div>
					);
				})}
			</SidePanelListWrapper>
		</SidePanelWrapper>
	);
});