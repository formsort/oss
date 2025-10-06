import EmbedMessagingManager, {
  type IFormsortEmbedConfig,
  type IEventMap,
  SupportedAnalyticsEvent,
} from '@formsort/embed-messaging-manager';
import { type IFlowAnswers, WebEmbedMessage } from '@formsort/constants';
import { getMessageSender } from './iframe-utils';
import { isLocalOrLegacyFlowOrigin } from './utils';

interface IFormsortWebEmbed {
  loadFlow: (
    clientLabel: string,
    flowLabel: string,
    variantLabel?: string,
    queryParams?: Array<[string, string]>,
    answers?: IFlowAnswers
  ) => void;
  unloadFlow: () => void;
  setSize: (width: string, height: string) => void;
  addEventListener<K extends keyof IEventMap>(
    eventName: K,
    fn: IEventMap[K]
  ): void;
  removeEventListener<K extends keyof IEventMap>(
    eventName: K,
    eventListener: IEventMap[K]
  ): void;
}

interface IFormsortWebEmbedConfig extends IFormsortEmbedConfig {
  useHistoryAPI?: boolean;
}

const DEFAULT_CONFIG: IFormsortWebEmbedConfig = {
  useHistoryAPI: false,
};

const FormsortWebEmbed = (
  rootEl: HTMLElement,
  config: IFormsortWebEmbedConfig = DEFAULT_CONFIG
): IFormsortWebEmbed => {
  const iframeEl = document.createElement('iframe');
  const { style } = config;
  let loadedOrigin: string;
  let pendingAnswers: IFlowAnswers | undefined;
  iframeEl.style.border = 'none';
  if (style) {
    const { width = '', height = '' } = style;
    iframeEl.style.width = width;
    iframeEl.style.height = height;
  }

  rootEl.appendChild(iframeEl);

  const setSize = (width?: string | number, height?: string | number) => {
    if (width !== undefined) {
      iframeEl.style.width = width.toString();
    }
    if (height !== undefined) {
      iframeEl.style.height = height.toString();
    }
  };

  const unloadFlow = () => {
    removeListeners();
    try {
      rootEl.removeChild(iframeEl);
    } catch (e) {
      // noop: iframe already removed OR blur event triggered by iframe removal
    }
  };

  const sendMessageToEmbed = getMessageSender(iframeEl);

  const messagingManager = new EmbedMessagingManager({
    config,
    sendMessageToEmbed,
    onRedirect: (url: string) => {
      if (
        config.useHistoryAPI &&
        'history' in window &&
        url.indexOf(window.location.origin) === 0
      ) {
        window.history.pushState({}, document.title, url);
      } else {
        window.location.assign(url);
      }
    },
    onResize: setSize,
    onFlowClosed: unloadFlow,
  });

  messagingManager.addEventListener(SupportedAnalyticsEvent.FlowLoaded, (eventPayload) => {
    if (eventPayload.documentTitle) {
      iframeEl.title = eventPayload.documentTitle;
    }
    
    // Send pending answers via postMessage after the flow has loaded
    if (pendingAnswers) {
      sendMessageToEmbed({
        type: WebEmbedMessage.EMBED_ANSWERS_MSG,
        payload: { answers: pendingAnswers },
      });
      pendingAnswers = undefined;
    }
  })

  const onWindowMessage = (message: MessageEvent<unknown>) => {
    const { origin: msgOrigin, source, data } = message;
    if (source !== iframeEl.contentWindow) {
      // If we have multiple Formsort instances within a page, only listen to events coming
      // from the iframe that this embed instance controls.
      return;
    }

    if (msgOrigin !== loadedOrigin) {
      return;
    }

    messagingManager.onMessage(data);
  };

  if (typeof window !== undefined) {
    window.addEventListener('message', onWindowMessage);
  }

  const removeListeners = () => {
    window.removeEventListener('message', onWindowMessage);
  };

  const loadFlow = (
    clientLabel: string,
    flowLabel: string,
    variantLabel?: string,
    queryParams?: Array<[string, string]>,
    answers?: IFlowAnswers
  ) => {
    // Store answers to be sent via postMessage after flow loads
    // This avoids CloudFront query string length limitations
    if (answers) {
      pendingAnswers = answers;
    }

    let urlBase: string;
    if (config.origin) {
      loadedOrigin = config.origin;

      if (isLocalOrLegacyFlowOrigin(config.origin)) {
        urlBase = `${config.origin}/client/${clientLabel}`; 
      } else {
        urlBase = config.origin;
      }
    } else {
      const subdomain = clientLabel
        .toLowerCase()
        .replace(/[^0-9a-z]/g, '') // Remove non-alphanumerics
        .replace(/^[0-9]+/, ''); // Remove leading numbers
      loadedOrigin = urlBase = `https://${subdomain}.formsort.app`;
    }

    let url = `${urlBase}/flow/${flowLabel}`;
    if (variantLabel) {
      url += `/variant/${variantLabel}`;
    }
    if (queryParams) {
      url += `?${queryParams
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        )
        .join('&')}`;
    }
    iframeEl.src = url;
  };

  return {
    loadFlow,
    unloadFlow,
    setSize,
    addEventListener: messagingManager.addEventListener,
    removeEventListener: messagingManager.removeEventListener,
  };
};

export { IFormsortWebEmbed, IFormsortWebEmbedConfig, IEventMap };

export { SupportedAnalyticsEvent } from '@formsort/embed-messaging-manager';

export default FormsortWebEmbed;
