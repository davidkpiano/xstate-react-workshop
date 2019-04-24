import React from 'react';
import { storiesOf } from '@storybook/react';
import { App } from '../src/App';
import '../src/index.scss';

storiesOf('Feedback', module).add('default', () => <App />);
