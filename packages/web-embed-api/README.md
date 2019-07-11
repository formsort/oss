# @formsort/web-embed-api

Embed Formsort flows within other webpages, with communication between the embed and the parent page.

## Usage

First, install

```
npm install @formsort/web-embed-api
```

Then, initialize the embed and load a flow.

## Documentation

### FormsortWebEmbed(rootEl: HTMLElement)

Initializes a Formsort iframe as a child of the `rootEl` provided.

### `loadFlow(clientLabel: string, flowLabel: string, variantLabel?: string) => void`

Starts loading a Formsort variant, or a flow.

Note that variantLabel is optional: if it is not provided, a variant will be chosen at random from that flow.

### `setSize(width: number, height: number) => void`

Set the CSS size of the embed.

You may also style the embed's iframe using CSS - it is the iframe child of the `rootEl`, so you'd use the selector `#rootEl > iframe`.

### `onFlowLoaded: () => void`

Set a callback function to be called when the Formsort flow has loaded completely.

Note that this is more accurate than listening for the iframe's `load` event, as this is sent from within the Formsort application code.

You can use this to do things like hide the frame container, or display a loading indicator, until everything is loaded to ensure a seamless initial experience.

```
const embed = new FormsortWebEmbed(document.body);
embed.onFlowLoaded = () => {
  console.log('Flow has loaded!');
};
embed.loadFlow('formsort', 'onboarding', 'main');
```

### `onFlowFinalized: () => void`

Set a callback to be called when the flow is compete, meaning the user has finished all of the steps available to them.

Useful for performing an action after the flow is complete, such as displaying a congratulations or starting a payment process.

### `onFlowClosed: () => void`

Set a callback to be called when the user abandons the flow before finalizing it.

Note that this is only possible if your style set defines a close button.
