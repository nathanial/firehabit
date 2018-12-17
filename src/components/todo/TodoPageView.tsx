import * as React from 'react';
import InlineText from "../InlineText";
import {Breadcrumb, Breadcrumbs, IBreadcrumbProps, Icon} from "@blueprintjs/core";

type Props = {
    todo: Todo;
    onGoBack();
};

export default class TodoPageView extends React.PureComponent<Props> {
    render(){
        const todo = this.props.todo;
        const BREADCRUMBS: IBreadcrumbProps[] = [
            { href: "/", icon: "folder-close", text: "Todos" },
            { icon: "document", text: todo.name },
        ];
        return (
            <div className={"todo-page-view"}>
                <Breadcrumbs
                    breadcrumbRenderer={this.renderBreadcrumb}
                    items={BREADCRUMBS}
                />
                <div className={"todo-title"}>
                    <label>Title</label>
                    <InlineText value={todo.name} multiline={true} onChange={this.onChangeName}/>
                </div>
                <div className={"todo-contents"}>
                    <label>Contents</label>
                    <InlineText value={todo.contents} multiline={true} onChange={this.onChangeContents}/>
                </div>
            </div>
        );
    }

    private renderBreadcrumb = (breadcrumb: IBreadcrumbProps) => {
        const {text, ...restProps} = breadcrumb;
        // customize rendering of last breadcrumb
        return <Breadcrumb onClick={(event) => this.onBreadcrumbClick(event, breadcrumb)} {...restProps}>{text}</Breadcrumb>;
    };

    private onChangeName = (name: string) => {
        this.props.todo.set({name});
    };

    private onChangeContents = (contents: string) => {
        this.props.todo.set({contents});
    };

    private onBreadcrumbClick = (event: React.MouseEvent, breadcrumb: IBreadcrumbProps) => {
        event.preventDefault();
        if(breadcrumb.text === "Todos") {
            this.props.onGoBack();
        }
    }
}