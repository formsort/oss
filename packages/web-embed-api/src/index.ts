import { AnalyticsEventType, WebEmbedMessage } from '@formsort/constants';
import {
  IIFrameAnalyticsEventData,
  IIFrameRedirectEventData,
} from './interfaces';

const FS_ORIGIN = (window as any).FS_ORIGIN;
const FLOW_ORIGIN = FS_ORIGIN || `https://flow.formsort.com`;

export interface IFormsortWebEmbed {
  loadFlow: (
    clientLabel: string,
    flowLabel: string,
    variantLabel?: string,
    queryParams?: Array<[string, string]>
  ) => void;
  setSize: (width: string, height: string) => void;
  onFlowLoaded: () => void;
  onFlowClosed: () => void;
  onFlowFinalized: () => void;
  onRedirect: (url: string) => void;
}

interface IFormsortWebEmbedConfig {
  useHistoryAPI: boolean;
}
const DEFAULT_CONFIG: IFormsortWebEmbedConfig = { useHistoryAPI: false };

const FormsortWebEmbed = (
  rootEl: HTMLElement,
  config: IFormsortWebEmbedConfig = DEFAULT_CONFIG
): IFormsortWebEmbed => {
  const iframeEl = document.createElement('iframe');
  iframeEl.style.border = 'none';

  rootEl.appendChild(iframeEl);

  const onRedirectMessage = (redirectData: IIFrameRedirectEventData) => {
    const currentUrl = window.location.href;
    const currentHash = window.location.hash.slice(1);
    const currentUrlBase = currentUrl.replace(currentHash, '');

    const url = redirectData.payload;

    if (onRedirectCallback) {
      onRedirectCallback(url);
      return;
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

  let onFlowLoadedCallback: () => void;
  let onFlowClosedCallback: () => void;
  let onFlowFinalizedCallback: () => void;
  let onRedirectCallback: (url: string) => void;

  const setSize = (width: string, height: string) => {
    iframeEl.style.width = width;
    iframeEl.style.height = height;
  };

  const onEventMessage = (eventData: IIFrameAnalyticsEventData) => {
    const { eventType } = eventData;
    if (eventType === AnalyticsEventType.FlowLoaded) {
      if (onFlowLoadedCallback) {
        onFlowLoadedCallback();
      }
    } else if (eventType === AnalyticsEventType.FlowClosed) {
      removeListeners();
      rootEl.removeChild(iframeEl);
      if (onFlowClosedCallback) {
        onFlowClosedCallback();
      }
    } else if (eventType === AnalyticsEventType.FlowFinalized) {
      if (onFlowFinalizedCallback) {
        onFlowFinalizedCallback();
      }
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
    set onFlowLoaded(callback: () => void) {
      onFlowLoadedCallback = callback;
    },
    set onFlowClosed(callback: () => void) {
      onFlowClosedCallback = callback;
    },
    set onFlowFinalized(callback: () => void) {
      onFlowFinalizedCallback = callback;
    },
    set onRedirect(callback: (url: string) => void) {
      onRedirectCallback = callback;
    },
  };
};

export default FormsortWebEmbed;
