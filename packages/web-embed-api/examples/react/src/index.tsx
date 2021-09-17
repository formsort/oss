/** @jsx jsx */
import { Global, css, jsx } from '@emotion/react';
import FormsortWebEmbed from '@formsort/web-embed-api';
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
  const formsortEmbedRef = useRef<HTMLDivElement>(null);

  const addToEventLog = (
    eventName: string,
    eventProps: { [key: string]: any }
  ) => {
    setLoggedEvents((events) => [
      ...events,
      { name: eventName, properties: JSON.stringify(eventProps) },
    ]);
  };

  useEffect(() => {
    // Embed Formsort in the page
    const formsortEmbedElem = formsortEmbedRef.current;

    const embed = FormsortWebEmbed(formsortEmbedElem, {
      origin: FORMSORT_ORIGIN,
    });

    // Add analytics events to event log
    for (const event of [
      'FlowLoaded',
      'FlowFinalized',
      'FlowClosed',
      'StepLoaded',
      'StepCompleted',
    ] as const) {
      embed.addEventListener(event, (eventProps) =>
        addToEventLog(event, eventProps)
      );
    }

    // Add redirect event to event log
    embed.addEventListener('redirect', (eventProps) => {
      addToEventLog('redirect', eventProps);
      // Cancel redirect to stay on the current page
      return {
        cancel: true,
      };
    });

    if (!CLIENT || !FLOW || !VARIANT) {
      window.alert(
        'Client, Flow and Variant must be provided in the .env file.'
      );
      return;
    }

    embed.loadFlow(CLIENT, FLOW, VARIANT);
  }, []);

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
        <div
          ref={formsortEmbedRef}
          css={css`
            width: 50%;
          `}
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
