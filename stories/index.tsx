import * as React from 'react';
import * as _ from 'lodash';

import "normalize.css/normalize.css";
import "@blueprintjs/core/dist/blueprint.css";
import '../src/index.css';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';
import TodoView from '../src/components/todo/TodoView';
import TodoColumnView from '../src/components/todo/TodoColumnView';
import * as Freezer from 'freezer-js';

import { Button, Welcome } from '@storybook/react/demo';

type Props = {
  getFreezerState(): any;
}


const freezer = new Freezer({
  todo: {},
  column: {
    name: 'Example',
    todos: [
      {name: 'Foo', id: 'foo'},
      {name: 'Bar', id: 'bar'}
    ]
  }
});

class FreezerComponent extends React.Component<Props,{}> {

  constructor(props){
    super(props);
    freezer.on('update', () => {
      this.forceUpdate();
    });
  }

  render(){
    return (
      <div className="pt-dark" style={{position: 'absolute', top: 0, bottom: 0}}> 
        {React.Children.map(this.props.children, element => React.cloneElement(element as any, this.props.getFreezerState()))}
      </div>
    );
  }

}
storiesOf('TodoView', module)
.add('default', () => {
  return (
    <FreezerComponent getFreezerState={() => ({todo: freezer.get().todo})}>
      <TodoView todo={freezer.get().todo} confirmDeletion={false} onDelete={action("Delete Todo")} />
    </FreezerComponent>
  );
});
storiesOf('TodoColumnView', module)
.add('default', () => {
  return (
    <FreezerComponent getFreezerState={() => ({column: freezer.get().column})}>
      <TodoColumnView column={freezer.get().column} onDeleteColumn={action("Delete Column")} />
    </FreezerComponent>
  );
})