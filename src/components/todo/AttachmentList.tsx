import * as React from 'react';
import * as _ from 'lodash';
import cxs from 'cxs';
import {Button, Icon} from '@blueprintjs/core';
import InlineText from '../InlineText';

type Props = {
    attachments: Attachment[];
    onOpenAttachment(attachment: Attachment);
    onDelete(index: number, attachment: Attachment);
}

const attachmentListClass = cxs({
	listStyleType: 'none',
	margin: 0,
	padding: 0,
	fontSize: 12,
	borderTop: '1px solid #ccc',
	paddingLeft: 11,
	marginRight: 0,
	marginTop: 0,
	paddingTop: 10,
    paddingBottom: 10,
    'li': {
        position: 'relative',
		padding: '2px 0',
		margin: 0,
        marginLeft: 0,
        marginBottom: '3px',
        '.open-btn': {
            position: 'absolute',
			right: 6,
			top: 1,
			padding: 0,
			minHeight: 10,
			minWidth: 10,
			fontSize: '10px',
			lineHeight: '15px',
			opacity: 0
        },
        '.delete-btn': {
            position: 'absolute',
			right: 25,
			top: 1,
			padding: 0,
			minHeight: 10,
			minWidth: 10,
			fontSize: '10px',
			lineHeight: '15px',
			opacity: 0
        },
        ':hover': {
			'.delete-btn': {
				opacity: 1
			},
			'.open-btn': {
				opacity: 1
			}
        },
        '.pt-editable-text': {
            display: 'inline-block'
        }
    }
});

export class AttachmentList extends React.PureComponent<Props> {
    render(){
        const attachments = this.props.attachments || [];
        if(_.isEmpty(attachments)){
            return <div />
        }
        return (
            <div className={attachmentListClass}>
                {attachments.map((attachment, i) => {
                    return (
                        <li key={i}>
                            <Icon iconName="document" style={{marginRight: '5px', fontSize: '14px'}} />
                            <InlineText value={attachment.name}
                                        multiline={true}
                                        editing={false}
                                        onStartEditing={() => {}}
                                        onStopEditing={() => {}}
                                        onChange={(newName) => attachment.set({name: newName})} />
                            <Button className="open-btn pt-minimal pt-intent-success"
                                    iconName="document-open"
                                    onClick={() => this.onOpenAttachment(attachment)} />
                            <Button className="delete-btn close-btn pt-minimal pt-intent-danger"
                                    iconName="cross"
                                    onClick={() => this.onDeleteAttachment(i, attachment)} />
                        </li>
                    );
                })}
            </div>
        );
    }

    private onOpenAttachment = (attachment: Attachment) => {
        this.props.onOpenAttachment(attachment)
    }

    private onDeleteAttachment = (index, attachment: Attachment)  => {
        this.props.onDelete(index, attachment);
    }


}
