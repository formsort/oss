import FormsortWebEmbed, {
  SupportedAnalyticsEvent,
} from '@formsort/web-embed-api';
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators';
import { createRef, ref } from 'lit/directives/ref';

const FORMSORT_ORIGIN =
  process.env.FORMSORT_ORIGIN || 'https://flow.formsort.com';
const CLIENT = process.env.CLIENT;
const FLOW = process.env.FLOW;
const VARIANT = process.env.VARIANT;

interface LoggedEvent {
  name: string;
  properties: string;
}

/* eslint-disable @typescript-eslint/no-unused-vars */
@customElement('root-element')
class RootElement extends LitElement {
  static styles = css`
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
    }
    .iframe-container {
      width: 50%;
    }
    iframe {
      width: 100%;
      height: 350px;
      margin-bottom: 1rem;
    }
    #event-list {
      width: 50%;
    }
    .event-properties {
      white-space: pre-line;
    }
  `;
  /* eslint-enable @typescript-eslint/no-unused-vars */

  @state()
  loggedEvents: LoggedEvent[] = [];

  formsortEmbedRef = createRef<HTMLElement>();

  private addToEventLog(eventName: string, eventProps: { [key: string]: any }) {
    this.loggedEvents = [
      ...this.loggedEvents,
      { name: eventName, properties: JSON.stringify(eventProps) },
    ];
  }

  firstUpdated() {
    // Embed Formsort in the page
    const formsortEmbedElem = this.formsortEmbedRef.value!;
    const embed = FormsortWebEmbed(formsortEmbedElem, {
      origin: FORMSORT_ORIGIN,
    });

    // Add analytics events to event log
    for (const event of Object.values(SupportedAnalyticsEvent)) {
      embed.addEventListener(event, (eventProps) =>
        this.addToEventLog(event, eventProps)
      );
    }

    // Add redirect event to event log
    embed.addEventListener('redirect', (eventProps) => {
      this.addToEventLog('redirect', eventProps);
      // Cancel redirect to stay on the current page
      return {
        cancel: true,
      };
    });

    if (CLIENT && FLOW && VARIANT) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      embed.loadFlow(CLIENT, FLOW, VARIANT);
    } else {
      window.alert(
        'Client, Flow and Variant must be provided in the .env file.'
      );
    }
  }

  render() {
    return html`<div class="container">
      <h1>Formsort Embed Example</h1>
      <div class="iframe-container" ${ref(this.formsortEmbedRef)}></div>
      <div id="event-list">
        <div>Event Log:</div>
        <ul>
          ${this.loggedEvents.map(
            (event, index) => html`
              <li>Event No. ${index + 1}:</li>
              <ul>
                <li>Event name: <i>${event.name}</i></li>
                <li>
                  Event properties:
                  <pre class="event-properties">${event.properties}</pre>
                </li>
              </ul>
            `
          )}
        </ul>
      </div>
    </div>`;
  }
}
