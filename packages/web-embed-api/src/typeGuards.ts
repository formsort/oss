import {
  WebEmbedMessage,
  IIFrameAnalyticsEventData,
  IIFrameTokenRequestEventData,
  IIFrameRedirectEventData,
  IIFrameResizeEventData,
  IWebEmbedEventData,
} from '@formsort/constants';

function isRecord(val: unknown): val is { [key: string]: unknown } {
  return val !== null && typeof val === 'object';
}

function isString(val: unknown): val is string {
  return typeof val === 'string';
}

/**
 * Checks if `val` is equal to one of the values of the enum
 * @param val
 * @param anEnum
 */
const isEnumMember = <EnumType extends { [key: string]: unknown }>(
  val: unknown,
  anEnum: EnumType
): val is EnumType[keyof EnumType] =>
  Object.values(anEnum).includes(val as EnumType[keyof EnumType]);

export function isIWebEmbedEventData(val: unknown): val is IWebEmbedEventData {
  return (
    isRecord(val) &&
    isString(val.type) &&
    isEnumMember(val.type, WebEmbedMessage)
  );
}

/**
 * Note: The type guards below are not comprehensive -
 * i.e. we are not checking that all properties of the expected type exist
 * on the given value.
 */

export function isIFrameAnalyticsEventData(
  data: IWebEmbedEventData
): data is IIFrameAnalyticsEventData {
  return data.type === WebEmbedMessage.EMBED_EVENT_MSG;
}

export function isIFrameTokenRequestEventData(
  data: IWebEmbedEventData
): data is IIFrameTokenRequestEventData {
  return data.type === WebEmbedMessage.EMBED_TOKEN_REQUEST_MSG;
}

export function isIFrameRedirectEventData(
  data: IWebEmbedEventData
): data is IIFrameRedirectEventData {
  return data.type === WebEmbedMessage.EMBED_REDIRECT_MSG;
}

export function isIFrameResizeEventData(
  data: IWebEmbedEventData
): data is IIFrameResizeEventData {
  return data.type === WebEmbedMessage.EMBED_RESIZE_MSG;
}
