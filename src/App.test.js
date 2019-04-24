import React from 'react';
import { Feedback } from './App';
import { Machine } from 'xstate';
import { getSimplePaths } from '@xstate/graph';
import { render, fireEvent, cleanup } from 'react-testing-library';
import { assert } from 'chai';

describe('feedback app (manual tests)', () => {
  it('should show the thanks screen when "Good" is clicked', () => {
    const { getByText } = render(<Feedback />);

    // The question screen should be visible at first

    // Click the "Good" button

    // Now the thanks screen should be visible
  });

  it('should show the form screen when "Bad" is clicked', () => {
    const { getByText } = render(<Feedback />);

    // The question screen should be visible at first

    // Click the "Bad" button

    // Now the form screen should be visible
  });
});

describe('feedback app', () => {
  const simplePaths = [];

  Object.keys(simplePaths).forEach(key => {
    const { paths, state: targetState } = simplePaths[key];

    describe(`state: ${key}`, () => {
      afterEach(cleanup);

      paths.forEach(path => {
        const eventString = path.length
          ? 'via ' + path.map(step => step.event.type).join(', ')
          : '';

        it(`reaches ${key} ${eventString}`, async () => {
          // Render the feedback app
          const {} = render(<Feedback />);

          // Add heuristics for asserting that the state is correct
          async function assertState(state) {}

          // Add actions that will be executed (and asserted) to produce the events
          async function executeAction(event) {}

          // Loop through each of the steps, assert the state, execute the action
          for (let step of path) {
          }

          // Finally, assert that the target state is reached.
          await assertState(targetState);
        });
      });
    });
  });
});
