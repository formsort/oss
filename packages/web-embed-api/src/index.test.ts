import { AnalyticsEventType, WebEmbedMessage } from '@formsort/constants';
import FormsortWebEmbed from '.';

type MessageListener = (msg: MessageEvent) => any;

const DEFAULT_FLOW_ORIGIN = 'https://flow.formsort.com';
const EMBEDDING_WINDOW_ORIGIN = 'https://test-origin.formsort.com';

const clientLabel = 'test-client';
const flowLabel = 'test-flow';
const variantLabel = 'test-variant';

describe('FormsortWebEmbed', () => {
  const pushStateSpy = jest
    .spyOn(window.history, 'pushState')
    .mockImplementation(jest.fn);

  const originalAddEventListener = window.addEventListener;
  let messageHandlers: MessageListener[] = [];
  jest
    .spyOn(window, 'addEventListener')
    .mockImplementation((type, listener) => {
      if (type === 'message') {
        messageHandlers.push(listener as MessageListener);
      }
      originalAddEventListener(type, listener);
    });

  /**
   * A mock postMessage that actually works, unlike the one in JSDOM which
   * does not pass origin or source. It's also synchronous which makes testing easier.
   * @param msg
   */
  const mockPostMessage = (msg: MessageEvent) => {
    messageHandlers.forEach((m) => {
      m(msg);
    });
  };

  const { location } = window;
  beforeAll(() => {
    // @ts-ignore
    delete window.location;
    window.location = {
      ...location,
      assign: jest.fn(),
      origin: EMBEDDING_WINDOW_ORIGIN,
    };
  });

  beforeEach(() => {
    pushStateSpy.mockClear();
    (window.location.assign as jest.Mock).mockClear();
    messageHandlers = [];
    document.body.innerHTML = '';
  });

  afterAll(() => {
    window.location = location;
  });

  test('does not load anything if instantiated without calling load', () => {
    FormsortWebEmbed(document.body);
    const iframes = document.body.querySelectorAll('iframe');
    expect(iframes.length).toBe(1);

    const iframe = iframes[0];
    expect(iframe.src).toBe('');
  });

  test('mounts at the specified root element', () => {
    const rootEl = document.createElement('div');
    document.body.appendChild(rootEl);
    FormsortWebEmbed(rootEl);
    const iframes = document.body.querySelectorAll('iframe');
    expect(iframes.length).toBe(1);

    const iframe = iframes[0];
    expect(iframe.src).toBe('');
    expect(iframe.parentElement).toBe(rootEl);
  });

  test('loads with a specific size if specified', () => {
    const width = '400px';
    const height = '300px';

    FormsortWebEmbed(document.body, {
      style: { width, height },
    });

    const iframes = document.body.querySelectorAll('iframe');
    expect(iframes.length).toBe(1);

    const iframe = iframes[0];
    expect(iframe.style.width).toBe(width);
    expect(iframe.style.height).toBe(height);
  });

  test('Handles present-but-empty style', () => {
    FormsortWebEmbed(document.body, {
      style: {},
    });

    const iframes = document.body.querySelectorAll('iframe');
    expect(iframes.length).toBe(1);

    const iframe = iframes[0];
    expect(iframe.style.width).toBe('');
    expect(iframe.style.height).toBe('');
  });

  test('loads a flow when load is called', () => {
    const { loadFlow } = FormsortWebEmbed(document.body);
    const iframes = document.body.querySelectorAll('iframe');
    expect(iframes.length).toBe(1);

    loadFlow(clientLabel, flowLabel);

    const iframe = iframes[0];
    expect(iframe.src).toBe(
      `https://flow.formsort.com/client/${clientLabel}/flow/${flowLabel}`
    );
  });

  test('loads and handles messages from custom origin when specified', () => {
    const customOrigin = 'http://localhost:4040';
    const embed = FormsortWebEmbed(document.body, {
      origin: customOrigin,
    });
    const iframes = document.body.querySelectorAll('iframe');
    expect(iframes.length).toBe(1);

    embed.loadFlow(clientLabel, flowLabel);

    const iframe = iframes[0];
    expect(iframe.src).toBe(
      `${customOrigin}/client/${clientLabel}/flow/${flowLabel}`
    );

    const flowLoadedSpy = jest.fn();
    embed.addEventListener('flowloaded', flowLoadedSpy);

    const msg = new MessageEvent('message', {
      source: iframe.contentWindow,
      origin: customOrigin,
      data: {
        type: WebEmbedMessage.EMBED_EVENT_MSG,
        createdAt: new Date(),
        eventType: AnalyticsEventType.FlowLoaded,
      },
    });
    mockPostMessage(msg);
    expect(flowLoadedSpy).toBeCalledTimes(1);
  });

  test('loads a variant when load is called', () => {
    const { loadFlow } = FormsortWebEmbed(document.body);
    const iframes = document.body.querySelectorAll('iframe');
    expect(iframes.length).toBe(1);

    loadFlow(clientLabel, flowLabel, variantLabel);

    const iframe = iframes[0];
    expect(iframe.src).toBe(
      `https://flow.formsort.com` +
        `/client/${clientLabel}/flow/${flowLabel}/variant/${variantLabel}`
    );
  });

  test('loads with query parameters if specified', () => {
    const { loadFlow } = FormsortWebEmbed(document.body);
    const iframes = document.body.querySelectorAll('iframe');
    expect(iframes.length).toBe(1);

    const queryParamA = 'queryParamA';
    const queryValueA = 'queryValueA';
    const queryParamB = 'queryParamB';
    const queryValueB = 'queryValueB';
    loadFlow(clientLabel, flowLabel, undefined, [
      [queryParamA, queryValueA],
      [queryParamB, queryValueB],
    ]);

    const iframe = iframes[0];
    expect(iframe.src).toBe(
      `https://flow.formsort.com` +
        `/client/${clientLabel}/flow/${flowLabel}` +
        `?${queryParamA}=${queryValueA}&${queryParamB}=${queryValueB}`
    );
  });

  test('ignores events from unknown origins', async () => {
    const embed = FormsortWebEmbed(document.body);
    const iframe = document.body.querySelector('iframe')!;

    const flowLoadedSpy = jest.fn();
    embed.addEventListener('flowloaded', flowLoadedSpy);
    embed.loadFlow(clientLabel, flowLabel);

    const msg = new MessageEvent('message', {
      source: iframe.contentWindow,
      origin: 'https://example.com',
      data: {
        type: WebEmbedMessage.EMBED_EVENT_MSG,
        createdAt: new Date(),
        eventType: AnalyticsEventType.FlowLoaded,
      },
    });
    mockPostMessage(msg);
    expect(flowLoadedSpy).toBeCalledTimes(0);
  });

  test('ignores events without data', async () => {
    const embed = FormsortWebEmbed(document.body);
    const iframe = document.body.querySelector('iframe')!;

    const flowLoadedSpy = jest.fn();
    embed.addEventListener('flowloaded', flowLoadedSpy);
    embed.loadFlow(clientLabel, flowLabel);

    const msg = new MessageEvent('message', {
      source: iframe.contentWindow,
      origin: DEFAULT_FLOW_ORIGIN,
      data: undefined,
    });
    mockPostMessage(msg);
    expect(flowLoadedSpy).toBeCalledTimes(0);
  });

  test('handles messages from multiple flows within the same window', async () => {
    const firstEmbed = FormsortWebEmbed(document.body);
    const secondEmbed = FormsortWebEmbed(document.body);
    const iframes = document.body.querySelectorAll('iframe');
    expect(iframes.length).toBe(2);

    const secondFlowLabel = 'second-test-flow';
    firstEmbed.loadFlow(clientLabel, flowLabel);
    secondEmbed.loadFlow(clientLabel, secondFlowLabel);

    const firstFlowIframe = iframes[0];
    expect(firstFlowIframe.src).toBe(
      `https://flow.formsort.com/client/${clientLabel}/flow/${flowLabel}`
    );

    const secondFlowIframe = iframes[1];
    expect(secondFlowIframe.src).toBe(
      `https://flow.formsort.com/client/${clientLabel}/flow/${secondFlowLabel}`
    );

    const firstFlowFinalized = jest.fn();
    firstEmbed.addEventListener('flowfinalized', firstFlowFinalized);

    const secondFlowFinalized = jest.fn();
    secondEmbed.addEventListener('flowfinalized', secondFlowFinalized);

    const msg = new MessageEvent('message', {
      source: firstFlowIframe.contentWindow,
      origin: DEFAULT_FLOW_ORIGIN,
      data: {
        type: WebEmbedMessage.EMBED_EVENT_MSG,
        createdAt: new Date(),
        eventType: AnalyticsEventType.FlowFinalized,
      },
    });
    mockPostMessage(msg);

    // We received a message from the first iframe, so only that frame should
    // have its callback called.
    expect(firstFlowFinalized).toBeCalledTimes(1);
    expect(secondFlowFinalized).toBeCalledTimes(0);
  });

  test('handles flow loaded event', async () => {
    const embed = FormsortWebEmbed(document.body);
    const iframe = document.body.querySelector('iframe')!;

    const flowLoadedSpy = jest.fn();
    embed.addEventListener('flowloaded', flowLoadedSpy);
    embed.loadFlow(clientLabel, flowLabel);

    const msg = new MessageEvent('message', {
      source: iframe.contentWindow,
      origin: DEFAULT_FLOW_ORIGIN,
      data: {
        type: WebEmbedMessage.EMBED_EVENT_MSG,
        createdAt: new Date(),
        eventType: AnalyticsEventType.FlowLoaded,
      },
    });
    mockPostMessage(msg);
    expect(flowLoadedSpy).toBeCalledTimes(1);
  });

  test('handles flow finalized event', async () => {
    const embed = FormsortWebEmbed(document.body);
    const iframe = document.body.querySelector('iframe')!;

    const flowFinalizedSpy = jest.fn();
    embed.addEventListener('flowfinalized', flowFinalizedSpy);
    embed.loadFlow(clientLabel, flowLabel);

    const msg = new MessageEvent('message', {
      source: iframe.contentWindow,
      origin: DEFAULT_FLOW_ORIGIN,
      data: {
        type: WebEmbedMessage.EMBED_EVENT_MSG,
        createdAt: new Date(),
        eventType: AnalyticsEventType.FlowFinalized,
      },
    });
    mockPostMessage(msg);
    expect(flowFinalizedSpy).toBeCalledTimes(1);
  });

  test('handles flow closed event', async () => {
    const embed = FormsortWebEmbed(document.body);
    const iframe = document.body.querySelector('iframe')!;

    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const flowClosedSpy = jest.fn();
    embed.addEventListener('flowclosed', flowClosedSpy);
    embed.loadFlow(clientLabel, flowLabel);

    const msg = new MessageEvent('message', {
      source: iframe.contentWindow,
      origin: DEFAULT_FLOW_ORIGIN,
      data: {
        type: WebEmbedMessage.EMBED_EVENT_MSG,
        createdAt: new Date(),
        eventType: AnalyticsEventType.FlowClosed,
      },
    });
    mockPostMessage(msg);
    expect(flowClosedSpy).toBeCalledTimes(1);
    expect(removeEventListenerSpy).toBeCalledTimes(1);
    expect(removeEventListenerSpy.mock.calls[0][0]).toBe('message');
  });

  test('handles resize event when autoHeight is enabled', async () => {
    const embed = FormsortWebEmbed(document.body, {
      style: { width: '100px', height: '100px' },
      autoHeight: true,
    });
    const iframe = document.body.querySelector('iframe')!;

    embed.loadFlow(clientLabel, flowLabel);
    const width = '357px';
    const height = '733px';

    const msg = new MessageEvent('message', {
      source: iframe.contentWindow,
      origin: DEFAULT_FLOW_ORIGIN,
      data: {
        type: WebEmbedMessage.EMBED_RESIZE_MSG,
        payload: {
          width,
          height,
        },
      },
    });
    mockPostMessage(msg);
    expect(iframe.style.width).toBe(width);
    expect(iframe.style.height).toBe(height);

    // The resize message can be partial (for example, just height changes)
    // Make sure we can handle those.
    const newHeight = '999px';
    const newWidth = '888px';

    const heightMsg = new MessageEvent('message', {
      source: iframe.contentWindow,
      origin: DEFAULT_FLOW_ORIGIN,
      data: {
        type: WebEmbedMessage.EMBED_RESIZE_MSG,
        payload: {
          height: newHeight,
        },
      },
    });
    mockPostMessage(heightMsg);
    expect(iframe.style.width).toBe(width);
    expect(iframe.style.height).toBe(newHeight);

    const widthMsg = new MessageEvent('message', {
      source: iframe.contentWindow,
      origin: DEFAULT_FLOW_ORIGIN,
      data: {
        type: WebEmbedMessage.EMBED_RESIZE_MSG,
        payload: {
          width: newWidth,
        },
      },
    });
    mockPostMessage(widthMsg);
    expect(iframe.style.width).toBe(newWidth);
    expect(iframe.style.height).toBe(newHeight);
  });

  test('ignores resize event when autoHeight is enabled', async () => {
    const originalWidth = '200px';
    const originalHeight = '300px';
    const embed = FormsortWebEmbed(document.body, {
      style: { width: originalWidth, height: originalHeight },
    });
    const iframe = document.body.querySelector('iframe')!;

    embed.loadFlow(clientLabel, flowLabel);

    const newWidth = '357px';
    const newHeight = '733px';
    const msg = new MessageEvent('message', {
      source: iframe.contentWindow,
      origin: DEFAULT_FLOW_ORIGIN,
      data: {
        type: WebEmbedMessage.EMBED_RESIZE_MSG,
        payload: {
          width: newWidth,
          height: newHeight,
        },
      },
    });
    mockPostMessage(msg);
    expect(iframe.style.width).toBe(originalWidth);
    expect(iframe.style.height).toBe(originalHeight);
  });

  test('handles redirecting to a URL', async () => {
    const embed = FormsortWebEmbed(document.body);
    const iframe = document.body.querySelector('iframe')!;

    const redirectSpy = jest.fn();
    embed.addEventListener('redirect', redirectSpy);
    embed.loadFlow(clientLabel, flowLabel);

    const redirectUrl = 'https://example.com';
    const msg = new MessageEvent('message', {
      source: iframe.contentWindow,
      origin: DEFAULT_FLOW_ORIGIN,
      data: {
        type: WebEmbedMessage.EMBED_REDIRECT_MSG,
        payload: redirectUrl,
      },
    });
    mockPostMessage(msg);
    expect(redirectSpy).toBeCalledTimes(1);
    expect(redirectSpy).toBeCalledWith(redirectUrl);
    expect(window.location.assign).toBeCalledTimes(1);
    expect(window.location.assign).toBeCalledWith(redirectUrl);
  });

  test('Redirects to a custom URL if one is returned by the callback', async () => {
    const embed = FormsortWebEmbed(document.body);
    const iframe = document.body.querySelector('iframe')!;

    const redirectUrl = 'https://example.com';
    const customUrl = 'https://example-2.com';
    const redirectCallback = jest.fn(() => ({ customUrl }));
    embed.addEventListener('redirect', redirectCallback);
    embed.loadFlow(clientLabel, flowLabel);

    const msg = new MessageEvent('message', {
      source: iframe.contentWindow,
      origin: DEFAULT_FLOW_ORIGIN,
      data: {
        type: WebEmbedMessage.EMBED_REDIRECT_MSG,
        payload: redirectUrl,
      },
    });
    mockPostMessage(msg);
    expect(redirectCallback).toBeCalledTimes(1);
    expect(redirectCallback).toBeCalledWith(redirectUrl);
    expect(window.location.assign).toBeCalledTimes(1);
    expect(window.location.assign).toBeCalledWith(customUrl);
  });

  test('Cancels redirect if callback returns `cancel: true`', async () => {
    const embed = FormsortWebEmbed(document.body);
    const iframe = document.body.querySelector('iframe')!;

    const redirectUrl = 'https://example.com';
    const customUrl = 'https://example-2.com';
    const redirectCallback = jest.fn(() => ({ customUrl, cancel: true }));
    embed.addEventListener('redirect', redirectCallback);
    embed.loadFlow(clientLabel, flowLabel);

    const msg = new MessageEvent('message', {
      source: iframe.contentWindow,
      origin: DEFAULT_FLOW_ORIGIN,
      data: {
        type: WebEmbedMessage.EMBED_REDIRECT_MSG,
        payload: redirectUrl,
      },
    });
    mockPostMessage(msg);
    expect(redirectCallback).toBeCalledTimes(1);
    expect(redirectCallback).toBeCalledWith(redirectUrl);
    expect(window.location.assign).not.toHaveBeenCalled();
  });

  test('handles events even when corresponding handlers are not set', async () => {
    const embed = FormsortWebEmbed(document.body);
    const iframe = document.body.querySelector('iframe')!;

    embed.loadFlow(clientLabel, flowLabel);

    const redirectMsg = new MessageEvent('message', {
      source: iframe.contentWindow,
      origin: DEFAULT_FLOW_ORIGIN,
      data: {
        type: WebEmbedMessage.EMBED_REDIRECT_MSG,
        payload: 'https://example.com',
      },
    });
    mockPostMessage(redirectMsg);

    const resizeMsg = new MessageEvent('message', {
      source: iframe.contentWindow,
      origin: DEFAULT_FLOW_ORIGIN,
      data: {
        type: WebEmbedMessage.EMBED_RESIZE_MSG,
        payload: {
          width: '100px',
          height: '200px',
        },
      },
    });
    mockPostMessage(resizeMsg);

    const eventMsg = new MessageEvent('message', {
      source: iframe.contentWindow,
      origin: 'https://example.com',
      data: {
        type: WebEmbedMessage.EMBED_EVENT_MSG,
        createdAt: new Date(),
        eventType: AnalyticsEventType.FlowLoaded,
      },
    });
    mockPostMessage(eventMsg);

    const unknownMsg = new MessageEvent('message', {
      source: iframe.contentWindow,
      origin: 'https://example.com',
      data: {
        type: 'some unknown type',
      },
    });
    mockPostMessage(unknownMsg);
  });

  test('handles redirecting to a using history API when redirecting in the same origin', async () => {
    const embed = FormsortWebEmbed(document.body, { useHistoryAPI: true });
    const iframe = document.body.querySelector('iframe')!;

    const redirectSpy = jest.fn();
    embed.addEventListener('redirect', redirectSpy);
    embed.loadFlow(clientLabel, flowLabel);

    const redirectUrl = `${EMBEDDING_WINDOW_ORIGIN}/some-other-page-in-the-parent-origin`;
    const msg = new MessageEvent('message', {
      source: iframe.contentWindow,
      origin: DEFAULT_FLOW_ORIGIN,
      data: {
        type: WebEmbedMessage.EMBED_REDIRECT_MSG,
        payload: redirectUrl,
      },
    });
    mockPostMessage(msg);
    expect(redirectSpy).toBeCalledTimes(1);
    expect(redirectSpy).toBeCalledWith(redirectUrl);
    expect(pushStateSpy).toBeCalledTimes(1);
    expect(pushStateSpy).toBeCalledWith({}, '', redirectUrl);
  });

  test('ignores useHistoryAPI when redirecting to a different origin', async () => {
    const embed = FormsortWebEmbed(document.body, { useHistoryAPI: true });
    const iframe = document.body.querySelector('iframe')!;

    const redirectSpy = jest.fn();
    embed.addEventListener('redirect', redirectSpy);
    embed.loadFlow(clientLabel, flowLabel);

    const redirectUrl = `https://www.some-other-origin.com/some-other-page`;
    const msg = new MessageEvent('message', {
      source: iframe.contentWindow,
      origin: DEFAULT_FLOW_ORIGIN,
      data: {
        type: WebEmbedMessage.EMBED_REDIRECT_MSG,
        payload: redirectUrl,
      },
    });
    mockPostMessage(msg);
    expect(redirectSpy).toBeCalledTimes(1);
    expect(redirectSpy).toBeCalledWith(redirectUrl);
    expect(window.location.assign).toBeCalledTimes(1);
    expect(window.location.assign).toBeCalledWith(redirectUrl);
    expect(pushStateSpy).toBeCalledTimes(0);
  });
});
