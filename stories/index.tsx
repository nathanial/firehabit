import * as React from 'react';
import * as _ from 'lodash';

import "normalize.css/normalize.css";
import "@blueprintjs/core/dist/blueprint.css";

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';
import TodoView from '../src/components/todo/TodoView';

import { Button, Welcome } from '@storybook/react/demo';

storiesOf('Welcome', module).add('to Storybook', () => <Welcome showApp={linkTo('Button')} />);

storiesOf('Button', module)
  .add('with text', () => <Button onClick={action('clicked')}>Hello Button</Button>)
  .add('with some emoji', () => <Button onClick={action('clicked')}>😀 😎 👍 💯</Button>);


storiesOf('TodoView', module)
.add('default', () => {
  const todo = {
  } as any;
  return <TodoView todo={todo} confirmDeletion={false} onDelete={_.noop} />
});