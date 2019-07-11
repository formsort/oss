import { AnalyticsEventType, WebEmbedMessage } from '@formsort/constants';
import {
  IIFrameAnalyticsEventData,
  IIFrameRedirectEventData,
} from './interfaces';

const FLOW_ORIGIN = 'https://flow.formsort.com';

class FormsortWebEmbed {
  private rootEl: HTMLElement;
  private iframeEl: HTMLIFrameElement;
  private onFlowLoadedCallback?: () => void;
  private onFlowClosedCallback?: () => void;
  private onFlowFinalizedCallback?: () => void;

  constructor(rootEl: HTMLElement) {
    this.rootEl = rootEl;
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

    if (data.msgType === WebEmbedMessage.EMBED_EVENT_MSG) {
      this.onEventMessage(data as IIFrameAnalyticsEventData);
    } else if (data.msgType === WebEmbedMessage.EMBED_REDIRECT_MSG) {
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
    const url = redirectData.payload;
    window.location.assign(url);
  };

  removeListeners = () => {
    window.removeEventListener('message', this.onWindowMessage);
  };

  loadFlow = (
    clientLabel: string,
    flowLabel: string,
    variantLabel?: string
  ) => {
    let url = `${FLOW_ORIGIN}/client/${clientLabel}/flow/${flowLabel}`;
    if (variantLabel) {
      url += `/variant/${variantLabel}`;
    }

    this.iframeEl.src = url;
  };
}

export default FormsortWebEmbed;
