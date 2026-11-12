# @formsort/web-embed-api

Embed [Formsort](https://formsort.com) flows within other webpages, with communication between the embed and the parent page.

If you're using React, see [@formsort/react-embed](https://github.com/formsort/oss/tree/master/packages/react-embed), a handy wrapper around this package. Its README covers the secure embed and migration for React.

- [Install](#install)
- [Before you start](#before-you-start)
- [Choose an embed](#choose-an-embed)
- [Secure embed](#secure-embed)
- [Migrate to the secure embed](#migrate-to-the-secure-embed)
- [API reference](#api-reference)
- [Examples](#examples)
- [Development](#development)

## Install

```shell
pnpm add @formsort/web-embed-api
```

```shell
npm install @formsort/web-embed-api --save
```

## Before you start

Formsort only loads a flow in an iframe on domains that are allowed to embed
it. If your page's domain is not allowed, the iframe stays empty and the
browser console shows a `frame-ancestors` Content Security Policy error.

`http://localhost` is usually not allowed. To test on your computer, open your
local server through an HTTPS tunnel on an allowed domain. The
[secure embed example](https://github.com/formsort/oss/tree/master/packages/web-embed-api/examples/secure-embed#why-a-tunnel) shows how to do this
with a Cloudflare quick tunnel.

## Choose an embed

This package has two embeds:

- `FormsortWebEmbed` (the default export)
- `FormsortSecureWebEmbed`

Both add an iframe to your page and load your flow in it. They have the same
configuration, methods and events. They are different in how they send data,
such as prefilled answers, to the flow.

|                                                             | `FormsortWebEmbed`            | `FormsortSecureWebEmbed`             |
| ----------------------------------------------------------- | ----------------------------- | ------------------------------------ |
| How it loads the flow                                       | Sets the iframe URL           | Sends a POST request into the iframe |
| Where prefilled answers go                                  | In the URL                    | In the request body                  |
| Simple answers                                              | Yes                           | Yes                                  |
| Compound answers                                            | Yes, as `key[sub_key]` params | Yes, as an object                    |
| Repeating compound answers (compound with multiple entries) | **No**                        | Yes, as an array of objects          |
| Responder UUID, Formsort environment, variant revision      | As query params               | As `loadFlow` arguments              |
| Other query params                                          | Yes                           | No                                   |

**Use `FormsortSecureWebEmbed` if you prefill answers.** It keeps answers out of
URLs, and it is the only embed that can prefill repeating compound questions.
If you are using `FormsortWebEmbed` today, see
[Migrate to the secure embed](#migrate-to-the-secure-embed).

## Secure embed

### How it works

When you call `loadFlow`, `FormsortSecureWebEmbed` adds a hidden form to your
page and submits it into the iframe as a POST request. The answers and the
responder UUID are in the body of that request. Only the Formsort environment
and the variant revision UUID are added to the URL.

This matters because URLs are copied to many places: browser history, server
and proxy logs, analytics tools, and the `Referer` header of other requests.
When answers contain personal or health data, you don't want them in any of
these places. URLs also have length limits, which large sets of answers can
exceed.

> **Note:** The secure embed keeps answers out of URLs. It does not control
> who can open your flow, and the answers are still visible in your page. Only
> pass data that the person using the page may see.

### Usage

```ts
import {
  FormsortSecureWebEmbed,
  SupportedAnalyticsEvent,
} from '@formsort/web-embed-api';

const embed = FormsortSecureWebEmbed(
  document.getElementById('formsort-container')!,
  { style: { width: '100%', height: '640px' } }
);

embed.addEventListener(SupportedAnalyticsEvent.FlowLoaded, (payload) => {
  console.log('Loaded revision', payload.variantRevisionUuid);
});

embed.loadFlow(
  '<client-label>',
  '<flow-label>',
  '<variant-label>',
  undefined, // responderUuid
  {
    previous_visit_reason: 'Annual check-up',
    name: { first_name: 'Olivia', last_name: 'Smith' },
    medicines: [
      { medication_name: 'Ibuprofen', daily_dose: 400 },
      { medication_name: 'Vitamin D', daily_dose: 1000 },
    ],
  }
);
```

For a complete, runnable page, see the
[secure embed example](https://github.com/formsort/oss/tree/master/packages/web-embed-api/examples/secure-embed).

### `loadFlow` arguments

```ts
loadFlow(
  clientLabel: string,
  flowLabel: string,
  variantLabel?: string,
  responderUuid?: string,
  initialAnswers?: FormsortInitialAnswers,
  formsortEnv?: string,
  variantRevisionUuid?: string
) => void;
```

The arguments are positional. To skip an optional argument, pass `undefined`.

| Argument              | Required | Sent in            | Description                                                                                                                                |
| --------------------- | -------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `clientLabel`         | Yes      | URL                | Your Formsort client label.                                                                                                                |
| `flowLabel`           | Yes      | URL                | The flow to load.                                                                                                                          |
| `variantLabel`        | No       | URL                | The variant to load. If you leave it out, Formsort picks a variant (see [`loadFlow`](#loadflow)).                                          |
| `responderUuid`       | No       | Request body       | Continue as an existing responder, with their saved answers. Event payloads include it as `responder.responderUuid`.                       |
| `initialAnswers`      | No       | Request body       | Answers to prefill. See [Pass answers](#pass-answers).                                                                                     |
| `formsortEnv`         | No       | URL (query string) | The Formsort environment label for integrations, for example `staging`. Leave it out for production.                                       |
| `variantRevisionUuid` | No       | URL (query string) | Load this variant revision instead of the latest published one. See [Load a specific variant revision](#load-a-specific-variant-revision). |

You can call `loadFlow` again, for example with other answers or another
revision. It sends a new request into the same iframe. This works until you
call `unloadFlow` or the responder closes the flow (the `FlowClosed` event),
because both remove the iframe. After that, create a new embed.

### Pass answers

`initialAnswers` is an object. Each key is the schema key of a question in
your variant. The value depends on the type of question:

| Question                                          | Value                                            | Example                                                          |
| ------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------- |
| Simple question (text, number, email, ...)        | A string, number or boolean                      | `previous_visit_reason: 'Annual check-up'`                       |
| Question with more than one answer (multi-select) | An array of values                               | `colors: ['gray', 'brown']`                                      |
| Compound question                                 | An object, keyed by the sub-question schema keys | `name: { first_name: 'Olivia', last_name: 'Smith' }`             |
| Compound question that allows multiple entries    | An array of objects, one object per entry        | `medicines: [{ medication_name: 'Ibuprofen', daily_dose: 400 }]` |

Things to know:

- The values are sent as form fields, which are text. Formsort converts each
  value to the type of its question. For example, `daily_dose: 400` arrives as
  the number `400`.
- Values that are `undefined` are not sent. Values that are `null` are sent as
  empty values.
- Empty arrays and empty objects are not sent, so you can't use them to clear
  an answer.
- The `FormsortInitialAnswers` TypeScript type describes the accepted values.

<details>
<summary>How the answers are encoded in the request body</summary>

Nested values use bracket notation. Arrays of simple values are sent as
repeated fields with the same name.

```text
previous_visit_reason=Annual check-up
name[first_name]=Olivia
name[last_name]=Smith
medicines[0][medication_name]=Ibuprofen
medicines[0][daily_dose]=400
colors=gray
colors=brown
```

</details>

### Load a specific variant revision

A variant has revisions, and each revision has a UUID. By default, the embed
loads the latest published revision. To load a specific revision, pass its UUID
as `variantRevisionUuid`. For example, you can keep responders on a revision
you have tested while you work on the next one.

```ts
embed.loadFlow(
  '<client-label>',
  '<flow-label>',
  '<variant-label>',
  undefined, // responderUuid
  initialAnswers,
  undefined, // formsortEnv
  '<variant-revision-uuid>'
);
```

To check which revision loaded, and to get the UUID of the latest one:

- Read `variantRevisionUuid` from the payload of a flow event, such as
  [`FlowLoaded`](#flowloaded).
- Or add `{{variant_revision_uuid}}` to the label of a question, such as an
  informational question.

## Migrate to the secure embed

You change three things: the import, the function that creates the embed, and
the `loadFlow` call. Configuration, events, `setSize` and `unloadFlow` work the
same way.

### 1. Update the package

Use version 2.12.0 or later. `FormsortSecureWebEmbed` was added in 2.11.0,
the `formsortEnv` argument in 2.11.1, and the `variantRevisionUuid` argument in
2.12.0.

```shell
npm install @formsort/web-embed-api@^2.12.0
```

### 2. Create a secure embed

```diff
- import FormsortWebEmbed from '@formsort/web-embed-api';
+ import { FormsortSecureWebEmbed } from '@formsort/web-embed-api';

- const embed = FormsortWebEmbed(container, config);
+ const embed = FormsortSecureWebEmbed(container, config);
```

### 3. Move query params to `loadFlow` arguments

`FormsortSecureWebEmbed` does not take a `queryParams` array. Move each query
param to an argument:

| `queryParams` entry with `FormsortWebEmbed`          | Argument of `FormsortSecureWebEmbed`'s `loadFlow`                                                                           |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `['responderUuid', '<responder-uuid>']`              | 4th: `responderUuid`                                                                                                        |
| `['previous_visit_reason', 'Annual check-up']`       | 5th: `initialAnswers: { previous_visit_reason: 'Annual check-up' }`                                                         |
| `['name[first_name]', 'Olivia']`                     | 5th: `initialAnswers: { name: { first_name: 'Olivia' } }`                                                                   |
| `['formsortEnv', 'staging']`                         | 6th: `formsortEnv`                                                                                                          |
| `['variantRevisionUuid', '<variant-revision-uuid>']` | 7th: `variantRevisionUuid`                                                                                                  |
| Any other query param                                | Not supported. Put answers in `initialAnswers`. If you rely on other query params, ask Formsort support before you migrate. |

Before:

```ts
import FormsortWebEmbed from '@formsort/web-embed-api';

const embed = FormsortWebEmbed(document.getElementById('formsort-container')!);

embed.loadFlow('<client-label>', '<flow-label>', '<variant-label>', [
  ['responderUuid', '<responder-uuid>'],
  ['variantRevisionUuid', '<variant-revision-uuid>'],
  ['previous_visit_reason', 'Annual check-up'],
  ['name[first_name]', 'Olivia'],
  ['name[last_name]', 'Smith'],
  // You can't prefill a compound question that allows multiple entries,
  // such as `medicines`, with query params.
]);
```

After:

```ts
import { FormsortSecureWebEmbed } from '@formsort/web-embed-api';

const embed = FormsortSecureWebEmbed(
  document.getElementById('formsort-container')!
);

embed.loadFlow(
  '<client-label>',
  '<flow-label>',
  '<variant-label>',
  '<responder-uuid>',
  {
    previous_visit_reason: 'Annual check-up',
    name: { first_name: 'Olivia', last_name: 'Smith' },
    // Now you can prefill compound questions that allow multiple entries.
    medicines: [
      { medication_name: 'Ibuprofen', daily_dose: 400 },
      { medication_name: 'Vitamin D', daily_dose: 1000 },
    ],
  },
  undefined, // formsortEnv
  '<variant-revision-uuid>'
);
```

### 4. Check the result

1. Load your page. The flow shows the prefilled answers.
2. In your browser's developer tools, open the **Network** tab and find the
   request to `https://<client>.formsort.app/flow/...`. It is a `POST` request
   with form data, and its URL contains no answers.
3. Your event listeners still run. The `variantRevisionUuid` in the
   `FlowLoaded` payload is the revision you asked for.

## API reference

### `FormsortWebEmbed(rootEl: HTMLElement, config?: IFormsortWebEmbedConfig)`

Creates a Formsort iframe as a child of `rootEl`. Its `loadFlow` puts query
params in the iframe URL.

```ts
import FormsortWebEmbed from '@formsort/web-embed-api';

const embed = FormsortWebEmbed(document.body);
```

### `FormsortSecureWebEmbed(rootEl: HTMLElement, config?: IFormsortWebEmbedConfig)`

Creates a Formsort iframe as a child of `rootEl`. Its `loadFlow` sends answers
and the responder UUID in a POST request body. See [Secure embed](#secure-embed).

```ts
import { FormsortSecureWebEmbed } from '@formsort/web-embed-api';

const embed = FormsortSecureWebEmbed(document.body);
```

### `config`

Both embeds accept the same optional `config` object:

```ts
interface IFormsortWebEmbedConfig {
  useHistoryAPI?: boolean; // Default: false
  /**
   * iframe title attribute for accessibility
   */
  iframeTitle?: string;
  /**
   * iframe allow attribute for permissions
   * e.g. "camera;"
   */
  iframeAllow?: string;
  autoHeight?: boolean; // Default: false
  style?: {
    width?: CSSStyleDeclaration['width'];
    height?: CSSStyleDeclaration['height'];
  };
  origin?: string; // optional -- use if you want to load your flow in a custom domain. e.g. https://acme-flow.com
}
```

#### `config` properties

- `useHistoryAPI`: When redirecting, should we use the HTML5 History API (namely, `window.pushState`), or just change the URL in its entirety?

  Helpful if you have a single-page app and want to change the container's URL without reloading the entire page. Note that you'll have to listen to the `popstate` event on the embedding `window` to detect this navigation.

- `autoHeight`: Should the embedding `<iframe>` resize so that it matches the content of the currently loaded flow?

- `style`: CSS `width` and `height` to apply to the iframe.

- `iframeTitle`: Optional string to set the iframe's title attribute for accessibility. If not provided, the embed will attempt to set a title from the flow's document title when available.

- `iframeAllow`: Optional string to set the iframe's allow attribute for permissions (for example: `"camera;"`).

- `authentication.idToken`: When the Flow requires an ID token, this can be used to provide it.

- `origin`: When present, loads the flow from your custom domain instead of the default formsort domain.

### `loadFlow`

#### `FormsortWebEmbed`

```ts
loadFlow(
  clientLabel: string,
  flowLabel: string,
  variantLabel?: string,
  queryParams?: Array<[string, string]>
) => void;
```

Starts loading a Formsort variant, or a flow.

Note that `variantLabel` is optional. If it is not provided, a variant will be chosen from the flow:

- Based on weights, if weights are assigned

- At random, if no weights are assigned

`queryParams` are added to the iframe URL. You can use them to prefill simple
answers (`['first_name', 'Olivia']`) and compound answers
(`['name[first_name]', 'Olivia']`). You can't prefill a compound question that
allows multiple entries this way. Use [`FormsortSecureWebEmbed`](#secure-embed)
instead.

#### `FormsortSecureWebEmbed`

See [`loadFlow` arguments](#loadflow-arguments) in the secure embed section.
`variantLabel` works the same way as above.

### `unloadFlow() => void`

Remove inserted iFrame and all its event listeners.

### `setSize(width: string, height: string) => void`

Set the CSS size of the embed.

You may also style the embed's iframe using CSS - it is the iframe child of the `rootEl`, so you'd use the selector `#rootEl > iframe`.

### Event listeners

```ts
embed.addEventListener(eventName: keyof IEventMap, fn: IEventMap[eventName]) => void
embed.removeEventListener(eventName: keyof IEventMap, fn: IEventMap[eventName]) => void
```

Both embeds have the same events. Add listeners before you call `loadFlow`.
In TypeScript, use the `SupportedAnalyticsEvent` enum for the event names
below, except `redirect`.

The flow events (`FlowLoaded`, `StepLoaded`, `StepCompleted`,
`ResponderStateUpdated`, `FlowFinalized` and `FlowClosed`) get a payload object
that includes:

```ts
{
  answers?: { [schemaKey: string]: any }; // See the note below
  responder: {
    responderUuid: string;
    sessionUuid: string;
    isReturningResponder?: boolean;
  };
  variantRevisionUuid: string; // The revision that is loaded
  stepId?: string; // StepLoaded and StepCompleted only
  stepIndex?: number; // StepLoaded and StepCompleted only
}
```

The `redirect` payload has `url`, `answers` and `responder`.

`answers` is only included if your domain is allowed to receive answers from
the flow. Otherwise, it is `undefined`.

The events include:

#### FlowLoaded

Set a callback function to be called when the Formsort flow has loaded completely.

Note that this is more accurate than listening for the iframe's `load` event, as this is sent from within the Formsort application code and not merely when the DOM is loaded.

You can listen for this to do things like hide the frame container, or display a loading indicator, until everything is loaded to ensure a seamless initial experience.

```ts
import FormsortWebEmbed, {
  SupportedAnalyticsEvent,
} from '@formsort/web-embed-api';

const embed = FormsortWebEmbed(document.body);
embed.addEventListener(SupportedAnalyticsEvent.FlowLoaded, () => {
  console.log('Flow has loaded!');
});
embed.loadFlow('<client-label>', '<flow-label>', '<variant-label>');
```

#### FlowFinalized

Set a callback to be called when the flow is complete, meaning the user has finished all of the steps available to them.

Useful for performing an action after the flow is complete, such as displaying a congratulations or starting a payment process.

#### FlowClosed

Set a callback to be called when the user abandons the flow before finalizing it.

Note that this is only possible if your style set defines a close button.

#### StepLoaded

Set a callback to be called when a new step is loaded.

This will happen once after the flow is loaded, if the user hasn't previously completed the flow. Subsequently, this event will happen following the completion of each step, except for the completion of the final step.

#### StepCompleted

Set a callback to be called when a step is completed. This includes the completion of the final step, before the `"FlowFinalized"` event.

#### ResponderStateUpdated

Set a callback to be called whenever the responder state is updated, corresponding to when Formsort itself saves responder answers and delivers them to integrations.

By default, this will correlate roughly to the `StepCompleted` event, since the default behavior is to save answers only when advancing between steps. However, if you have enabled [autoSave](https://docs.formsort.com/building-flows/variant-settings/additional-flow-settings#enable-autosave), then you will receive answers a short delay after a user has finished entering data.

#### redirect

`({ url: string, answers?: { [key: string]: any }, responder }) => ({ cancel?: boolean }) | undefined`

Set a callback to customize the way Formsort handles redirects. To cancel Formsort's handling of the redirect, return:

```typescript
{
  cancel: true;
}
```

If the callback does not return a value, Formsort will handle the redirect as usual.

This is helpful if you're embedding Formsort within a single-page app that has custom URL route handling.

## Examples

- [`secure-embed`](https://github.com/formsort/oss/tree/master/packages/web-embed-api/examples/secure-embed): `FormsortSecureWebEmbed` with
  prefilled answers (simple, compound and repeating compound), variant
  revisions and an event log. Vite and TypeScript.
- [`formsort-embed-example-lit`](https://github.com/formsort/oss/tree/master/packages/web-embed-api/examples/formsort-embed-example-lit):
  `FormsortWebEmbed` in a [Lit](https://lit.dev/) web component.

## Development

By default, the web embed accesses the production formsort servers. If you would like to point to another flow server, set `origin` in the config to the correct base URL, for example:

```ts
FormsortWebEmbed(document.body, { origin: 'http://localhost:4040' });
```
