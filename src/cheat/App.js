import React, { useReducer, useEffect } from 'react';
import { getShortestPaths } from '@xstate/graph';
import { Machine } from 'xstate';
import { useMachine } from '@xstate/react';

export const feedbackMachine = Machine(
  {
    id: 'feedback',
    initial: 'question',
    states: {
      question: {
        invoke: {
          src: 'someService'
        },
        on: {
          GOOD: 'form',
          BAD: 'form',
          CLOSE: 'closed',
          ESC: 'closed'
        },
        meta: {
          message: 'Tell us if you had a good or bad experience.'
        }
      },
      form: {
        on: {
          SUBMIT: 'thanks',
          CLOSE: 'closed',
          ESC: 'closed'
        },
        meta: {
          message: 'Provide feedback and tell us your concerns.'
        }
      },
      thanks: {
        on: {
          CLOSE: 'closed',
          ESC: 'closed'
        },
        meta: {
          message: 'We will then read your feedback.'
        }
      },
      closed: {
        type: 'final',
        meta: {
          message: 'Okay bye'
        }
      }
    }
  },
  {
    services: {
      someService: () =>
        new Promise(res => {
          console.log('this is the specified service');
          res('hello');
        })
    }
  }
);

function useKeyDown(key, onKeyDown) {
  useEffect(() => {
    const handler = e => {
      if (e.key === key) {
        onKeyDown();
      }
    };

    window.addEventListener('keydown', handler);

    return () => window.removeEventListener('keydown', handler);
  }, [onKeyDown, key]);
}

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

function FormScreen({ onSubmit, onClose }) {
  return (
    <Screen
      onSubmit={e => {
        e.preventDefault();
        const { response } = e.target.elements;

        onSubmit({
          value: response
        });
      }}
    >
      <header>Care to tell us why?</header>
      <textarea
        name="response"
        placeholder="Complain here"
        onKeyDown={e => {
          if (e.key === 'Escape') {
            e.stopPropagation();
          }
        }}
      />
      <button>Submit</button>
      <button title="close" type="button" onClick={onClose} />
    </Screen>
  );
}

function ThanksScreen({ onClose }) {
  return (
    <Screen>
      <header>Thanks for your feedback.</header>
      <button title="close" onClick={onClose} />
    </Screen>
  );
}

export function FeedbackScreen({ currentState, send }) {
  const state = currentState.value;

  switch (state) {
    case 'question':
      return (
        <QuestionScreen
          onClickGood={() => send({ type: 'GOOD' })}
          onClickBad={() => send({ type: 'BAD' })}
          onClose={() => send({ type: 'CLOSE' })}
        />
      );
    case 'form':
      return (
        <FormScreen
          onSubmit={value => send({ type: 'SUBMIT', value })}
          onClose={() => send({ type: 'CLOSE' })}
        />
      );
    case 'thanks':
      return <ThanksScreen onClose={() => send({ type: 'CLOSE' })} />;
    case 'closed':
    default:
      return null;
  }
}

export function Feedback({ initialState = 'question' }) {
  const [current, send] = useMachine(Feedback.machine);

  useKeyDown('Escape', () => send({ type: 'CLOSE' }));

  return <FeedbackScreen currentState={current} send={send} />;
}

Feedback.machine = feedbackMachine;

export function App() {
  return (
    <main className="app">
      <Feedback />
    </main>
  );
}

export default App;
