import { AnalyticsEventType, WebEmbedMessage, IFlowAnswers } from '../';

export interface IBaseEventData {
  answers: IFlowAnswers | undefined;
}

export interface IRedirectEventData extends IBaseEventData {
  url: string;
}

export interface IWebEmbedEventData<
  Type extends WebEmbedMessage = WebEmbedMessage
> extends IBaseEventData {
  type: Type;
}

export interface IIFrameAnalyticsEventData
  extends IWebEmbedEventData<WebEmbedMessage.EMBED_EVENT_MSG> {
  createdAt: Date;
  eventType: AnalyticsEventType;
}

export interface IIFrameRedirectEventData
  extends IWebEmbedEventData<WebEmbedMessage.EMBED_REDIRECT_MSG> {
  payload: string;
}

export interface IIFrameResizeEventData
  extends IWebEmbedEventData<WebEmbedMessage.EMBED_RESIZE_MSG> {
  payload: {
    width?: number;
    height?: number;
  };
}
