import {
  AnalyticsEventType,
  type IIFrameAnalyticsEventData,
  type IIFrameRedirectEventData,
  type IIFrameTokenRequestEventData,
  TokenRequestPayload,
  type IIFramePushMessage,
  WebEmbedMessage,
  IBaseEventData,
  IFlowAnswers,
} from '@formsort/constants';
import {
  isIFrameAnalyticsEventData,
  isIFrameRedirectEventData,
  isIFrameResizeEventData,
  isIFrameStyleSetRequestEventData,
  isIFrameTokenRequestEventData,
  isIFrameUnauthorizedEventData,
  isIWebEmbedEventData,
} from './typeGuards';
import { addToArrayMap, isEmpty, removeFromArrayMap } from './utils';

interface IAuthenticationConfig {
  idToken: string;
}

interface IFlowEventPayload {
  variantRevisionUuid: string;
  answers?: IFlowAnswers;
}

export interface IFormsortEmbedConfig {
  autoHeight?: boolean;
  style?: Partial<Pick<CSSStyleDeclaration, 'width' | 'height'>>;
  /**
   * For Formsort internal use only
   */
  styleSet?: Record<string, unknown>;
  origin?: string;
  authentication?: IAuthenticationConfig;
}

export const isSupportedEventType = (
  eventType: AnalyticsEventType | SupportedAnalyticsEvent
): eventType is SupportedAnalyticsEvent => eventType in SupportedAnalyticsEvent;

export enum SupportedAnalyticsEvent {
  FlowLoaded = AnalyticsEventType.FlowLoaded,
  FlowClosed = AnalyticsEventType.FlowClosed,
  FlowFinalized = AnalyticsEventType.FlowFinalized,
  StepLoaded = AnalyticsEventType.StepLoaded,
  StepCompleted = AnalyticsEventType.StepCompleted,
  ResponderStateUpdated = AnalyticsEventType.ResponderStateUpdated,
}

interface IRedirectEventData extends IBaseEventData {
  url: string;
}

export type IEventListener = (props: IFlowEventPayload) => void;

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

interface IManagerParams {
  config: IFormsortEmbedConfig;
  onFlowClosed: () => void;
  onRedirect?: (url: string) => void;
  onResize: (width?: number, height?: number) => void;
  sendMessageToEmbed: (message: IIFramePushMessage) => void;
}

class EmbedMessagingManager {
  private readonly config: IManagerParams['config'];
  private readonly onFlowClosed: IManagerParams['onFlowClosed'];
  private readonly onRedirect?: IManagerParams['onRedirect'];
  private readonly onResize: IManagerParams['onResize'];
  private readonly sendMessageToEmbed: IManagerParams['sendMessageToEmbed'];

  private readonly eventListenersArrayMap: IEventListenersArrayMap = {
    [SupportedAnalyticsEvent.FlowLoaded]: [],
    [SupportedAnalyticsEvent.FlowClosed]: [],
    [SupportedAnalyticsEvent.FlowFinalized]: [],
    [SupportedAnalyticsEvent.StepLoaded]: [],
    [SupportedAnalyticsEvent.StepCompleted]: [],
    [SupportedAnalyticsEvent.ResponderStateUpdated]: [],
    redirect: [],
    unauthorized: [],
  };

  constructor({
    config,
    onFlowClosed,
    onRedirect,
    onResize,
    sendMessageToEmbed,
  }: IManagerParams) {
    this.sendMessageToEmbed = sendMessageToEmbed;
    this.config = config;
    this.onRedirect = onRedirect;
    this.onResize = onResize;
    this.onFlowClosed = onFlowClosed;
  }

  private onStyleSetRequest = () => {
    this.sendMessageToEmbed({
      type: WebEmbedMessage.EMBED_STYLE_SET_RESPONSE_MSG,
      payload: { styleSet: this.config.styleSet },
    });
  };

  private onTokenRequest = (data: IIFrameTokenRequestEventData) => {
    const { payload } = data;

    if (payload === TokenRequestPayload.ID) {
      if (this.config.authentication?.idToken) {
        this.sendMessageToEmbed({
          type: WebEmbedMessage.EMBED_TOKEN_RESPONSE_MSG,
          payload: { token: this.config.authentication.idToken },
        });
      } else {
        throw new Error(
          `The loaded Flow requires authentication using an ID token, please provide it in config.authentication.idToken.`
        );
      }
    }
  };

  private onRedirectMessage = (redirectData: IIFrameRedirectEventData) => {
    const { payload: url, answers } = redirectData;

    if (!isEmpty(this.eventListenersArrayMap.redirect)) {
      let cancelRedirect = false;
      // Cancel redirect if any of the redirect listeners return `{ cancel: true }`
      for (const redirectListener of this.eventListenersArrayMap.redirect) {
        const { cancel } = redirectListener({ url, answers }) || {};
        if (!cancelRedirect && cancel) {
          cancelRedirect = true;
        }
      }

      if (cancelRedirect) {
        return;
      }
    }

    this.onRedirect?.(url);
  };

  private onUnauthorizedMessage = () => {
    if (!isEmpty(this.eventListenersArrayMap.unauthorized)) {
      for (const unathorizedListener of this.eventListenersArrayMap
        .unauthorized) {
        unathorizedListener();
      }
    }
  };

  private getEventListenerArray = (
    eventType: AnalyticsEventType
  ): IEventListener[] | undefined => {
    if (isSupportedEventType(eventType)) {
      return this.eventListenersArrayMap[eventType];
    }

    return undefined;
  };

  private onEventMessage = (eventData: IIFrameAnalyticsEventData) => {
    const { eventType, answers, variantRevisionUuid } = eventData;

    if (eventType === AnalyticsEventType.FlowClosed) {
      this.onFlowClosed();
    }

    const eventListenersArr = this.getEventListenerArray(eventType);

    if (!eventListenersArr) {
      return;
    }

    for (const eventListener of eventListenersArr) {
      eventListener({ answers, variantRevisionUuid });
    }
  };

  onMessage = (data: unknown) => {
    if (!isIWebEmbedEventData(data)) {
      return;
    }

    if (isIFrameAnalyticsEventData(data)) {
      this.onEventMessage(data);
    } else if (isIFrameTokenRequestEventData(data)) {
      this.onTokenRequest(data);
    } else if (isIFrameRedirectEventData(data)) {
      this.onRedirectMessage(data);
    } else if (isIFrameResizeEventData(data) && this.config.autoHeight) {
      const { width, height } = data.payload;
      this.onResize?.(width, height);
    } else if (isIFrameUnauthorizedEventData(data)) {
      this.onUnauthorizedMessage();
    } else if (isIFrameStyleSetRequestEventData(data)) {
      this.onStyleSetRequest();
    }
  };

  addEventListener = <K extends keyof IEventMap>(
    eventName: K,
    fn: IEventMap[K]
  ) => {
    addToArrayMap(this.eventListenersArrayMap, eventName, fn);
  };

  removeEventListener = <K extends keyof IEventMap>(
    eventName: K,
    eventListener: IEventMap[K]
  ) => {
    removeFromArrayMap(this.eventListenersArrayMap, eventName, eventListener);
  };
}

export default EmbedMessagingManager;
