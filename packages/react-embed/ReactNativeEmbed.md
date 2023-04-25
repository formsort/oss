# Embedding formsort flows in React Native

## Installation

* Install `react-native-webview`

  If you use Expo, directly install `react-native-webview` with `expo install react-native-webview`.

  If you use React Native CLI, install `react-native-webview` with `yarn add react-native-webview` or `npm install react-native-webview`. Then, follow the instructions in [react-native-webview's README](<https://github.com/react-native-webview/react-native-webview/blob/master/docs/Getting-Started.md>) to complete the installation.

* Install `@formsort/constants`

  ```bash
  npm install @formsort/constants # or yarn add @formsort/constants
  ```

## Usage

```tsx
import { StyleSheet, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import { WebEmbedMessage } from '@formsort/constants'

/**
 * Injects a postMessage function into the webview to allow communication
 */
const injectPostMessage = `
  window.postMessage = (data) => window.ReactNativeWebView.postMessage(JSON.stringify(data));
`;

// replace with your flow url
const flowUrl = 'https://uwymnmujkn.formsort.app/flow/booking-flow-test/variant/B';

export default function App() {

  const onMessage = (event) => {
    const eventData = JSON.parse(event.nativeEvent.data);

    // get messages from the flow
    if (eventData.type === WebEmbedMessage.EMBED_EVENT_MSG) {
      switch(event.data.eventType) {
        case 'FlowCompleted':
          console.log('Flow completed');
          // do something when the flow is completed
          break;
        case 'FlowStarted':
          console.log('Flow started');
          // do something when the flow is started
          break;
        default:
          break;
      }
    }
  }

  return (
    <SafeAreaView style={[styles.container]}>
      <WebView
        containerStyle={styles.webView}
        source={{ uri: flowUrl }}
        onMessage={onMessage}
        allowsBackForwardNavigationGestures={true}
        injectedJavaScript={injectPostMessage}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  webView: {
    flex: 1,
  }
});
```

## Listening for events

Formsort flows will send messages to the parent window when certain events occur. You can listen for these events by adding an `onMessage` prop to the `WebView` component. The event data will be available in the `event.nativeEvent.data` property. Full list of available events can be found in formsort docs [here](https://docs.formsort.com/handling-data/getting-data-out/analytics).

## Customizing the flow behavior

By default, formsort keeps user information locally and don't restart flows when the user comes back to the flow. You can change this behavior in two ways:

1. You can set returning responder behavior in flow settings in formsort studio. see [formsort docs](<https://docs.formsort.com/building-flows/variant-settings/returning-responder-behavior#start-at-beginning-discard-answers>) for more information.

2. Use the `flowUrl` parameter `?discardAnswers=true` to restart the flow every time the user comes back to the flow. e.g.

    ```tsx
    const flowUrl = 'https://uwymnmujkn.formsort.app/flow/booking-flow-test/variant/B?discardAnswers=true';
    ```
