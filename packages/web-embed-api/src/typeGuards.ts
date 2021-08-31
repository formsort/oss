import { WebEmbedMessage } from '@formsort/constants';
import {
  IIFrameAnalyticsEventData,
  IIFrameRedirectEventData,
  IIFrameResizeEventData,
  WebEmbedEventData,
} from './interfaces';

function isRecord(val: unknown): val is { [key: string]: unknown } {
  return val !== null && typeof val === 'object';
}

function isString(val: unknown): val is string {
  return typeof val === 'string';
}

export function isWebEmbedEventData(val: unknown): val is WebEmbedEventData {
  return isRecord(val) && isString(val.type);
}

/**
 * Note: The type guards below are not comprehensive -
 * i.e. we are not checking that all properties of the expected type exist
 * on the given value.
 */

export function isIframeAnalyticsEventData(
  data: WebEmbedEventData
): data is IIFrameAnalyticsEventData {
  return data.type === WebEmbedMessage.EMBED_EVENT_MSG;
}

export function isIFrameRedirectEventData(
  data: WebEmbedEventData
): data is IIFrameRedirectEventData {
  return data.type === WebEmbedMessage.EMBED_REDIRECT_MSG;
}

export function isIFrameResizeEventData(
  data: WebEmbedEventData
): data is IIFrameResizeEventData {
  return data.type === WebEmbedMessage.EMBED_RESIZE_MSG;
}
