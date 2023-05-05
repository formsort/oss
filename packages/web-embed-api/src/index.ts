import EmbedMessagingManager, {
  type IFormsortEmbedConfig,
  type IEventMap,
} from './EmbedMessagingManager';
import { getMessageSender } from './iframe-utils';

const DEFAULT_FLOW_ORIGIN = 'https://flow.formsort.com';

interface IFormsortWebEmbed {
  loadFlow: (
    clientLabel: string,
    flowLabel: string,
    variantLabel?: string,
    queryParams?: Array<[string, string]>
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
  origin: DEFAULT_FLOW_ORIGIN,
};

const FormsortWebEmbed = (
  rootEl: HTMLElement,
  config: IFormsortWebEmbedConfig = DEFAULT_CONFIG
): IFormsortWebEmbed => {
  const iframeEl = document.createElement('iframe');
  const { style } = config;
  const formsortOrigin = config.origin || DEFAULT_FLOW_ORIGIN;
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
    rootEl.removeChild(iframeEl);
  };

  const messagingManager = new EmbedMessagingManager({
    config,
    sendMessageToEmbed: getMessageSender(iframeEl),
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

  const onWindowMessage = (message: MessageEvent<unknown>) => {
    const { origin: msgOrigin, source, data } = message;
    if (source !== iframeEl.contentWindow) {
      // If we have multiple Formsort instances within a page, only listen to events coming
      // from the iframe that this embed instance controls.
      return;
    }

    if (msgOrigin !== formsortOrigin) {
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
    queryParams?: Array<[string, string]>
  ) => {
    let url = `${formsortOrigin}/client/${clientLabel}/flow/${flowLabel}`;
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
export {
  type IAnalyticsEventMap,
  type IEventListener,
  type IEventListenersArrayMap,
  isSupportedEventType,
  SupportedAnalyticsEvent,
} from './EmbedMessagingManager'; 

export default FormsortWebEmbed;
