/** @jsx jsx */
import { Global, css, jsx } from '@emotion/react';
import FormsortWebEmbed from '@formsort/web-embed-api';
import EmbedFlow from '@formsort/react-embed';
import React, { useEffect, useState, useRef } from 'react';
import ReactDom from 'react-dom';

const FORMSORT_ORIGIN =
  process.env.FORMSORT_ORIGIN || 'https://flow.formsort.com';
const CLIENT = process.env.CLIENT;
const FLOW = process.env.FLOW;
const VARIANT = process.env.VARIANT;

interface LoggedEvent {
  name: string;
  properties: string;
}

const App = () => {
  const [loggedEvents, setLoggedEvents] = useState<LoggedEvent[]>([]);

  const addToEventLog = (
    eventName: string,
    eventProps: { [key: string]: any }
  ) => {
    setLoggedEvents((events) => [
      ...events,
      { name: eventName, properties: JSON.stringify(eventProps) },
    ]);
  };

  return (
    <>
      <Global
        styles={css`
          iframe {
            width: 100%;
            height: 350px;
            margin-bottom: 1rem;
          }
        `}
      />
      <div
        css={css`
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        `}
      >
        <h1>Formsort Embed Example</h1>
        <EmbedFlow
          clientLabel={CLIENT}
          flowLabel={FLOW}
          variantLabel={VARIANT}
          embedConfig={{
            origin: FORMSORT_ORIGIN,
            style: {
              width: '50%',
            },
          }}
          FlowLoaded={(eventProps) =>
            addToEventLog('StepCompleted', eventProps)
          }
          StepCompleted={(eventProps) =>
            addToEventLog('StepCompleted', eventProps)
          }
        />
        <div
          css={css`
            width: 50%;
          `}
        >
          <div>Event Log:</div>
          <ul>
            {loggedEvents.map((event, index) => (
              <div key={event.name}>
                <li>Event No. ${index + 1}:</li>
                <ul>
                  <li>
                    Event name: <i>${event.name}</i>
                  </li>
                  <li>
                    Event properties:
                    <pre
                      css={css`
                        white-space: pre-line;
                      `}
                    >
                      ${event.properties}
                    </pre>
                  </li>
                </ul>
              </div>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
ReactDom.render(<App />, document.getElementById('root'));
