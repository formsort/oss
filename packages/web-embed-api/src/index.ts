import {
  AnalyticsEventType,
  IIFrameAnalyticsEventData,
  IIFrameRedirectEventData,
  IIFrameResizeEventData,
  IIFrameTokenRequestEventData,
  IFlowAnswers,
  TokenRequestPayload,
  WebEmbedMessage,
} from '@formsort/constants';
import { getMessageSender } from './iframe-utils';
import {
  isIWebEmbedEventData,
  isIFrameRedirectEventData,
  isIFrameResizeEventData,
  isIFrameAnalyticsEventData,
  isIFrameTokenRequestEventData,
  isIFrameUnauthorizedEventData,
} from './typeGuards';
import { addToArrayMap, isEmpty, removeFromArrayMap } from './utils';

const DEFAULT_FLOW_DOMAIN = 'formsort.app';

export interface IFormsortWebEmbed {
  loadFlow: (
    clientLabel: string,
    flowLabel: string,
    variantLabel?: string,
    queryParams?: Array<[string, string]>
  ) => void;
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

interface IAuthenticationConfig {
  idToken: string;
}

export interface IFormsortWebEmbedConfig {
  useHistoryAPI?: boolean;
  autoHeight?: boolean;
  style?: Partial<Pick<CSSStyleDeclaration, 'width' | 'height'>>;
  origin?: string;
  authentication?: IAuthenticationConfig;
}

const DEFAULT_CONFIG: IFormsortWebEmbedConfig = {
  useHistoryAPI: false,
  origin: undefined,
};

export enum SupportedAnalyticsEvent {
  FlowLoaded = AnalyticsEventType.FlowLoaded,
  FlowClosed = AnalyticsEventType.FlowClosed,
  FlowFinalized = AnalyticsEventType.FlowFinalized,
  StepLoaded = AnalyticsEventType.StepLoaded,
  StepCompleted = AnalyticsEventType.StepCompleted,
}

export const isSupportedEventType = (
  eventType: AnalyticsEventType | SupportedAnalyticsEvent
): eventType is SupportedAnalyticsEvent => eventType in SupportedAnalyticsEvent;

interface IBaseEventData {
  answers: IFlowAnswers | undefined;
}

interface IRedirectEventData extends IBaseEventData {
  url: string;
}

export type IEventListener = (props: IBaseEventData) => void;

export type IAnalyticsEventMap = Record<
  SupportedAnalyticsEvent,
  IEventListener
>;

export interface IEventMap extends IAnalyticsEventMap {
  redirect: (props: IRedirectEventData) => {
    cancel?: boolean;
  } | void;
  unauthorized: () => void;
}

export type IEventListenersArrayMap = {
  [K in keyof IEventMap]: Array<IEventMap[K]>;
};

const FormsortWebEmbed = (
  rootEl: HTMLElement,
  config: IFormsortWebEmbedConfig = DEFAULT_CONFIG
): IFormsortWebEmbed => {
  const iframeEl = document.createElement('iframe');
  const { style, autoHeight } = config;
  let formsortOrigin = config.origin;
  iframeEl.style.border = 'none';
  if (style) {
    const { width = '', height = '' } = style;
    iframeEl.style.width = width;
    iframeEl.style.height = height;
  }

  rootEl.appendChild(iframeEl);
  const sendMessage = getMessageSender(iframeEl);

  const eventListenersArrayMap: IEventListenersArrayMap = {
    [SupportedAnalyticsEvent.FlowLoaded]: [],
    [SupportedAnalyticsEvent.FlowClosed]: [],
    [SupportedAnalyticsEvent.FlowFinalized]: [],
    [SupportedAnalyticsEvent.StepLoaded]: [],
    [SupportedAnalyticsEvent.StepCompleted]: [],
    redirect: [],
    unauthorized: [],
  };

  const onTokenRequest = (data: IIFrameTokenRequestEventData) => {
    const { payload } = data;

    if (payload === TokenRequestPayload.ID) {
      if (config.authentication?.idToken) {
        sendMessage({
          type: WebEmbedMessage.EMBED_TOKEN_RESPONSE_MSG,
          payload: { token: config.authentication.idToken },
        });
      } else {
        throw new Error(
          `The loaded Flow requires authentication using an ID token, please provide it in config.authentication.idToken.`
        );
      }
    }
  };

  const onRedirectMessage = (redirectData: IIFrameRedirectEventData) => {
    const { payload: url, answers } = redirectData;

    if (!isEmpty(eventListenersArrayMap.redirect)) {
      let cancelRedirect = false;
      // Cancel redirect if any of the redirect listeners return `{ cancel: true }`
      for (const redirectListener of eventListenersArrayMap.redirect) {
        const { cancel } = redirectListener({ url, answers }) || {};
        if (!cancelRedirect && cancel) {
          cancelRedirect = true;
        }
      }

      if (cancelRedirect) {
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

  const onUnauthorizedMessage = () => {
    if (!isEmpty(eventListenersArrayMap.unauthorized)) {
      for (const unathorizedListener of eventListenersArrayMap.unauthorized) {
        unathorizedListener();
      }
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
      // If we have multiple Formsort instances within a page, only listen to events coming
      // from the iframe that this embed instance controls.
      return;
    }

    if (msgOrigin !== formsortOrigin) {
      return;
    }

    if (!isIWebEmbedEventData(data)) {
      return;
    }

    if (isIFrameAnalyticsEventData(data)) {
      onEventMessage(data);
    } else if (isIFrameTokenRequestEventData(data)) {
      onTokenRequest(data);
    } else if (isIFrameRedirectEventData(data)) {
      onRedirectMessage(data);
    } else if (isIFrameResizeEventData(data) && autoHeight) {
      onResizeMessage(data);
    } else if (isIFrameUnauthorizedEventData(data)) {
      onUnauthorizedMessage();
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

  const getEventListenerArray = (
    eventType: AnalyticsEventType
  ): IEventListener[] | undefined => {
    if (isSupportedEventType(eventType)) {
      return eventListenersArrayMap[eventType];
    }

    return undefined;
  };

  const onEventMessage = (eventData: IIFrameAnalyticsEventData) => {
    const { eventType, answers } = eventData;

    if (eventType === AnalyticsEventType.FlowClosed) {
      removeListeners();
      rootEl.removeChild(iframeEl);
    }

    const eventListenersArr = getEventListenerArray(eventType);

    if (!eventListenersArr) {
      return;
    }

    for (const eventListener of eventListenersArr) {
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
    // We overwrite `formsortOrigin` because `onWindowMessage` will read it
    formsortOrigin = formsortOrigin || `https://${clientLabel}.${DEFAULT_FLOW_DOMAIN}`;
    let url;

    if (config.origin) {
      url = `${formsortOrigin}/client/${clientLabel}/flow/${flowLabel}`;
    } else {
      url = `${formsortOrigin}/flow/${flowLabel}`;
    }

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
    setSize,
    addEventListener<K extends keyof IEventMap>(
      eventName: K,
      fn: IEventMap[K]
    ): void {
      addToArrayMap(eventListenersArrayMap, eventName, fn);
    },
    removeEventListener<K extends keyof IEventMap>(
      eventName: K,
      eventListener: IEventMap[K]
    ): void {
      removeFromArrayMap(eventListenersArrayMap, eventName, eventListener);
    },
  };
};

export default FormsortWebEmbed;
