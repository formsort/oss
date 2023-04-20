# @formsort/custom-question-api

Helpers for implementing custom questions in [Formsort](https://formsort.com).

Custom questions allow extending the Formsort platform with custom behavior, without needing to rewrite an entire form flow from scratch.

## Development workflow

0. Build your custom question using whatever javascript framework you'd like
1. Run [ngrok](https://ngrok.com/) to expose your local server on a public IP with HTTPs

### Directly within formsort

2. Add a **custom** question within a Formsort flow.
3. Set the **source url** (proxied to a URL with a custom question renderer (`localhost` is best for development)).
4. Load the question in the live preview window.
5. Use the helpers in this library to communicate with Formsort.

## Deployment

When you're ready, deploy your question question to a publicly available URL, update the **source url** to that, and you're good to go. Formsort preloads custom questions, so you don't need to worry too much about bandwidth.

## Usage

First, install:

```shell
yarn add @formsort/custom-question-api
```

or

```shell
npm install --save @formsort/custom-question-api
```

Then, import the helper functions as needed in your custom question implementation:

```javascript
import {
  getAnswerValue,
  setAnswerValue,
  clearAnswerValue,
  getSemanticAnswerValue,
  getAllAnswerValues,
  getResponderUuid,
  setQuestionSize,
  setDisableBackNavigation,
  setAutoHeight,
} from '@formsort/custom-question-api';
```

## Documentation

```tsx
getAnswerValue() => Promise<any>
```

Returns a promise for the current value of the answer this question is collecting. It may be undefined.

The result from `getAnswer()` should be used upon initial load: to set the local state of any components for the answer that you are collecting in this question, for the case that the value is already known (for example, the user is returning after a reload, or has reached the step by using the back button).

Optionally, the type of the answer can be defined by passing a generic parameter:

```tsx
getAnswerValue<string>();
```

The type parameter can be either a number, string, boolean, object, or an array consisting of one of these types. The returned value will still be `undefined` if the answer has not been set.

```tsx
getAllAnswerValues() => Promise<{ [key: string]: any }>
```

Returns a promise for an object containing _all_ of the answers provided by the receipient thus far in filling out their flow. The keys are the variable names as defined within Formsort.

```tsx
getResponderUuid() => Promise<string>
```

Get the current responder's UUID. Useful if you need to look something up about this user that isn't within the Formsort answer set.

```tsx
setAnswerValue(value: number | string | boolean | object) => void
```

Sets the value for this question's answer. If you have `Can autoadvance` checked within the Formsort studio settings for this question and this is the last remaining question within the step, the flow will advance to the next step.

```tsx
clearAnswerValue() => void
```

Resets the answer for this particular question's answer.

```tsx
getAllAnswerValues() => Promise<{ [key: string]: any}>
```

Returns a promise for an object containing _all_ of the answers provided by the receipient thus far in filling out their flow. The keys are the variable names as defined within Formsort.

```tsx
getSemanticAnswerValue(semanticType: AnswerSemanticType) => Promise<any>
```

Returns a promise for the value of a specific _semantic_ answer value, such as `responder_email`. This is useful to make your custom questions more modular. Depending on an answer variable name being `email` or `userEmail` is not reliable, but using semantic meaning, answers can be looked up by what they represent, even if a particular flow or variant references them differently.

```tsx
getResponderUuid() => Promise<string>
```

Get the current responder's UUID. Useful if you need to look something up about this user that isn't within the Formsort answer set.

```tsx
setDisableBackNavigation(disable: boolean, options?: { beforeUnloadMessage?: string }) => void;
```

Disable/enable back navigation in parent form. If you want to prompt a message when user clicks on browser's back button, like [`window.confirm`](https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm), you can set `beforeUnloadMessage`.

```tsx
setAutoHeight(enabled: boolean) => void
```

Configures a [`ResizeObserver`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) to observe the height of your custom question's `<body>` and automatically set the size of the containing question to match. This should prevent scrolling within Formsort in the vast majority of cases.

```tsx
setQuestionSize(width?: number | string, height?: number | string) => void
```

Manually sets the width and height of the question within Formsort. This should not be used if `setAutoHeight` has been enabled

The default unit of measurement when passing a number is pixels (px). A different unit of measurement can be passed as a string.
For example, `'2em'` or `'100%'`.

To avoid jumpiness, if you know the size of your component beforehand, it's best to set the default width and height within the custom question directly within the Formsort studio. Use `setQuestionSize` when you do not know the dimensions of your question component beforehand, and want to make sure that Formsort gives it enough size to render without scrollbars.

For example, if you implement your custom question as a React component, you may want to measure the component once it's rendered and tell Formsort its height and width:

```tsx
import React, { useEffect, useRef } from 'react';
import { setQuestionSize } from '@formsort/custom-question-api';

const MyCustomComponent = () => {
  const containerElRef = useRef<HTMLDivElement>();

  useEffect(() => {
    const containerEl = containerElRef.current;
    if (!containerEl) {
      return;
    }
    setQuestionSize(containerEl.offsetWidth, containerEl.offsetHeight);
  }, []);

  return (
    <div ref={containerElRef}>
      <h1>My custom component</h1>
    </div>
  );
};
```
