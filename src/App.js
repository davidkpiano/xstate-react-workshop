import React, { useReducer, useState } from 'react';
import { Machine, interpret, assign } from 'xstate';
import { useMachine } from '@xstate/react';

function Screen({ children, onSubmit = undefined }) {
  if (onSubmit) {
    return (
      <form onSubmit={onSubmit} className="screen">
        {children}
      </form>
    );
  }

  return <section className="screen">{children}</section>;
}

function QuestionScreen({ onClickGood, onClickBad, onClose }) {
  return (
    <Screen>
      <header>How was your experience?</header>
      <button onClick={onClickGood} data-variant="good">
        Good
      </button>
      <button onClick={onClickBad} data-variant="bad">
        Bad
      </button>
      <button title="close" onClick={onClose} />
    </Screen>
  );
}

function FormScreen({ onSubmit, onClose, currentState }) {
  const [response, setResponse] = useState('');

  return (
    <Screen
      onSubmit={e => {
        e.preventDefault();

        onSubmit(response);
      }}
    >
      {currentState.matches({ form: 'pending' }) ? (
        <>
          <header>Care to tell us why?</header>
          <textarea
            name="response"
            placeholder="Complain here"
            onKeyDown={event => {
              if (event.key === 'Escape') {
                event.stopPropagation();
              }
            }}
            value={response}
            onChange={event => setResponse(event.target.value)}
          />
          <button>Submit</button>
          <button title="close" type="button" onClick={onClose} />
        </>
      ) : currentState.matches({ form: 'loading' }) ? (
        <div>Submitting...</div>
      ) : null}
    </Screen>
  );
}

function ThanksScreen({ onClose, response = '' }) {
  return (
    <Screen>
      <header>Thanks for your feedback: {response}</header>
      <button title="close" onClick={onClose} />
    </Screen>
  );
}

const formConfig = {
  initial: 'pending',
  states: {
    pending: {
      on: {
        SUBMIT: {
          target: 'loading', // add guard
          cond: 'formValid'
        }
      }
    },
    loading: {
      on: {
        SUCCESS: 'submitted',
        FAILURE: 'error'
      },
      after: {
        2000: 'submitted'
      }
    }, // handle SUCCESS
    submitted: {
      type: 'final'
    },
    error: {}
  }
};

const feedbackMachine = Machine(
  {
    initial: 'question',
    context: {
      response: ''
    },
    states: {
      question: {
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
      }
    },
    guards: {
      formValid: (context, event) => {
        return event.value.length > 0;
      }
    }
  }
);

export function Feedback() {
  const [current, send] = useMachine(feedbackMachine);

  console.log(current.value); // state value

  return current.matches('question') ? (
    <QuestionScreen
      onClickGood={() => {
        send('GOOD');
      }}
      onClickBad={() => {
        send('BAD');
      }}
      onClose={() => {
        send('CLOSE');
      }}
    />
  ) : current.matches('form') ? (
    <FormScreen
      currentState={current}
      onSubmit={value => {
        send({ type: 'SUBMIT', value: value });
      }}
      onClose={() => {
        send('CLOSE');
      }}
    />
  ) : current.matches('thanks') ? (
    <ThanksScreen
      response={current.context.response}
      onClose={() => {
        send('CLOSE');
      }}
    />
  ) : current.matches('closed') ? null : null;
}

export function App() {
  return (
    <main className="app">
      <Feedback />
    </main>
  );
}

export default App;
