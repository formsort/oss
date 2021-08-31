import { AnalyticsEventType, WebEmbedMessage } from '@formsort/constants';

/**
 * @TODO: these types should be moved to @formsort/constants
 * And used by both formsort/web and web-embed-api
 */

export type JSONPrimitive = string | boolean | number;

export interface IAddressObject {
  raw?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
}

export type IAnswer =
  | undefined
  | JSONPrimitive
  | JSONPrimitive[]
  | Partial<IAddressObject>;

export interface IFlowAnswers {
  [answerKey: string]: IAnswer;
}

interface WebEmbedEventData  {
  type: WebEmbedMessage;
}

export interface IIFrameAnalyticsEventData extends WebEmbedEventData {
  createdAt: Date;
  eventType: AnalyticsEventType;
  type: WebEmbedMessage.EMBED_EVENT_MSG;
  // Answers are only available when the iframe is embedded in a whitelisted domain
  answers: IFlowAnswers | undefined;
}

export interface IIFrameRedirectEventData extends WebEmbedEventData {
  payload: string;
  type: WebEmbedMessage.EMBED_REDIRECT_MSG
}

export interface IIFrameResizeEventData extends WebEmbedEventData {
  payload: {
    width?: number;
    height?: number;
  };
  type: WebEmbedMessage.EMBED_REDIRECT_MSG
}
