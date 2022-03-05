import { AnswerSemanticType, CustomQuestionMessage } from '@formsort/constants';
import { getValueFromWindowParent, sendMessageToWindowParent } from './utils';

// eslint-disable-next-line @typescript-eslint/ban-types
type AnswerPrimitiveType = number | string | boolean | object;
type AnswerType = AnswerPrimitiveType | AnswerPrimitiveType[];

export const setQuestionSize = (
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
