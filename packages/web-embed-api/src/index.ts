import { AnalyticsEventType, WebEmbedMessage } from '@formsort/constants';
import {
  IIFrameAnalyticsEventData,
  IIFrameRedirectEventData,
  IIFrameResizeEventData,
} from './interfaces';

const DEFAULT_FLOW_ORIGIN = `https://flow.formsort.com`;

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

export interface IFormsortWebEmbedConfig {
  useHistoryAPI?: boolean;
  autoHeight?: boolean;
  style?: Partial<Pick<CSSStyleDeclaration, 'width' | 'height'>>;
  origin?: string;
}
const DEFAULT_CONFIG: IFormsortWebEmbedConfig = {
  useHistoryAPI: false,
  origin: DEFAULT_FLOW_ORIGIN,
};

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
  const { style, autoHeight } = config;
  const formsortOrigin = config.origin || DEFAULT_FLOW_ORIGIN;
  iframeEl.style.border = 'none';
  if (style) {
    const { width = '', height = '' } = style;
    iframeEl.style.width = width;
    iframeEl.style.height = height;
  }

  rootEl.appendChild(iframeEl);

  const eventListeners: { [K in keyof IEventMap]?: IEventMap[K] } = {};

  const onRedirectMessage = (redirectData: IIFrameRedirectEventData) => {
    const url = redirectData.payload;

    if (eventListeners.redirect) {
      eventListeners.redirect(url);
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

  const onResizeMessage = (data: IIFrameResizeEventData) => {
    const { width, height } = data.payload;
    setSize(width, height);
  };

  const onWindowMessage = (message: MessageEvent) => {
    const { origin: msgOrigin, source, data } = message;
    if (source !== iframeEl.contentWindow) {
      // If we have multiple formsorts within a page, only listen to events coming
      // from the iframe that this embed instance controls.
      return;
    }

    if (msgOrigin !== formsortOrigin) {
      return;
    }

    if (!data) {
      return;
    }

    if (data.type === WebEmbedMessage.EMBED_EVENT_MSG) {
      onEventMessage(data as IIFrameAnalyticsEventData);
    } else if (data.type === WebEmbedMessage.EMBED_REDIRECT_MSG) {
      onRedirectMessage(data as IIFrameRedirectEventData);
    } else if (data.type === WebEmbedMessage.EMBED_RESIZE_MSG && autoHeight) {
      onResizeMessage(data as IIFrameResizeEventData);
    }
  };

  if (typeof window !== undefined) {
    window.addEventListener('message', onWindowMessage);
  }

  const setSize = (width?: string | number, height?: string | number) => {
    if (width !== undefined) {
      iframeEl.style.width = width.toString();
    }
    if (height !== undefined) {
      iframeEl.style.height = height.toString();
    }
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
    let url = `${formsortOrigin}/client/${clientLabel}/flow/${flowLabel}`;
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
