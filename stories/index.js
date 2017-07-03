import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import TypeWrite from '../src/index';

storiesOf('React-TypeWrite', module)
  .add('A simple string', () => <TypeWrite>A simple string.</TypeWrite>)
  .add('A string with <span>one child</span> element', () =>
    <TypeWrite>
      A string with <span>one child</span> element.
    </TypeWrite>
  )
  .add('A string with nested elements', () =>
    <TypeWrite>
      React{' '}
      <span style={{ color: 'orange' }}>
        <strong>by Facebook</strong>
      </span>{' '}
      was here.
    </TypeWrite>
  );
