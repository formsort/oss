import WindowMessageEventsEmitter from './WindowMessageEmitter';

let emitterSingleton: WindowMessageEventsEmitter;
export const getEmitter = () => {
  if (!emitterSingleton) {
    emitterSingleton = new WindowMessageEventsEmitter();
  }
  return emitterSingleton;
};

export const sendMessageToWindowParent = (
  type: string,
  payload?: any,
  requestId?: string
) => {
  if (!window.parent) {
    throw new Error(
      'Custom questions must run within a Formsort flow custom question to work.'
    );
  }
  window.parent.postMessage(
    {
      type,
      payload,
      requestId,
    },
    '*'
  );
};

export const getValueFromWindowParent: <T>(
  requestEventType: string,
  responseEventType: string,
  requestPayload?: any
) => Promise<T> = (requestEventType, responseEventType, requestPayload) => {
  const requestId = Math.random().toString();
  return new Promise((resolve) => {
    const onMessage = (value: any, returningRequestId?: string) => {
      if (requestId === returningRequestId) {
        resolve(value);
        getEmitter().removeListener(responseEventType, onMessage);
      }
    };

    getEmitter().on(responseEventType, onMessage);
    sendMessageToWindowParent(requestEventType, requestPayload, requestId);
  });
};
