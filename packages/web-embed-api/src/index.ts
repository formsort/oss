import { AnalyticsEventType, WebEmbedMessage } from '@formsort/constants';
import {
  IIFrameAnalyticsEventData,
  IIFrameRedirectEventData,
} from './interfaces';

const FS_ORIGIN = window.localStorage.FS_ORIGIN;
const FLOW_ORIGIN = FS_ORIGIN || `https://flow.formsort.com`;

export interface IFormsortWebEmbed {
  loadFlow: (
    clientLabel: string,
    flowLabel: string,
    variantLabel?: string,
    queryParams?: Array<[string, string]>
  ) => void;
  setSize: (width: string, height: string) => void;
  addEventListener<K extends string & keyof IEventMap>(
    eventName: K,
    fn: IEventMap[K]
  ): void;
}

interface IFormsortWebEmbedConfig {
  useHistoryAPI: boolean;
  style?: Partial<Pick<CSSStyleDeclaration, 'width' | 'height'>>;
}
const DEFAULT_CONFIG: IFormsortWebEmbedConfig = { useHistoryAPI: false };

export interface IEventMap {
  flowloaded?: () => void;
  flowclosed?: () => void;
  flowfinalized?: () => void;
  redirect?: (p: string) => void;
}

const FormsortWebEmbed = (
  rootEl: HTMLElement,
  config: IFormsortWebEmbedConfig = DEFAULT_CONFIG
): IFormsortWebEmbed => {
  const iframeEl = document.createElement('iframe');
  const { style } = config;
  iframeEl.style.border = 'none';
  if (style) {
    const { width = '', height = '' } = style;
    iframeEl.style.width = width;
    iframeEl.style.height = height;
  }

  rootEl.appendChild(iframeEl);

  const eventListeners: { [K in keyof IEventMap]?: IEventMap[K] } = {};

  const onRedirectMessage = (redirectData: IIFrameRedirectEventData) => {
    const currentUrl = window.location.href;
    const currentHash = window.location.hash.slice(1);
    const currentUrlBase = currentUrl.replace(currentHash, '');

    const url = redirectData.payload;

    if (eventListeners.redirect) {
      eventListeners.redirect(url);
    }

    const hashIndex = url.indexOf('#');
    const urlHash = hashIndex >= 0 ? url.slice(hashIndex + 1) : undefined;
    const urlBase = urlHash !== undefined ? url.replace(urlHash, '') : url;

    if (urlHash && urlBase === currentUrlBase && urlHash !== currentHash) {
      window.location.hash = urlHash;
    }
    if (
      config.useHistoryAPI &&
      'history' in window &&
      url.indexOf(window.location.origin) === 0
    ) {
      window.history.pushState({}, document.title, url);
    } else {
      window.location.assign(url);
    }
  };

  const onWindowMessage = (message: MessageEvent) => {
    const { origin, source, data } = message;
    if (source !== iframeEl.contentWindow) {
      // If we have multiple formsorts within a page, only listen to events coming
      // from the iframe that this embed instance controls.
      return;
    }

    if (origin !== FLOW_ORIGIN) {
      return;
    }

    if (!data) {
      return;
    }

    if (data.type === WebEmbedMessage.EMBED_EVENT_MSG) {
      onEventMessage(data as IIFrameAnalyticsEventData);
    } else if (data.type === WebEmbedMessage.EMBED_REDIRECT_MSG) {
      onRedirectMessage(data as IIFrameRedirectEventData);
    }
  };
  window.addEventListener('message', onWindowMessage);

  const setSize = (width: string, height: string) => {
    iframeEl.style.width = width;
    iframeEl.style.height = height;
  };

  const onEventMessage = (eventData: IIFrameAnalyticsEventData) => {
    const { eventType } = eventData;
    const { flowloaded, flowclosed, flowfinalized } = eventListeners;
    switch (eventType) {
      case AnalyticsEventType.FlowLoaded:
        if (flowloaded) {
          flowloaded();
        }
        break;
      case AnalyticsEventType.FlowClosed:
        removeListeners();
        rootEl.removeChild(iframeEl);
        if (flowclosed) {
          flowclosed();
        }
        break;
      case AnalyticsEventType.FlowFinalized:
        if (flowfinalized) {
          flowfinalized();
        }
        break;
    }
  };

  const removeListeners = () => {
    window.removeEventListener('message', onWindowMessage);
  };

  const loadFlow = (
    clientLabel: string,
    flowLabel: string,
    variantLabel?: string,
    queryParams?: Array<[string, string]>
  ) => {
    let url = `${FLOW_ORIGIN}/client/${clientLabel}/flow/${flowLabel}`;
    if (variantLabel) {
      url += `/variant/${variantLabel}`;
    }
    if (queryParams) {
      url += `?${queryParams
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&')}`;
    }
    iframeEl.src = url;
  };

  return {
    loadFlow,
    setSize,
    addEventListener<K extends string & keyof IEventMap>(
      eventName: K,
      fn: IEventMap[K]
    ): void {
      eventListeners[eventName] = fn;
    },
  };
};

export default FormsortWebEmbed;
