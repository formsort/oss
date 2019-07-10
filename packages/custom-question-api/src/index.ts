import {
  CLEAR_ANSWER_VALUE_MSG,
  REQUEST_ANSWER_VALUE_MSG,
  REQUEST_ANSWERS_MSG,
  REQUEST_RESPONDER_UUID_MSG,
  SET_ANSWER_VALUE_MSG,
  SET_ANSWERS_MSG,
  SET_QUESTION_SIZE_MSG,
  SET_RESPONDER_UUID_MSG
} from "@formsort/constants";
import { getValueFromWindowParent, sendMessageToWindowParent } from "./utils";

export const setQuestionSize = (width?: number, height?: number) => {
  sendMessageToWindowParent(SET_QUESTION_SIZE_MSG, {
    width,
    height
  });
};

export const getAnswerValue = () => {
  return getValueFromWindowParent(
    REQUEST_ANSWER_VALUE_MSG,
    SET_ANSWER_VALUE_MSG
  );
};

export const getAnswers = () => {
  return getValueFromWindowParent(REQUEST_ANSWERS_MSG, SET_ANSWERS_MSG);
};

export const getResponderUuid = () => {
  return getValueFromWindowParent(
    REQUEST_RESPONDER_UUID_MSG,
    SET_RESPONDER_UUID_MSG
  );
};

export const clearAnswerValue = () => {
  sendMessageToWindowParent(CLEAR_ANSWER_VALUE_MSG);
};

export const setAnswerValue = (value: number | string | boolean) => {
  sendMessageToWindowParent(SET_ANSWER_VALUE_MSG, value);
};