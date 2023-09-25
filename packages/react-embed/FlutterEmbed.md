# Embedding formsort flows in Flutter

## Installation

* Install `webview_flutter`

  ```bash
  flutter pub add webview_flutter
  ```

## Usage

```dart
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'dart:convert';

// This message type is prefixed by a special character to avoid collisions with
// other messages that may be sent from the webview.
// so just copy this to avoid errors
const String EMBED_EVENT_MSG = 'ƒ_wee';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const MyHomePage(title: 'Flutter Demo Home Page'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});
  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  late final WebViewController controller;
  final flowUrl =
      'https://formsorttemplatesdemo.formsort.app/flow/template-patient-onboarding-demo/variant/patient-onboarding-customization';

  final String setUpJSWebViewMessaging = """
    window.FlutterWebView = true;
    window.postMessage = function(data) {
      FlutterChannel.postMessage(JSON.stringify(data));
    };
  """;
  @override
  void initState() {
    super.initState();
    controller = WebViewController()
      ..loadRequest(
        Uri.parse(flowUrl),
      )
      ..setJavaScriptMode(JavaScriptMode.unrestricted) // enable javascript
      ..addJavaScriptChannel('FlutterChannel', onMessageReceived: (event) {
        final eventData = jsonDecode(event.message);
        if (eventData['type'] == EMBED_EVENT_MSG) {
          // get messages from the flow
          switch (eventData['eventType']) {
            case 'FlowCompleted':
              print('Flow completed');
              break;
            case 'FlowLoaded':
              print('Flow loaded');
              break;
            default:
              break;
          }
        }
      })
      ..setNavigationDelegate(NavigationDelegate(onPageFinished: (ulr) {
        controller.runJavaScript(setUpJSWebViewMessaging);
      }));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: WebViewWidget(
        controller: controller,
      ),
    );
  }
}
```

## Listening for events

Formsort flows will send messages to the parent window when certain events occur. You can listen for these events by setting up `javaScriptChannel` in `WebViewController`. The event data will be available in the `event.message` property. Full list of available events can be found in formsort docs [here](https://docs.formsort.com/handling-data/getting-data-out/analytics).

## Customizing the flow behavior

By default, formsort keeps user information locally and don't restart flows when the user comes back to the flow. You can change this behavior in two ways:

1. You can set returning responder behavior in flow settings in formsort studio. see [formsort docs](<https://docs.formsort.com/building-flows/variant-settings/returning-responder-behavior#start-at-beginning-discard-answers>) for more information.

2. Use the `flowUrl` parameter `?discardAnswers=true` to restart the flow every time the user comes back to the flow. e.g.

    ```dart
    final flowUrl = 'https://formsorttemplatesdemo.formsort.app/flow/template-patient-onboarding-demo/variant/patient-onboarding-customization?discardAnswers=true';
    ```
