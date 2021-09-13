import { AnalyticsEventType } from '@formsort/constants';
import {
  IIFrameAnalyticsEventData,
  IIFrameRedirectEventData,
  IIFrameResizeEventData,
  IFlowAnswers,
} from './interfaces';
import {
  isIWebEmbedEventData,
  isIFrameRedirectEventData,
  isIFrameResizeEventData,
  isIframeAnalyticsEventData,
} from './typeGuards';

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

const supportedAnalyticsEvents = [
  AnalyticsEventType.FlowLoaded,
  AnalyticsEventType.FlowClosed,
  AnalyticsEventType.FlowFinalized,
  AnalyticsEventType.StepLoaded,
  AnalyticsEventType.StepCompleted,
] as const;

type SupportedAnalyticsEvent = typeof supportedAnalyticsEvents[number];

const isSupportedEventType = (
  eventType: AnalyticsEventType
): eventType is SupportedAnalyticsEvent =>
  supportedAnalyticsEvents.includes(eventType as SupportedAnalyticsEvent);

interface IBaseEventProps {
  answers: IFlowAnswers | undefined;
}

interface IRedirectEventProps extends IBaseEventProps {
  url: string;
}

export interface IAnalyticsEventMap {
  FlowLoaded?: (props: IBaseEventProps) => void;
  FlowClosed?: (props: IBaseEventProps) => void;
  FlowFinalized?: (props: IBaseEventProps) => void;
  StepLoaded?: (props: IBaseEventProps) => void;
  StepCompleted?: (props: IBaseEventProps) => void;
}

export interface IEventMap extends IAnalyticsEventMap {
  redirect?: (
    props: IRedirectEventProps
  ) => {
    cancel?: boolean;
    customUrl?: string;
  } | void;
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
    const { payload: url, answers } = redirectData;

    if (eventListeners.redirect) {
      const { cancel } = eventListeners.redirect({ url, answers }) || {};
      if (cancel) {
        return;
      }
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

  // @TODO: In Typescript v4+ MessageEvent is generic
  // and can be typed as MessageEvent<unknown> to increase type safety.
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

    if (!isIWebEmbedEventData(data)) {
      return;
    }

    if (isIframeAnalyticsEventData(data)) {
      onEventMessage(data);
    } else if (isIFrameRedirectEventData(data)) {
      onRedirectMessage(data);
    } else if (isIFrameResizeEventData(data) && autoHeight) {
      onResizeMessage(data);
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

  const getEventListener = (eventType: AnalyticsEventType) => {
    if (isSupportedEventType(eventType)) {
      return eventListeners[eventType];
    }

    return undefined;
  };

  const onEventMessage = (eventData: IIFrameAnalyticsEventData) => {
    const { eventType, answers } = eventData;

    if (eventType === AnalyticsEventType.FlowClosed) {
      removeListeners();
      rootEl.removeChild(iframeEl);
    }

    const eventListener = getEventListener(eventType);
    if (eventListener) {
      eventListener({ answers });
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
