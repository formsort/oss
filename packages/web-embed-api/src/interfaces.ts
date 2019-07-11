import { AnalyticsEventType, WebEmbedMessage } from '@formsort/constants';

export interface IIFrameAnalyticsEventData {
  createdAt: Date;
  eventType: AnalyticsEventType;
  type: WebEmbedMessage.EMBED_EVENT_MSG;
}

export interface IIFrameRedirectEventData {
  payload: string;
  type: WebEmbedMessage.EMBED_REDIRECT_MSG;
}
