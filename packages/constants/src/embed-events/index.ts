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

export enum TokenRequestPayload {
  ID = 'ID'
}

export interface IIFrameTokenRequestEventData
  extends IWebEmbedEventData<WebEmbedMessage.EMBED_TOKEN_REQUEST_MSG> {
  payload: TokenRequestPayload;
}

export interface TokenResponsePayload {
  token: string;
}

export interface IIFrameTokenResponseMessage {
  type: WebEmbedMessage.EMBED_TOKEN_RESPONSE_MSG
  payload: TokenResponsePayload
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

export interface IIFrameStyleSetRequestEventData
  extends IWebEmbedEventData<WebEmbedMessage.EMBED_STYLE_SET_REQUEST_MSG> {}

export interface IIFrameStyleSetResponseMessage
  extends IWebEmbedEventData<WebEmbedMessage.EMBED_STYLE_SET_RESPONSE_MSG> {
  payload: {
    styleSet?: Record<string, unknown>;
  };
}

export type IIFramePushMessage = IIFrameTokenResponseMessage;
