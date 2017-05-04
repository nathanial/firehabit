import React from 'react';
import ReactDOM from 'react-dom';
import {Button, Intent, Dialog} from "@blueprintjs/core";

class BasicDialog extends React.Component {
	render(){
		return (
			<Dialog iconName="inbox"
							isOpen={true}
							onClose={this.toggleDialog}
							title={this.props.title}>
				<div className="pt-dialog-body">
					<label className="pt-label .modifier">
						{this.props.question}
					</label>
				</div>
				<div className="pt-dialog-footer">
					<div className="pt-dialog-footer-actions">
						<Button text={this.props.cancelBtn} onClick={this.onCancel} />
						<Button
							intent={Intent.DANGER}
							onClick={this.onConfirm}
							text={this.props.confirmBtn}
						/>
					</div>
				</div>
			</Dialog>
		);
	}

	onCancel = () => {
		this.props.onCancel();
	}

	onConfirm = () => {
		this.props.onConfirm();
	}
}

export default class DialogService {
	static async showDangerDialog(question, confirmBtn, cancelBtn) {
		return new Promise((resolve) => {
			function cancel(){
				resolve(false);
				ReactDOM.unmountComponentAtNode(document.getElementById('dialogs'));
			}

			function confirm(){
				resolve(true);
				ReactDOM.unmountComponentAtNode(document.getElementById('dialogs'));
			}

			ReactDOM.render(
				<BasicDialog question={question}
										 title="Danger"
										 confirmBtn={confirmBtn}
										 cancelBtn={cancelBtn}
										 onCancel={cancel}
										 onConfirm={confirm} />,
				document.getElementById('dialogs')
			);
		});
	}
}