import React, { useReducer, useState } from 'react';
import { Machine, interpret, assign } from 'xstate';
import { useMachine } from '@xstate/react';
import { feedbackMachine } from './feedbackMachine';

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

function QuestionScreen({ onClickGood, onClickBad, onClose, currentState }) {
  return (
    <Screen>
      {currentState.context.dog ? (
        <img src={currentState.context.dog} height={200} />
      ) : null}
      <header>How was your experience with this dog?</header>
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
          {currentState.context.error ? (
            <div style={{ color: 'red' }}>{currentState.context.error}</div>
          ) : null}
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
        <div>
          Submitting... <button title="close" type="button" onClick={onClose} />
        </div>
      ) : null}
    </Screen>
  );
}

function ThanksScreen({ onClose, currentState }) {
  const { message } = currentState.context.feedback
    ? currentState.context.feedback
    : { message: 'good!' };

  return (
    <Screen>
      <header>Thanks for your feedback: {message}</header>
      <button title="close" onClick={onClose} />
    </Screen>
  );
}

export function Feedback() {
  const [current, send] = useMachine(feedbackMachine);

  console.log(current.value); // state value

  return current.matches('question') ? (
    <QuestionScreen
      currentState={current}
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
      currentState={current}
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
