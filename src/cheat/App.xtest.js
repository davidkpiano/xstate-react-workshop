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
    assert.ok(getByText('How was your experience?'));

    // Click the "Good" button
    fireEvent.click(getByText('Good'));

    // Now the thanks screen should be visible
    assert.ok(getByText('Thanks for your feedback.'));
  });

  it('should show the form screen when "Bad" is clicked', () => {
    const { getByText } = render(<Feedback />);

    // The question screen should be visible at first
    assert.ok(getByText('How was your experience?'));

    // Click the "Bad" button
    fireEvent.click(getByText('Bad'));

    // Now the form screen should be visible
    assert.ok(getByText('Care to tell us why?'));
  });
});

describe('feedback app', () => {
  const feedbackMachine = Machine({
    id: 'feedback',
    initial: 'question',
    states: {
      question: {
        on: {
          CLICK_GOOD: 'thanks',
          CLICK_BAD: 'form',
          CLOSE: 'closed',
          ESC: 'closed'
        }
      },
      form: {
        on: {
          SUBMIT: 'thanks',
          CLOSE: 'closed',
          ESC: 'closed'
        }
      },
      thanks: {
        on: {
          CLOSE: 'closed',
          ESC: 'closed'
        }
      },
      closed: {
        type: 'final'
      }
    }
  });

  const simplePaths = getSimplePaths(feedbackMachine, {
    events: {
      SUBMIT: [{ type: 'SUBMIT', value: 'test feedback input' }]
    }
  });

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
          const {
            getByText,
            getByTitle,
            getByPlaceholderText,
            baseElement,
            queryByText
          } = render(<Feedback />);

          // Add heuristics for asserting that the state is correct
          function assertState(state) {
            const stateValue = state.value;

            if (state.matches('question')) {
              // assert that the question screen is visible
              assert.ok(getByText('How was your experience?'));
            } else if (state.matches('form')) {
              // assert that the form screen is visible
              assert.ok(getByText('Care to tell us why?'));
            } else if (state.matches('thanks')) {
              // assert that the thanks screen is visible
              assert.ok(getByText('Thanks for your feedback.'));
            } else if (state.matches('closed')) {
              // assert that the thanks screen is hidden
              assert.isNull(queryByText('Thanks for your feedback.'));
            } else {
              throw new Error(
                'Missing assertion for state: ' + JSON.stringify(stateValue)
              );
            }
          }

          // Add actions that will be executed (and asserted) to produce the events
          async function executeAction(event) {
            const actions = {
              CLICK_GOOD: () => {
                fireEvent.click(getByText('Good'));
              },
              CLICK_BAD: () => {
                fireEvent.click(getByText('Bad'));
              },
              SUBMIT: event => {
                fireEvent.change(getByPlaceholderText('Complain here'), {
                  target: { value: event.value }
                });

                fireEvent.click(getByText('Submit'));
              },
              CLOSE: () => {
                fireEvent.click(getByTitle('close'));
              },
              ESC: () => {
                fireEvent.keyDown(baseElement, { key: 'Escape' });
              }
            };

            const action = actions[event.type];

            if (action) {
              // Execute the action
              await action(event);
            } else {
              throw new Error(`Action for event '${event.type}' not found`);
            }
          }

          // Loop through each of the steps, assert the state, execute the action
          for (let step of path) {
            const { state, event } = step;

            try {
              await assertState(state);
              await executeAction(event);
            } catch (e) {
              throw new Error(e);
            }
          }

          // Finally, assert that the target state is reached.
          await assertState(targetState);
        });
      });
    });
  });
});
