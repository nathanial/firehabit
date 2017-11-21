import * as React from 'react';
import {generatePushID} from '../../db/util';
import DialogService from "../../services/DialogService";
import * as _ from 'lodash';

type Props = {
    column: TodoColumn;
    onHandleTabChanged(newTabID: string);
}

export class TodoColumnTabs extends React.PureComponent<Props,{}>{
    render(){
        return (
            <div className="todo-column-tabs">
                {_.map(this.props.column.tabs, tab => {
                    const isActive = this.props.column.activeTab === tab.id;
                    let classes = "todo-column-tab";
                    if(isActive){
                        classes += ' tab-active';
                    }
                    return <div key={tab.id} className={classes} onClick={() => this.onSelectTab(tab)}>{tab.title}</div>;
                })}
                <div className="tab-controls">
                    <i className="pt-icon-standard pt-intent-danger pt-icon-trash remove-tab-btn" onClick={this.onRemoveActiveTab} />
                    <i className="pt-icon-standard pt-icon-plus add-tab-btn" onClick={this.onAddTab} />
                </div>
            </div>
        );
    }

    private onSelectTab = (tab: TodoTab) => {
        this.props.onHandleTabChanged(tab.id);
    }

    private onAddTab = async () => {
        let title = 'New Tab';

        function onChange(event){
            title = event.target.value;
        }

        const result = await DialogService.showDialog('Choose Tab Name', 'Create Tab', 'Cancel',
            <div style={{margin: 20}}>
                <label style={{marginRight: 20}}>Tab Name</label>
                <input type="text" className="pt-input" onChange={onChange} />
            </div>
        );
        if(result){
            this.props.column.tabs.push({
                id: generatePushID(),
                title: title || 'New Tab'
            });
        }
    }

    private onRemoveActiveTab = async () => {
        const result = await DialogService.showDangerDialog('Are you sure you want to remove this tab?', 'Delete Tab and All Contents', 'Cancel')
        if(!result){
            return;
        }
        const activeTabIndex = _.findIndex(this.props.column.tabs, tab => tab.id === this.props.column.activeTab);

        if(this.props.column.activeTab === '0'){
            return;
        }
        const column = this.props.column.transact();
        for(let todo of column.todos){
            if(todo.tab === this.props.column.activeTab){
                todo.set({tab: '0'});
            }
        }
        column.tabs.splice(activeTabIndex, 1);
        column.activeTab = _.last(column.tabs.map(t => t.id));
        this.props.column.run();
    }

}
