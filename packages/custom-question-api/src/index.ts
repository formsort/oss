import { AnswerSemanticType, CustomQuestionMessage } from '@formsort/constants';
import { getValueFromWindowParent, sendMessageToWindowParent } from './utils';

type AnswerPrimitiveType = number | string | boolean;
type AnswerType = AnswerPrimitiveType | AnswerPrimitiveType[];

export const setQuestionSize = (width?: number, height?: number) => {
  sendMessageToWindowParent(CustomQuestionMessage.SET_QUESTION_SIZE_MSG, {
    width,
    height,
  });
};

export const getAnswerValue = () => {
  return getValueFromWindowParent<AnswerType>(
    CustomQuestionMessage.REQUEST_ANSWER_VALUE_MSG,
    CustomQuestionMessage.SET_ANSWER_VALUE_MSG
  );
};

export const getSemanticAnswerValue = (semanticType: AnswerSemanticType) => {
  return getValueFromWindowParent<AnswerType>(
    CustomQuestionMessage.REQUEST_SEMANTIC_ANSWER_VALUE_MSG,
    CustomQuestionMessage.SET_SEMANTIC_ANSWER_VALUE_MSG,
    semanticType
  );
};

export const getAllAnswerValues = () => {
  return getValueFromWindowParent<{ [key: string]: AnswerType }>(
    CustomQuestionMessage.REQUEST_ANSWERS_MSG,
    CustomQuestionMessage.SET_ANSWERS_MSG
  );
};

export const getResponderUuid = () => {
  return getValueFromWindowParent<string>(
    CustomQuestionMessage.REQUEST_RESPONDER_UUID_MSG,
    CustomQuestionMessage.SET_RESPONDER_UUID_MSG
  );
};

export const clearAnswerValue = () => {
  sendMessageToWindowParent(CustomQuestionMessage.CLEAR_ANSWER_VALUE_MSG);
};

export const setAnswerValue = (value: number | string | boolean) => {
  sendMessageToWindowParent(CustomQuestionMessage.SET_ANSWER_VALUE_MSG, value);
};
