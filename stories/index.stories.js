import React from 'react';
import { storiesOf } from '@storybook/react';
import { FeedbackScreen, feedbackMachine } from '../src/cheat/App';
import '../src/index.scss';
import { getShortestPaths } from '@xstate/graph';

const stories = storiesOf('Feedback', module);

const shortestPaths = getShortestPaths(feedbackMachine);

Object.keys(shortestPaths).forEach(key => {
  const { state } = shortestPaths[key];

  stories.add(key, () => <FeedbackScreen currentState={state} />);
});
