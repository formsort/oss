# @formsort/react-embed

Embed [Formsort](https://formsort.com) flows within react components.

This is a handy wrapper around [@formsort/web-embed-api](https://github.com/formsort/oss/tree/master/packages/web-embed-api).

**Important note:** This package is intended for use in React web applications. If you're looking to embed Formsort flows in React Native applications, please see [React native embed guide](https://github.com/formsort/oss/blob/master/packages/react-embed/ReactNativeEmbed.md).

- [Installation](#installation)
- [Before you start](#before-you-start)
- [Choose a component](#choose-a-component)
- [Usage](#usage)
- [Pass answers](#pass-answers)
- [Load a specific variant revision](#load-a-specific-variant-revision)
- [Events](#events)
- [Migrate to `SecureEmbedFlow`](#migrate-to-secureembedflow)
- [Props](#props)

## Installation

Add `@formsort/react-embed` to your project by executing `pnpm add @formsort/react-embed`, `yarn add @formsort/react-embed`, or `npm install @formsort/react-embed`.

## Before you start

Formsort only loads a flow in an iframe on domains that are allowed to embed
it. If your app's domain is not allowed, the iframe stays empty and the browser
console shows a `frame-ancestors` Content Security Policy error. To test on
your computer, see
[Before you start](https://github.com/formsort/oss/tree/master/packages/web-embed-api#before-you-start)
in the web-embed-api README.

## Choose a component

This package has two components:

- `EmbedFlow` (the default export) sends answers to the flow in the URL.
- `SecureEmbedFlow` sends answers in the body of a POST request, so they never
  appear in a URL.

Both components have the same `embedConfig` and event props.

|                                                             | `EmbedFlow`                   | `SecureEmbedFlow`           |
| ----------------------------------------------------------- | ----------------------------- | --------------------------- |
| Prop for prefilled answers                                  | `queryParams`                 | `initialAnswers`            |
| Where prefilled answers go                                  | In the URL                    | In the request body         |
| Simple answers                                              | Yes                           | Yes                         |
| Compound answers                                            | Yes, as `key[sub_key]` params | Yes, as an object           |
| Repeating compound answers (compound with multiple entries) | **No**                        | Yes, as an array of objects |
| `responderUuid`, `formsortEnv` and `variantRevisionUuid`    | Yes                           | Yes                         |
| Other query params                                          | Yes, with `queryParams`       | No                          |

**Use `SecureEmbedFlow` if you prefill answers.** URLs are copied to browser
history, server logs, analytics tools and the `Referer` header of other
requests. When answers contain personal or health data, you don't want them in
any of these places. `SecureEmbedFlow` keeps answers out of URLs, and it is the
only component that can prefill repeating compound questions. For more details,
see
[Secure embed](https://github.com/formsort/oss/tree/master/packages/web-embed-api#secure-embed)
in the web-embed-api README.

If you use `EmbedFlow` today, see
[Migrate to `SecureEmbedFlow`](#migrate-to-secureembedflow).

## Usage

### `SecureEmbedFlow`

```tsx
import { SecureEmbedFlow } from '@formsort/react-embed';

const IntakeForm = () => (
  <SecureEmbedFlow
    clientLabel="<client-label>"
    flowLabel="<flow-label>"
    variantLabel="<variant-label>"
    initialAnswers={{
      previous_visit_reason: 'Annual check-up',
      name: { first_name: 'Olivia', last_name: 'Smith' },
      medicines: [
        { medication_name: 'Ibuprofen', daily_dose: 400 },
        { medication_name: 'Vitamin D', daily_dose: 1000 },
      ],
    }}
    embedConfig={{ style: { width: '100%', height: '640px' } }}
    onFlowLoaded={(payload) => {
      console.log('Loaded revision', payload.variantRevisionUuid);
    }}
  />
);
```

### `EmbedFlow`

```tsx
import EmbedFlow from '@formsort/react-embed';

const IntakeForm = () => (
  <EmbedFlow
    clientLabel="<client-label>"
    flowLabel="<flow-label>"
    variantLabel="<variant-label>"
    embedConfig={{ style: { width: '100%', height: '100%' } }}
  />
);
```

### Reload the flow

Both components load the flow once, when they mount. If you change a prop
later, such as `initialAnswers` or `variantRevisionUuid`, the flow does not
reload. To reload it, give the component a `key` that changes with those props.
React then mounts a new embed:

```tsx
<SecureEmbedFlow
  key={variantRevisionUuid}
  clientLabel="<client-label>"
  flowLabel="<flow-label>"
  variantLabel="<variant-label>"
  variantRevisionUuid={variantRevisionUuid}
/>
```

If the responder closes the flow, the component renders nothing.

## Pass answers

`SecureEmbedFlow` takes answers in the `initialAnswers` prop. It is an object.
Each key is the schema key of a question in your variant. The value depends on
the type of question:

| Question                                          | Value                                            | Example                                                          |
| ------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------- |
| Simple question (text, number, email, ...)        | A string, number or boolean                      | `previous_visit_reason: 'Annual check-up'`                       |
| Question with more than one answer (multi-select) | An array of values                               | `colors: ['gray', 'brown']`                                      |
| Compound question                                 | An object, keyed by the sub-question schema keys | `name: { first_name: 'Olivia', last_name: 'Smith' }`             |
| Compound question that allows multiple entries    | An array of objects, one object per entry        | `medicines: [{ medication_name: 'Ibuprofen', daily_dose: 400 }]` |

Things to know:

- Formsort converts each value to the type of its question. For example,
  `daily_dose: 400` arrives as the number `400`.
- Values that are `undefined` are not sent. Values that are `null` are sent as
  empty values.
- Empty arrays and empty objects are not sent, so you can't use them to clear
  an answer.
- In TypeScript, the type of the prop is `SecureEmbedFlowProps['initialAnswers']`.

For how the answers are encoded in the request, see
[Pass answers](https://github.com/formsort/oss/tree/master/packages/web-embed-api#pass-answers)
in the web-embed-api README.

## Load a specific variant revision

A variant has revisions, and each revision has a UUID. By default, the
components load the latest published revision. To load a specific revision,
pass its UUID in the `variantRevisionUuid` prop. Both components support it.

```tsx
<SecureEmbedFlow
  clientLabel="<client-label>"
  flowLabel="<flow-label>"
  variantLabel="<variant-label>"
  variantRevisionUuid="<variant-revision-uuid>"
/>
```

To check which revision loaded, and to get the UUID of the latest one:

- Read `variantRevisionUuid` from the payload of `onFlowLoaded`.
- Or add `{{variant_revision_uuid}}` to the label of a question, such as an
  informational question.

To switch revisions while the component is on the page, see
[Reload the flow](#reload-the-flow).

## Events

Pass event listeners as props: `onFlowLoaded`, `onStepLoaded`,
`onStepCompleted`, `onFlowFinalized`, `onFlowClosed` and `onRedirect`. See
[Props](#props) for what each one means.

The flow event props get a payload object that includes:

```ts
{
  answers?: { [schemaKey: string]: any }; // See the note below
  responder: {
    responderUuid: string;
    sessionUuid: string;
    isReturningResponder?: boolean;
  };
  variantRevisionUuid: string; // The revision that is loaded
  stepId?: string; // onStepLoaded and onStepCompleted only
  stepIndex?: number; // onStepLoaded and onStepCompleted only
}
```

`answers` is only included if your domain is allowed to receive answers from
the flow. Otherwise, it is `undefined`.

`onRedirect` gets `url`, `answers` and `responder`. Return `{ cancel: true }`
to stop the redirect, for example to handle it with your router.

For more details, see
[Event listeners](https://github.com/formsort/oss/tree/master/packages/web-embed-api#event-listeners)
in the web-embed-api README.

## Migrate to `SecureEmbedFlow`

You change two things: the component, and the `queryParams` prop. All other
props work the same way.

### 1. Update the package

Use version 3.7.0 or later. `SecureEmbedFlow` was added in 3.6.0, the
`formsortEnv` prop in 3.6.1, and the `variantRevisionUuid` prop in 3.7.0.

```shell
npm install @formsort/react-embed@^3.7.0
```

### 2. Use `SecureEmbedFlow`

```diff
- import EmbedFlow from '@formsort/react-embed';
+ import { SecureEmbedFlow } from '@formsort/react-embed';
```

Replace `<EmbedFlow` with `<SecureEmbedFlow`. Keep `clientLabel`,
`flowLabel`, `variantLabel`, `responderUuid`, `formsortEnv`,
`variantRevisionUuid`, `embedConfig` and the event props as they are.

### 3. Move `queryParams` to `initialAnswers`

`SecureEmbedFlow` does not take `queryParams`. Move each entry:

| `queryParams` entry                                                              | `SecureEmbedFlow` prop                                                                     |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `['previous_visit_reason', 'Annual check-up']`                                   | `initialAnswers={{ previous_visit_reason: 'Annual check-up' }}`                            |
| `['name[first_name]', 'Olivia']`, `['name[last_name]', 'Smith']`                 | `initialAnswers={{ name: { first_name: 'Olivia', last_name: 'Smith' } }}`                  |
| `['responderUuid', ...]`, `['formsortEnv', ...]`, `['variantRevisionUuid', ...]` | The `responderUuid`, `formsortEnv` and `variantRevisionUuid` props                         |
| Any other query param                                                            | Not supported. If you rely on other query params, ask Formsort support before you migrate. |

Before:

```tsx
import EmbedFlow from '@formsort/react-embed';

<EmbedFlow
  clientLabel="<client-label>"
  flowLabel="<flow-label>"
  variantLabel="<variant-label>"
  responderUuid="<responder-uuid>"
  variantRevisionUuid="<variant-revision-uuid>"
  queryParams={[
    ['previous_visit_reason', 'Annual check-up'],
    ['name[first_name]', 'Olivia'],
    ['name[last_name]', 'Smith'],
    // You can't prefill a compound question that allows multiple entries,
    // such as `medicines`, with query params.
  ]}
  onFlowFinalized={handleFinalized}
/>;
```

After:

```tsx
import { SecureEmbedFlow } from '@formsort/react-embed';

<SecureEmbedFlow
  clientLabel="<client-label>"
  flowLabel="<flow-label>"
  variantLabel="<variant-label>"
  responderUuid="<responder-uuid>"
  variantRevisionUuid="<variant-revision-uuid>"
  initialAnswers={{
    previous_visit_reason: 'Annual check-up',
    name: { first_name: 'Olivia', last_name: 'Smith' },
    // Now you can prefill compound questions that allow multiple entries.
    medicines: [
      { medication_name: 'Ibuprofen', daily_dose: 400 },
      { medication_name: 'Vitamin D', daily_dose: 1000 },
    ],
  }}
  onFlowFinalized={handleFinalized}
/>;
```

### 4. Check the result

1. Load your app. The flow shows the prefilled answers.
2. In your browser's developer tools, open the **Network** tab and find the
   request to `https://<client>.formsort.app/flow/...`. It is a `POST` request
   with form data, and its URL contains no answers.
3. Your event props still run. The `variantRevisionUuid` in the `onFlowLoaded`
   payload is the revision you asked for.

## Props

### `EmbedFlow` props

| Prop name           | Description                                                                                                                                                     | Required | Example values                                             |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------- |
| clientLabel         | Your Formsort client label                                                                                                                                      | yes      | `"<client-label>"`                                         |
| flowLabel           | The flow to load                                                                                                                                                | yes      | `"<flow-label>"`                                           |
| variantLabel        | The variant to load. If you leave it out, Formsort picks a variant.                                                                                             | no       | `"<variant-label>"`                                        |
| responderUuid       | Continue as an existing responder, with their saved answers. Event payloads include it as `responder.responderUuid`.                                            | no       | `"<responder-uuid>"`                                       |
| formsortEnv         | The Formsort environment label for integrations. Leave it out for production.                                                                                   | no       | `"staging"`                                                |
| variantRevisionUuid | Load this variant revision instead of the latest published one. See [Load a specific variant revision](#load-a-specific-variant-revision).                      | no       | `"<variant-revision-uuid>"`                                |
| queryParams         | Query params to add to the flow URL, for example to prefill answers                                                                                             | no       | `[['first_name', 'Olivia'], ['name[last_name]', 'Smith']]` |
| embedConfig         | [Configuration](https://github.com/formsort/oss/tree/master/packages/web-embed-api#config) passed to the underlying web embed, such as `style` and `autoHeight` | no       | `{ style: { height: '100%' } }`                            |
| onFlowLoaded        | Called when the flow has loaded. See [event listener](https://github.com/formsort/oss/tree/master/packages/web-embed-api#flowloaded).                           | no       | `(payload) => { console.log('flow loaded') }`              |
| onFlowClosed        | Called when the responder closes the flow. See [event listener](https://github.com/formsort/oss/tree/master/packages/web-embed-api#flowclosed).                 | no       | `() => { console.log('flow closed') }`                     |
| onFlowFinalized     | Called when the responder finishes the flow. See [event listener](https://github.com/formsort/oss/tree/master/packages/web-embed-api#flowfinalized).            | no       | `(payload) => { console.log('flow finalized') }`           |
| onStepLoaded        | Called when a step loads. See [event listener](https://github.com/formsort/oss/tree/master/packages/web-embed-api#steploaded).                                  | no       | `(payload) => { console.log('step loaded') }`              |
| onStepCompleted     | Called when a step is completed. See [event listener](https://github.com/formsort/oss/tree/master/packages/web-embed-api#stepcompleted).                        | no       | `(payload) => { console.log('step completed') }`           |
| onRedirect          | Called when the flow redirects. See [event listener](https://github.com/formsort/oss/tree/master/packages/web-embed-api#redirect).                              | no       | `({ url }) => { console.log('redirecting to:', url) }`     |

### `SecureEmbedFlow` props

`SecureEmbedFlow` takes the same props as `EmbedFlow`, except `queryParams`.
It also takes this prop:

| Prop name      | Description                                                                      | Required | Example values                                           |
| -------------- | -------------------------------------------------------------------------------- | -------- | -------------------------------------------------------- |
| initialAnswers | Answers to prefill, sent in the request body. See [Pass answers](#pass-answers). | no       | `{ name: { first_name: 'Olivia', last_name: 'Smith' } }` |

`SecureEmbedFlow` sends `responderUuid` and `initialAnswers` in the request
body. It adds `formsortEnv` and `variantRevisionUuid` to the URL.
