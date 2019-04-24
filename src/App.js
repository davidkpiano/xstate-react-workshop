import React, { useReducer } from 'react';

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

const feedbackMachine = {
  initial: 'question',
  states: {
    question: {
      on: {
        GOOD: 'thanks',
        BAD: 'form',
        CLOSE: 'closed'
      }
    },
    form: {
      on: {
        SUBMIT: 'thanks',
        CLOSE: 'closed'
      }
    },
    thanks: {
      on: {
        CLOSE: 'closed'
      }
    },
    closed: {}
  }
};

function feedbackReducer(state, event) {
  const nextState = feedbackMachine.states[state].on[event.type] || state;

  return nextState;
}

export function Feedback() {
  const [current, send] = useReducer(feedbackReducer, 'question');

  return current === 'question' ? (
    <QuestionScreen
      onClickGood={() => {
        send({ type: 'GOOD' });
      }}
      onClickBad={() => {
        send({ type: 'BAD' });
      }}
      onClose={() => {
        send({ type: 'CLOSE' });
      }}
    />
  ) : current === 'form' ? (
    <FormScreen
      onSubmit={value => {
        send({ type: 'SUBMIT' });
      }}
      onClose={() => {
        send({ type: 'CLOSE' });
      }}
    />
  ) : current === 'thanks' ? (
    <ThanksScreen
      onClose={() => {
        send({ type: 'CLOSE' });
      }}
    />
  ) : current === 'closed' ? null : null;
}

export function App() {
  return (
    <main className="app">
      <Feedback />
    </main>
  );
}

export default App;
