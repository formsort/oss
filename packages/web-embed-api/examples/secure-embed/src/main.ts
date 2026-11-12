import {
  type FormsortInitialAnswers,
  FormsortSecureWebEmbed,
  SupportedAnalyticsEvent,
} from '@formsort/web-embed-api';

// 1. The flow to load. Set these in `.env` (see `.env.example`).
const CLIENT_LABEL = import.meta.env.VITE_FORMSORT_CLIENT_LABEL;
const FLOW_LABEL = import.meta.env.VITE_FORMSORT_FLOW_LABEL;
const VARIANT_LABEL = import.meta.env.VITE_FORMSORT_VARIANT_LABEL;
const VARIANT_REVISION_UUID = import.meta.env
  .VITE_FORMSORT_VARIANT_REVISION_UUID;

// 2. The answers to prefill. Each key is the schema key of a question in your
//    variant. Change these to match your own questions.
const initialAnswers: FormsortInitialAnswers = {
  // A simple question: schema key -> value.
  previous_visit_reason: 'Annual check-up',

  // A compound question: an object with one value per sub-question.
  name: {
    first_name: 'Olivia',
    last_name: 'Smith',
  },

  // A compound question that allows multiple entries: an array of objects,
  // one object per entry.
  medicines: [
    { medication_name: 'Ibuprofen', daily_dose: 400 },
    { medication_name: 'Vitamin D', daily_dose: 1000 },
  ],
};

// 3. Create the embed once. It adds an iframe inside the container.
const embed = FormsortSecureWebEmbed(
  document.querySelector<HTMLElement>('#formsort-embed')!,
  { style: { width: '100%', height: '640px' } }
);

// 4. Listen to events from the flow. Add listeners before you load the flow.

// The flow is ready. The payload tells you which variant revision loaded.
embed.addEventListener(SupportedAnalyticsEvent.FlowLoaded, (payload) => {
  showStatus(`Loaded revision ${payload.variantRevisionUuid}.`);
});

// The responder finished the flow.
embed.addEventListener(SupportedAnalyticsEvent.FlowFinalized, () => {
  showStatus('The responder finished the flow.');
});

// Log every flow event: FlowLoaded, StepLoaded, StepCompleted,
// ResponderStateUpdated, FlowFinalized and FlowClosed. Each payload has the
// responder, the loaded revision and, if your domain is allowed to receive
// them, the answers.
for (const eventName of Object.values(SupportedAnalyticsEvent)) {
  embed.addEventListener(eventName, (payload) => logEvent(eventName, payload));
}

// The flow wants to send the responder to another URL.
embed.addEventListener('redirect', (payload) => {
  logEvent('redirect', payload);
  // Return { cancel: true } to stay on this page. Return nothing to let the
  // redirect happen.
  return { cancel: true };
});

// 5. Load the flow. Call `loadFormsortFlow` again to reload it, for example
//    with another revision. The "Load flow" button on this page does that.
function loadFormsortFlow(variantRevisionUuid?: string) {
  embed.loadFlow(
    CLIENT_LABEL,
    FLOW_LABEL,
    VARIANT_LABEL,
    undefined, // responderUuid: set it to continue an existing responder
    initialAnswers,
    undefined, // formsortEnv: for example 'staging'. Leave empty for production.
    variantRevisionUuid // Leave empty to load the latest published revision.
  );
}

if (isConfigured()) {
  loadFormsortFlow(VARIANT_REVISION_UUID || undefined);
}

// Everything below only drives this demo page.

const eventsEl = document.querySelector<HTMLOListElement>('#events')!;
const revisionInput = document.querySelector<HTMLInputElement>('#revision')!;

revisionInput.value = VARIANT_REVISION_UUID ?? '';

document.querySelector('#answers')!.textContent = JSON.stringify(
  initialAnswers,
  null,
  2
);

document.querySelector('#controls')!.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!isConfigured()) {
    return;
  }
  const revision = revisionInput.value.trim() || undefined;
  showStatus(
    revision
      ? `Loading revision ${revision}…`
      : 'Loading the latest published revision…'
  );
  loadFormsortFlow(revision);
});

// Checks that `.env` has real labels, not empty values or <placeholders>.
function isConfigured() {
  const configured = [CLIENT_LABEL, FLOW_LABEL].every(
    (label) => label && !label.startsWith('<')
  );
  if (!configured) {
    showStatus(
      'Copy .env.example to .env, set your client and flow labels, then restart the dev server.'
    );
  }
  return configured;
}

function showStatus(message: string) {
  document.querySelector('#status')!.textContent = message;
}

function logEvent(eventName: string, payload?: object) {
  const summaryEl = document.createElement('summary');
  summaryEl.textContent = `${new Date().toLocaleTimeString()}  ${eventName}`;

  const payloadEl = document.createElement('pre');
  payloadEl.textContent = JSON.stringify(payload ?? {}, null, 2);

  const detailsEl = document.createElement('details');
  detailsEl.append(summaryEl, payloadEl);

  const itemEl = document.createElement('li');
  itemEl.append(detailsEl);
  eventsEl.prepend(itemEl);
}
