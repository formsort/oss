import { AnalyticsEventType, WebEmbedMessage } from '@formsort/constants';
import {
  IIFrameAnalyticsEventData,
  IIFrameRedirectEventData,
} from './interfaces';

const FS_ORIGIN = (window as any).FS_ORIGIN;
const FLOW_ORIGIN = FS_ORIGIN || `https://flow.formsort.com`;

interface IFormsortWebEmbedConfig {
  useHistoryAPI: boolean;
}
const DEFAULT_CONFIG: IFormsortWebEmbedConfig = { useHistoryAPI: false };

class FormsortWebEmbed {
  private rootEl: HTMLElement;
  private iframeEl: HTMLIFrameElement;
  private onFlowLoadedCallback?: () => void;
  private onFlowClosedCallback?: () => void;
  private onFlowFinalizedCallback?: () => void;
  private onRedirectCallback?: (url: string) => void;
  private config: IFormsortWebEmbedConfig;

  constructor(
    rootEl: HTMLElement,
    config: IFormsortWebEmbedConfig = DEFAULT_CONFIG
  ) {
    this.rootEl = rootEl;
    this.config = config;
    const iframeEl = document.createElement('iframe');
    iframeEl.style.border = 'none';
    this.iframeEl = iframeEl;
    rootEl.appendChild(iframeEl);
    window.addEventListener('message', this.onWindowMessage);
  }

  setSize = (width: string, height: string) => {
    this.iframeEl.style.width = width;
    this.iframeEl.style.height = height;
  };

  set onFlowLoaded(callback: () => void) {
    this.onFlowLoadedCallback = callback;
  }

  set onFlowClosed(callback: () => void) {
    this.onFlowClosedCallback = callback;
  }

  set onFlowFinalized(callback: () => void) {
    this.onFlowFinalizedCallback = callback;
  }

  set onRedirect(callback: (url: string) => void) {
    this.onRedirectCallback = callback;
  }

  onWindowMessage = (message: MessageEvent) => {
    const { origin, source, data } = message;
    if (source !== this.iframeEl.contentWindow) {
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
      this.onEventMessage(data as IIFrameAnalyticsEventData);
    } else if (data.type === WebEmbedMessage.EMBED_REDIRECT_MSG) {
      this.onRedirectMessage(data as IIFrameRedirectEventData);
    }
  };

  onEventMessage = (eventData: IIFrameAnalyticsEventData) => {
    const { eventType } = eventData;
    if (eventType === AnalyticsEventType.FlowLoaded) {
      if (this.onFlowLoadedCallback) {
        this.onFlowLoadedCallback();
      }
    } else if (eventType === AnalyticsEventType.FlowClosed) {
      this.removeListeners();
      this.rootEl.removeChild(this.iframeEl);
      if (this.onFlowClosedCallback) {
        this.onFlowClosedCallback();
      }
    } else if (eventType === AnalyticsEventType.FlowFinalized) {
      if (this.onFlowFinalizedCallback) {
        this.onFlowFinalizedCallback();
      }
    }
  };

  onRedirectMessage = (redirectData: IIFrameRedirectEventData) => {
    const currentUrl = window.location.href;
    const currentHash = window.location.hash.slice(1);
    const currentUrlBase = currentUrl.replace(currentHash, '');

    const url = redirectData.payload;

    if (this.onRedirectCallback) {
      this.onRedirectCallback(url);
      return;
    }

    const hashIndex = url.indexOf('#');
    const urlHash = hashIndex >= 0 ? url.slice(hashIndex + 1) : undefined;
    const urlBase = urlHash !== undefined ? url.replace(urlHash, '') : url;

    if (urlHash && urlBase === currentUrlBase && urlHash !== currentHash) {
      window.location.hash = urlHash;
    }
    if (
      this.config.useHistoryAPI &&
      'history' in window &&
      url.indexOf(window.location.origin) === 0
    ) {
      window.history.pushState({}, document.title, url);
    } else {
      window.location.assign(url);
    }
  };

  removeListeners = () => {
    window.removeEventListener('message', this.onWindowMessage);
  };

  loadFlow = (
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
    this.iframeEl.src = url;
  };
}

export default FormsortWebEmbed;
