# @formsort/web-embed-api

Embed [Formsort](https://formsort.com) flows within other webpages, with communication between the embed and the parent page.

If you're using React, see [@formsort/react-embed](../react-embed) which is a handy wrapper around this.

## Usage

First, install

```shell
npm install @formsort/web-embed-api --save
```

Then, initialize the embed and load a flow.

## Documentation

### FormsortWebEmbed(rootEl: HTMLElement, config?: IFormsortWebEmbedConfig)

Initializes a Formsort iframe as a child of the `rootEl` provided.

The `config` has the following interface:

```tsx
interface IFormsortWebEmbedConfig {
  useHistoryAPI?: boolean; // Default: false
  autoHeight?: boolean; // Default: false
  style?: {
    width?: CSSStyleDeclaration['width'];
    height?: CSSStyleDeclaration['height'];
  };
}
```

#### `config` properties

- `useHistoryAPI`: When redirecting, should we use the HTML5 History API (namely, `window.pushState`), or just change the URL in its entirety?

  Helpful if you have a single-page app and want to change the container's URL without reloading the entire page. Note that you'll have to listen to the `popstate` event on the embedding `window` to detect this navigation.

- `autoHeight`: Should the embedding `<iframe>` resize so that it matches the content of the currently loaded flow?

- `style` CSS properties to be applied to the iframe container.

### `loadFlow(clientLabel: string, flowLabel: string, variantLabel?: string, queryParams?: Array<[string, string]>) => void`

Starts loading a Formsort variant, or a flow.

Note that variantLabel is optional: if it is not provided, a variant will be chosen at random from that flow.

### `setSize(width: number, height: number) => void`

Set the CSS size of the embed.

You may also style the embed's iframe using CSS - it is the iframe child of the `rootEl`, so you'd use the selector `#rootEl > iframe`.

### Event listeners

```tsx
addEventListener(eventName: key of IEventMap, fn: IEventMap[eventName]) => void
```

The events include:

#### flowloaded `() => void`

Set a callback function to be called when the Formsort flow has loaded completely.

Note that this is more accurate than listening for the iframe's `load` event, as this is sent from within the Formsort application code and not merely when the DOM is loaded.

You can listen for this to do things like hide the frame container, or display a loading indicator, until everything is loaded to ensure a seamless initial experience.

```
const embed = FormsortWebEmbed(document.body);
embed.addEventListener('flowloaded', () => {
  console.log('Flow has loaded!');
})
embed.loadFlow('formsort', 'onboarding', 'main');
```

#### flowfinalized `() => void`

Set a callback to be called when the flow is compete, meaning the user has finished all of the steps available to them.

Useful for performing an action after the flow is complete, such as displaying a congratulations or starting a payment process.

#### flowclosed `() => void`

Set a callback to be called when the user abandons the flow before finalizing it.

Note that this is only possible if your style set defines a close button.

#### redirect `(url: string) => void`

Set a callback to handle URL redirects yourself, instead of allowing Formsort to handle them. If not defined, the Formsort embed will handle redirecting the parent page.

This is helpful if you're embedding Formsort within a single-page app that has custom URL route handling.

## Development

By default, the web embed accesses the production formsort servers. If you would like to point to another flow server, set `origin` in the config to the correct base URL, for example:

```tsx
new FormsortWebEmbed(document.body, { origin: 'http://localhost:4040'})
```
