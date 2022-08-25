import { css } from '@emotion/react';
import EmbedFlow from '@formsort/react-embed';
import React, { Fragment, useState, useEffect, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

const FORMSORT_ORIGIN =
  process.env.FORMSORT_ORIGIN || 'https://flow.formsort.com';
const CLIENT = process.env.CLIENT || '';
const FLOW = process.env.FLOW || '';
const VARIANT = process.env.VARIANT || '';

interface LoggedEvent {
  name: string;
  properties: string;
}

const App = () => {
  const [loggedEvents, setLoggedEvents] = useState<LoggedEvent[]>([]);

  // Test useEffect double render
  useEffect(() => {
    document.title = 'Test';
  }, []);

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
    // Test production strict mode
    <StrictMode>
      <Fragment>
        <div
          css={css`
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
          `}
        >
          <h1>Formsort React-Embed Example</h1>
          <EmbedFlow
            clientLabel={CLIENT}
            flowLabel={FLOW}
            variantLabel={VARIANT}
            embedConfig={{
              origin: FORMSORT_ORIGIN,
              style: {
                width: '80%',
                height: '400px',
              },
            }}
            onFlowLoaded={(eventProps) => addToEventLog('FlowLoaded', eventProps)}
            onFlowFinalized={(eventProps) =>
              addToEventLog('FlowFinalized', eventProps)
            }
            onFlowClosed={(eventProps) => addToEventLog('FlowClosed', eventProps)}
            onStepLoaded={(eventProps) => addToEventLog('StepLoaded', eventProps)}
            onStepCompleted={(eventProps) =>
              addToEventLog('StepCompleted', eventProps)
            }
            onRedirect={(eventProps) => {
              addToEventLog('Redirect', eventProps);
              // return `{ cancel: true }` to stay on current page
              return {
                cancel: true,
              };
            }}
          />
          <div
            css={css`
              margin-bottom: 2rem;
            `}
          />
          <div>
            <div>Event Log:</div>
            <ul>
              {loggedEvents.map((event, index) => (
                <div key={event.name + index.toString()}>
                  <li>Event No. {index + 1}:</li>
                  <ul>
                    <li>
                      Event name: <i>{event.name}</i>
                    </li>
                    <li>
                      Event properties:
                      <pre
                        css={css`
                          white-space: pre-line;
                        `}
                      >
                        {event.properties}
                      </pre>
                    </li>
                  </ul>
                </div>
              ))}
            </ul>
          </div>
        </div>
      </Fragment>
    </StrictMode>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />, );
