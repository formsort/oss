import type { IIFramePushMessage } from '@formsort/constants';

const getMessageSender = (iframe: HTMLIFrameElement) => (message: IIFramePushMessage) => {
  iframe.contentWindow?.postMessage(message, "*");
}

export {
  getMessageSender
}
