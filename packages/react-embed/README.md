# @formsort/react-embed

Embed [Formsort](https://formsort.com) flows within react components

### Installation

Add @formsort/react-embed to your project by executing `npm install @formsort/react-embed` or `yarn add @formsort/react-embed`.

### Usage

Here's an example of basic usage:

```js
import React from 'react';
import EmbedFlow from '@formsort/react-embed';


const EmbedFlowExample: React.FunctionComponent = () => (
  <div>
    <EmbedFlow clientLabel='formsort' flowLabel='onboarding' variantLabel='main' />
  </div>
);
```

#### Events

You can add event listeners to flows like `flowloaded`, `redirect` etc. See [all event listeners](https://github.com/formsort/web-embed-api/#event-listeners)

#### Props

|Prop name|Description|Required|Example values|
|----|----|----|----|
|clientLabel|client name|yes|`formsort`|
|flowLabel|flow name|yes|`onboarding`|
|variantLabel|variant name|no|`main`|
|flowloaded|[event listener](https://github.com/formsort/web-embed-api#flowloaded)|no|`() => { console.log('flow loaded') }`|
|flowclosed|[event listener](https://github.com/formsort/web-embed-api#flowclosed)|no|`() => { console.log('flow closed') }`|
|flowfinalized|[event listener](https://github.com/formsort/web-embed-api#flowfinalized)|no|`() => { console.log('flow finalized') }`|
|redirect|[event listener](https://github.com/formsort/web-embed-api#redirect)|no|`(url: string) => { console.log('redirecting to:', url) }`|


## Testing

```
npm run test
```

## Publishing

```
npm publish
```
