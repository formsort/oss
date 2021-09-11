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

interface IWebEmbedEventData<Type extends WebEmbedMessage = WebEmbedMessage> {
  type: Type;
}

export interface IAnswersData {
  // Answers are only available when the iframe is embedded in a whitelisted domain
  answers: IFlowAnswers | undefined;
}

export interface IIFrameAnalyticsEventData
  extends IWebEmbedEventData<WebEmbedMessage.EMBED_EVENT_MSG>,
    IAnswersData {
  createdAt: Date;
  eventType: AnalyticsEventType;
}

export interface IIFrameRedirectEventData
  extends IWebEmbedEventData<WebEmbedMessage.EMBED_REDIRECT_MSG>,
    IAnswersData {
  payload: string;
}

export interface IIFrameResizeEventData
  extends IWebEmbedEventData<WebEmbedMessage.EMBED_RESIZE_MSG> {
  payload: {
    width?: number;
    height?: number;
  };
}
