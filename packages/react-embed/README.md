# @formsort/react-embed

Embed [Formsort](https://formsort.com) flows within react components

## Installation

Add @formsort/react-embed to your project by executing `yarn add @formsort/react-embed` or `npm install @formsort/react-embed`.

## Usage

Here's an example of basic usage:

```js
import React from 'react';
import EmbedFlow from '@formsort/react-embed';

const EmbedFlowExample: React.FunctionComponent = () => (
  <div>
    <EmbedFlow
      clientLabel="formsort"
      flowLabel="onboarding"
      variantLabel="main"
      embedConfig={{
        style: {
          width: '100%',
          height: '100%',
        },
      }}
    />
  </div>
);
```

### Events

You can add event listeners to flows like `Flowloaded`, `redirect` etc. See [all event listeners](https://github.com/formsort/oss/tree/master/packages/web-embed-api#event-listeners)

### Props

| Prop name     | Description                                                                                                  | Required | Example values                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------ | -------- | ---------------------------------------------------------- |
| clientLabel   | client name                                                                                                  | yes      | `formsort`                                                 |
| flowLabel     | flow name                                                                                                    | yes      | `onboarding`                                               |
| variantLabel  | variant name                                                                                                 | no       | `main`                                                     |
| responderUuid | responder uuid to load existing answers for                                                                  | no       | `e4923baa-dc2d-4555-813c-a166952292fa`                     |
| formsortEnv   | formsort integrations environment label, if not using production                                             | no       | `staging`                                                  |
| queryParams   | additional query params, to pre-populate answers in the form                                                 | no       | `[['name', 'Olivia']], ['age', '3']]`                      |
| embedConfig   | config passed to the underlying [`FormsortWebEmbed`](https://github.com/formsort/oss/tree/master/packages/web-embed-api) | no       | `{ style: { height: '100%' } }`                            |
| onFlowLoaded    | [event listener](https://github.com/formsort/oss/tree/master/packages/web-embed-api#flowloaded-answers--key-string-any----void)                          | no       | `() => { console.log('flow loaded') }`                     |
| onFlowClosed    | [event listener](https://github.com/formsort/oss/tree/master/packages/web-embed-api#flowclosed-answers--key-string-any---void)                          | no       | `() => { console.log('flow closed') }`                     |
| onFlowFinalized | [event listener](https://github.com/formsort/oss/tree/master/packages/web-embed-api#flowfinalized-answers--key-string-any---void)                       | no       | `() => { console.log('flow finalized') }`                  |
| onStepLoaded | [event listener](https://github.com/formsort/oss/tree/master/packages/web-embed-api#steploaded-answers--key-string-any---void)                       | no       | `() => { console.log('step loaded') }`                  |
| onStepCompleted | [event listener](https://github.com/formsort/oss/tree/master/packages/web-embed-api#steploaded-answers--key-string-any---void)                       | no       | `() => { console.log('step loaded') }`                  |
| onRedirect      | [event listener](https://github.com/formsort/oss/tree/master/packages/web-embed-api#redirect--url-string-answers--key-string-any-----cancel-boolean---undefined)                            | no       | `(url: string) => { console.log('redirecting to:', url) }` |
