import { Machine, assign } from 'xstate';

const formConfig = {
  initial: 'pending',
  states: {
    pending: {
      on: {
        SUBMIT: {
          target: 'loading', // add guard
          actions: 'updateResponse',
          cond: 'formValid'
        }
      }
    },
    loading: {
      invoke: {
        id: 'submitForm',
        src: 'feedbackService',
        onDone: {
          target: 'submitted',
          actions: assign({
            feedback: (_, e) => e.data
          })
        },
        onError: [
          {
            target: 'loading',
            cond: ctx => ctx.retries < 5,
            actions: [
              assign({
                retries: ctx => ctx.retries + 1
              }),
              () => {
                console.log('Server is flaky, retrying...');
              }
            ]
          },
          {
            target: 'pending',
            actions: assign({ retries: 0 })
          }
        ]
      },
      on: {
        SUCCESS: 'submitted',
        FAILURE: 'error'
      }
    }, // handle SUCCESS
    submitted: {
      type: 'final'
    },
    error: {}
  }
};

export const feedbackMachine = Machine(
  {
    initial: 'question',
    context: {
      retries: 0,
      response: '',
      feedback: undefined,
      dog: undefined
    },
    states: {
      question: {
        invoke: {
          src: 'dogFetcher',
          onDone: {
            actions: assign({
              dog: (_, e) => e.data.message
            })
          }
        },
        on: {
          GOOD: {
            target: 'thanks',
            actions: 'logGood'
          },
          BAD: 'form',
          CLOSE: 'closed'
        },
        onExit: ['logExit']
      },
      form: {
        ...formConfig,
        on: {
          CLOSE: 'closed'
        },
        onDone: 'thanks'
      },
      thanks: {
        onEntry: 'logEntered',
        on: {
          CLOSE: 'closed'
        }
      },
      closed: {}
    }
  },
  {
    actions: {
      logExit: (context, event) => {},
      alertInvalid: () => {
        alert('You did not fill out the form!!');
      },
      updateResponse: assign({
        response: (ctx, e) => e.value
      })
    },
    guards: {
      formValid: (context, event) => {
        return event.value.length > 0;
      }
    },
    services: {
      dogFetcher: () =>
        fetch('https://dog.ceo/api/breeds/image/random').then(data =>
          data.json()
        ),
      feedbackService: (context, event) =>
        new Promise((resolve, reject) => {
          setTimeout(() => {
            const error = Math.random() < 0.9;
            if (error) {
              reject({
                message: 'Something went wrong'
              });
            } else {
              resolve({
                timestamp: Date.now(),
                message: 'Feedback: ' + context.response
              });
            }
          }, 1500);
        })
    }
  }
);
