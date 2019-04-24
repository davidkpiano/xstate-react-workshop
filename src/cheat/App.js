import React, { useReducer, useEffect } from 'react';
import { getSimplePaths } from '@xstate/graph';
import { Machine } from 'xstate';

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
  useKeyDown('Escape', onClose);

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
  useKeyDown('Escape', onClose);

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
  useKeyDown('Escape', onClose);

  return (
    <Screen>
      <header>Thanks for your feedback.</header>
      <button title="close" onClick={onClose} />
    </Screen>
  );
}

function feedbackReducer(state, event) {
  switch (state) {
    case 'question':
      switch (event.type) {
        case 'GOOD':
          return 'thanks';
        case 'BAD':
          return 'form';
        case 'CLOSE':
          return 'closed';
        default:
          return state;
      }
    case 'form':
      switch (event.type) {
        case 'SUBMIT':
          return 'thanks';
        case 'CLOSE':
          return 'closed';
        default:
          return state;
      }
    case 'thanks':
      switch (event.type) {
        case 'CLOSE':
          return 'closed';
        default:
          return state;
      }
    default:
      return state;
  }
}

export function Feedback() {
  const [state, send] = useReducer(feedbackReducer, 'question');

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

export function App() {
  return (
    <main className="app">
      <Feedback />
    </main>
  );
}

export default App;
