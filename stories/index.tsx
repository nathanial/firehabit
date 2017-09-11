import * as React from 'react';
import * as _ from 'lodash';

import "normalize.css/normalize.css";
import "@blueprintjs/core/dist/blueprint.css";

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';
import TodoView from '../src/components/todo/TodoView';
import * as Freezer from 'freezer-js';

import { Button, Welcome } from '@storybook/react/demo';

storiesOf('TodoView', module)
.add('default', () => {
  const todo = new Freezer({}).get();
  return <TodoView todo={todo} confirmDeletion={false} onDelete={_.noop} />
});