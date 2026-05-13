import { AnalyticsEventType, WebEmbedMessage } from '@formsort/constants';

import FormsortWebEmbed, { SupportedAnalyticsEvent } from '.';
import browserNavigation from './browser-navigation';

type MessageListener = (msg: MessageEvent) => any;

const DEFAULT_FLOW_ORIGIN = 'https://testclient.formsort.app';
const EMBEDDING_WINDOW_ORIGIN = window.location.origin;

const clientLabel = 'test-client';
const flowLabel = 'test-flow';
const variantLabel = 'test-variant';

describe('FormsortWebEmbed', () => {
  const pushStateSpy = jest
    .spyOn(browserNavigation, 'pushState')
    // oxlint-disable-next-line no-empty-function
    .mockImplementation(() => {});
  const assignSpy = jest
    .spyOn(browserNavigation, 'assign')
    // oxlint-disable-next-line no-empty-function
    .mockImplementation(() => {});
  const getOriginSpy = jest
    .spyOn(browserNavigation, 'getOrigin')
    .mockReturnValue(EMBEDDING_WINDOW_ORIGIN);
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

  beforeEach(() => {
    messageHandlers = [];
    getOriginSpy.mockClear();
    pushStateSpy.mockClear();
    assignSpy.mockClear();
    document.body.innerHTML = '';
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
      `https://testclient.formsort.app/flow/${flowLabel}`
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
    embed.addEventListener(SupportedAnalyticsEvent.FlowLoaded, flowLoadedSpy);

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
    expect(flowLoadedSpy).toHaveBeenCalledTimes(1);
  });

  test('loads and handles messages from non-local custom origin', () => {
    const customOrigin = 'https://mycustomdomain.com';
    const embed = FormsortWebEmbed(document.body, {
      origin: customOrigin,
    });
    const iframes = document.body.querySelectorAll('iframe');
    expect(iframes.length).toBe(1);

    embed.loadFlow(clientLabel, flowLabel);

    const iframe = iframes[0];
    expect(iframe.src).toBe(`${customOrigin}/flow/${flowLabel}`);

    const flowLoadedSpy = jest.fn();
    embed.addEventListener(SupportedAnalyticsEvent.FlowLoaded, flowLoadedSpy);

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
    expect(flowLoadedSpy).toHaveBeenCalledTimes(1);
  });

  test('loads a variant when load is called', () => {
    const { loadFlow } = FormsortWebEmbed(document.body);
    const iframes = document.body.querySelectorAll('iframe');
    expect(iframes.length).toBe(1);

    loadFlow(clientLabel, flowLabel, variantLabel);

    const iframe = iframes[0];
    expect(iframe.src).toBe(
      `https://testclient.formsort.app` +
        `/flow/${flowLabel}/variant/${variantLabel}`
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
      `https://testclient.formsort.app` +
        `/flow/${flowLabel}` +
        `?${queryParamA}=${queryValueA}&${queryParamB}=${queryValueB}`
    );
  });

  test('ignores events from unknown origins', async () => {
    const embed = FormsortWebEmbed(document.body);
    const iframe = document.body.querySelector('iframe')!;

    const flowLoadedSpy = jest.fn();
    embed.addEventListener(SupportedAnalyticsEvent.FlowClosed, flowLoadedSpy);
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
    expect(flowLoadedSpy).toHaveBeenCalledTimes(0);
  });

  test('ignores events without data', async () => {
    const embed = FormsortWebEmbed(document.body);
    const iframe = document.body.querySelector('iframe')!;

    const flowLoadedSpy = jest.fn();
    embed.addEventListener(SupportedAnalyticsEvent.FlowLoaded, flowLoadedSpy);
    embed.loadFlow(clientLabel, flowLabel);

    const msg = new MessageEvent('message', {
      source: iframe.contentWindow,
      origin: DEFAULT_FLOW_ORIGIN,
      data: undefined,
    });
    mockPostMessage(msg);
    expect(flowLoadedSpy).toHaveBeenCalledTimes(0);
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
      `https://testclient.formsort.app/flow/${flowLabel}`
    );

    const secondFlowIframe = iframes[1];
    expect(secondFlowIframe.src).toBe(
      `https://testclient.formsort.app/flow/${secondFlowLabel}`
    );

    const firstFlowFinalized = jest.fn();
    firstEmbed.addEventListener(
      SupportedAnalyticsEvent.FlowFinalized,
      firstFlowFinalized
    );

    const secondFlowFinalized = jest.fn();
    secondEmbed.addEventListener(
      SupportedAnalyticsEvent.FlowFinalized,
      secondFlowFinalized
    );

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
    expect(firstFlowFinalized).toHaveBeenCalledTimes(1);
    expect(secondFlowFinalized).toHaveBeenCalledTimes(0);
  });

  test('handles flow loaded event', async () => {
    const embed = FormsortWebEmbed(document.body);
    const iframe = document.body.querySelector('iframe')!;

    const flowLoadedSpy = jest.fn();
    embed.addEventListener(SupportedAnalyticsEvent.FlowLoaded, flowLoadedSpy);
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
    expect(flowLoadedSpy).toHaveBeenCalledTimes(1);
  });

  test('handles adding and removing event handlers', async () => {
    const embed = FormsortWebEmbed(document.body);
    const iframe = document.body.querySelector('iframe')!;

    const flowLoadedSpy1 = jest.fn();
    const flowLoadedSpy2 = jest.fn();
    const flowLoadedSpy3 = jest.fn();

    embed.addEventListener(SupportedAnalyticsEvent.FlowLoaded, flowLoadedSpy1);
    embed.addEventListener(SupportedAnalyticsEvent.FlowLoaded, flowLoadedSpy2);
    embed.addEventListener(SupportedAnalyticsEvent.FlowLoaded, flowLoadedSpy3);

    embed.loadFlow(clientLabel, flowLabel);

    const msg1 = new MessageEvent('message', {
      source: iframe.contentWindow,
      origin: DEFAULT_FLOW_ORIGIN,
      data: {
        type: WebEmbedMessage.EMBED_EVENT_MSG,
        createdAt: new Date(),
        eventType: AnalyticsEventType.FlowLoaded,
      },
    });
    mockPostMessage(msg1);

    expect(flowLoadedSpy1).toHaveBeenCalledTimes(1);
    expect(flowLoadedSpy2).toHaveBeenCalledTimes(1);
    expect(flowLoadedSpy3).toHaveBeenCalledTimes(1);

    // Remove second event listener
    embed.removeEventListener(
      SupportedAnalyticsEvent.FlowLoaded,
      flowLoadedSpy2
    );
    const msg2 = new MessageEvent('message', {
      source: iframe.contentWindow,
      origin: DEFAULT_FLOW_ORIGIN,
      data: {
        type: WebEmbedMessage.EMBED_EVENT_MSG,
        createdAt: new Date(),
        eventType: AnalyticsEventType.FlowLoaded,
      },
    });
    mockPostMessage(msg2);
    expect(flowLoadedSpy1).toHaveBeenCalledTimes(2);
    // removed listener should not be called again
    expect(flowLoadedSpy2).toHaveBeenCalledTimes(1);
    expect(flowLoadedSpy3).toHaveBeenCalledTimes(2);

    // Remove rest of event listeners
    embed.removeEventListener(
      SupportedAnalyticsEvent.FlowLoaded,
      flowLoadedSpy1
    );
    embed.removeEventListener(
      SupportedAnalyticsEvent.FlowLoaded,
      flowLoadedSpy3
    );

    embed.removeEventListener(
      SupportedAnalyticsEvent.FlowLoaded,
      flowLoadedSpy2
    );
    const msg3 = new MessageEvent('message', {
      source: iframe.contentWindow,
      origin: DEFAULT_FLOW_ORIGIN,
      data: {
        type: WebEmbedMessage.EMBED_EVENT_MSG,
        createdAt: new Date(),
        eventType: AnalyticsEventType.FlowLoaded,
      },
    });
    mockPostMessage(msg3);
    // removed listeners should not be called again
    expect(flowLoadedSpy1).toHaveBeenCalledTimes(2);
    expect(flowLoadedSpy2).toHaveBeenCalledTimes(1);
    expect(flowLoadedSpy3).toHaveBeenCalledTimes(2);
  });

  test('handles flow finalized event', async () => {
    const embed = FormsortWebEmbed(document.body);
    const iframe = document.body.querySelector('iframe')!;

    const flowFinalizedSpy = jest.fn();
    embed.addEventListener(
      SupportedAnalyticsEvent.FlowFinalized,
      flowFinalizedSpy
    );
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
    expect(flowFinalizedSpy).toHaveBeenCalledTimes(1);
  });

  test('handles flow closed event', async () => {
    const embed = FormsortWebEmbed(document.body);
    const iframe = document.body.querySelector('iframe')!;

    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const flowClosedSpy = jest.fn();
    embed.addEventListener(SupportedAnalyticsEvent.FlowClosed, flowClosedSpy);
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
    expect(flowClosedSpy).toHaveBeenCalledTimes(1);
    expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
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
    expect(redirectSpy).toHaveBeenCalledTimes(1);
    expect(redirectSpy).toHaveBeenCalledWith({ url: redirectUrl });
    expect(assignSpy).toHaveBeenCalledTimes(1);
    expect(assignSpy).toHaveBeenCalledWith(redirectUrl);
  });

  test('handles redirecting to a URL if no callback returns `{cancel: true}`', async () => {
    const embed = FormsortWebEmbed(document.body);
    const iframe = document.body.querySelector('iframe')!;

    const redirectCallback1 = jest.fn(() => ({ cancel: false }));
    const redirectCallback2 = jest.fn(() => ({}));
    const redirectCallback3 = jest.fn(() => ({}));

    embed.addEventListener('redirect', redirectCallback1);
    embed.addEventListener('redirect', redirectCallback2);
    embed.addEventListener('redirect', redirectCallback3);

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

    expect(redirectCallback1).toHaveBeenCalledTimes(1);
    expect(redirectCallback1).toHaveBeenCalledWith({ url: redirectUrl });
    expect(redirectCallback2).toHaveBeenCalledTimes(1);
    expect(redirectCallback2).toHaveBeenCalledWith({ url: redirectUrl });
    expect(redirectCallback3).toHaveBeenCalledTimes(1);
    expect(redirectCallback3).toHaveBeenCalledWith({ url: redirectUrl });
    expect(assignSpy).toHaveBeenCalledTimes(1);
    expect(assignSpy).toHaveBeenCalledWith(redirectUrl);
  });

  test('Cancels redirect if callback returns `cancel: true`', async () => {
    const embed = FormsortWebEmbed(document.body);
    const iframe = document.body.querySelector('iframe')!;

    const redirectUrl = 'https://example.com';
    const redirectCallback = jest.fn(() => ({ cancel: true }));
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
    expect(redirectCallback).toHaveBeenCalledTimes(1);
    expect(redirectCallback).toHaveBeenCalledWith({ url: redirectUrl });
    expect(assignSpy).not.toHaveBeenCalled();
  });

  test('Cancels redirect if any callback returns `cancel: true`', async () => {
    const embed = FormsortWebEmbed(document.body);
    const iframe = document.body.querySelector('iframe')!;

    const redirectUrl = 'https://example.com';
    const redirectCallback1 = jest.fn(() => ({ cancel: false }));
    const redirectCallback2 = jest.fn(() => ({ cancel: true }));
    const redirectCallback3 = jest.fn(() => ({}));

    embed.addEventListener('redirect', redirectCallback1);
    embed.addEventListener('redirect', redirectCallback2);
    embed.addEventListener('redirect', redirectCallback3);

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

    expect(redirectCallback1).toHaveBeenCalledTimes(1);
    expect(redirectCallback1).toHaveBeenCalledWith({ url: redirectUrl });
    expect(redirectCallback2).toHaveBeenCalledTimes(1);
    expect(redirectCallback2).toHaveBeenCalledWith({ url: redirectUrl });
    expect(redirectCallback3).toHaveBeenCalledTimes(1);
    expect(redirectCallback3).toHaveBeenCalledWith({ url: redirectUrl });
    expect(assignSpy).not.toHaveBeenCalled();
  });

  describe.each(Object.values(SupportedAnalyticsEvent))('%s', (event) => {
    const sendMessage = (
      eventType: SupportedAnalyticsEvent,
      answers: Record<string, unknown> | undefined
    ) => {
      const embed = FormsortWebEmbed(document.body);
      const iframe = document.body.querySelector('iframe')!;

      const eventListenerSpy = jest.fn();
      embed.addEventListener(eventType, eventListenerSpy);
      embed.loadFlow(clientLabel, flowLabel);

      const msg = new MessageEvent('message', {
        source: iframe.contentWindow,
        origin: DEFAULT_FLOW_ORIGIN,
        data: {
          type: WebEmbedMessage.EMBED_EVENT_MSG,
          createdAt: new Date(),
          eventType,
          answers,
        },
      });
      mockPostMessage(msg);
      expect(eventListenerSpy).toHaveBeenCalledTimes(1);
      return eventListenerSpy;
    };

    it('passes answers when defined', () => {
      const answers = {
        'a-question': 'an-answer',
      };
      const eventListenerSpy = sendMessage(
        event as SupportedAnalyticsEvent,
        answers
      );
      expect(eventListenerSpy).toHaveBeenCalledWith({ answers });
    });

    it('does not crash with empty answers', () => {
      const eventListenerSpy = sendMessage(
        event as SupportedAnalyticsEvent,
        undefined
      );
      expect(eventListenerSpy).toHaveBeenCalledWith({});
    });
  });

  test.each([
    {
      answers: {
        'a-question': 'an-answer',
      },
    },
    { answers: undefined },
  ])('Passes answers if available for redirect event', async ({ answers }) => {
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
        answers,
      },
    });
    mockPostMessage(msg);
    expect(redirectSpy).toHaveBeenCalledTimes(1);

    const expectedCallArgs: { url: string; answers?: any } = {
      url: redirectUrl,
    };
    if (answers) {
      expectedCallArgs.answers = answers;
    }
    expect(redirectSpy).toHaveBeenCalledWith(expectedCallArgs);
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
    expect(redirectSpy).toHaveBeenCalledTimes(1);
    expect(redirectSpy).toHaveBeenCalledWith({ url: redirectUrl });
    expect(pushStateSpy).toHaveBeenCalledTimes(1);
    expect(pushStateSpy).toHaveBeenCalledWith(redirectUrl);
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
    expect(redirectSpy).toHaveBeenCalledTimes(1);
    expect(redirectSpy).toHaveBeenCalledWith({ url: redirectUrl });
    expect(assignSpy).toHaveBeenCalledTimes(1);
    expect(assignSpy).toHaveBeenCalledWith(redirectUrl);
    expect(pushStateSpy).toHaveBeenCalledTimes(0);
  });
});
