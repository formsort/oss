import { type AnswerSemanticType } from '@formsort/constants';
// import from directory for tree shaking
import CustomQuestionMessage from '@formsort/constants/lib/custom-question-message';
import { getValueFromWindowParent, sendMessageToWindowParent } from './utils';

// eslint-disable-next-line @typescript-eslint/ban-types
export type AnswerPrimitiveType = number | string | boolean | object;
export type AnswerType = AnswerPrimitiveType | AnswerPrimitiveType[];

let bodyResizeObserver: ResizeObserver | undefined;
export const setAutoHeight = (enabled: boolean) => {
  if (enabled) {
    if (!bodyResizeObserver) {
      bodyResizeObserver = new ResizeObserver(onBodyHeightChanged);
    }
    bodyResizeObserver.observe(document.body);
  } else {
    if (bodyResizeObserver) {
      bodyResizeObserver.disconnect();
      bodyResizeObserver = undefined;
    }
  }
};

const onBodyHeightChanged: ResizeObserverCallback = (entries) => {
  for (const entry of entries) {
    if (entry.target === document.body) {
      const { offsetHeight: height } = document.documentElement;
      sendResizeMessage(undefined /* width */, `${height}px`);
    }
  }
};

export const setQuestionSize = (
  width?: number | string,
  height?: number | string
) => {
  if (bodyResizeObserver) {
    throw new Error(
      'autoHeight is enabled. To manually size size, call setAutoHeight(false) first.'
    );
  }
  sendResizeMessage(width, height);
};

const sendResizeMessage = (
  width?: number | string,
  height?: number | string
) => {
  sendMessageToWindowParent(CustomQuestionMessage.SET_QUESTION_SIZE_MSG, {
    width,
    height,
  });
};

export const getAnswerValue = <T extends AnswerType = AnswerType>() =>
  getValueFromWindowParent<T | undefined>(
    CustomQuestionMessage.REQUEST_ANSWER_VALUE_MSG,
    CustomQuestionMessage.SET_ANSWER_VALUE_MSG
  );

export const getSemanticAnswerValue = <T extends AnswerType = AnswerType>(
  semanticType: AnswerSemanticType
) =>
  getValueFromWindowParent<T>(
    CustomQuestionMessage.REQUEST_SEMANTIC_ANSWER_VALUE_MSG,
    CustomQuestionMessage.SET_SEMANTIC_ANSWER_VALUE_MSG,
    semanticType
  );

export const getAllAnswerValues = () =>
  getValueFromWindowParent<{
    [key: string]: AnswerType | undefined;
  }>(
    CustomQuestionMessage.REQUEST_ANSWERS_MSG,
    CustomQuestionMessage.SET_ANSWERS_MSG
  );

export const getResponderUuid = () =>
  getValueFromWindowParent<string>(
    CustomQuestionMessage.REQUEST_RESPONDER_UUID_MSG,
    CustomQuestionMessage.SET_RESPONDER_UUID_MSG
  );

export const clearAnswerValue = () => {
  sendMessageToWindowParent(CustomQuestionMessage.CLEAR_ANSWER_VALUE_MSG);
};

export const setAnswerValue = (value: AnswerType) => {
  sendMessageToWindowParent(CustomQuestionMessage.SET_ANSWER_VALUE_MSG, value);
};

interface IDisableBackNavigationOptions {
  beforeUnloadMessage?: string;
}

export const setDisableBackNavigation = (
  disable: boolean,
  options?: IDisableBackNavigationOptions
) => {
  sendMessageToWindowParent(
    CustomQuestionMessage.SET_DISABLE_BACK_NAVIGATION_MSG,
    {
      disable,
      beforeUnloadMessage: options?.beforeUnloadMessage,
    }
  );
};
