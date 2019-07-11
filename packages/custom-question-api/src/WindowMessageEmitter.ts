import { EventEmitter } from 'events';

import { CustomQuestionMessage } from '@formsort/constants';

const EVENTS_TO_EMIT = new Set([
  CustomQuestionMessage.SET_ANSWERS_MSG,
  CustomQuestionMessage.SET_ANSWER_VALUE_MSG,
]);

class WindowMessageEventsEmitter extends EventEmitter {
  constructor() {
    super();
    window.addEventListener('message', this.onWindowMessage);
  }

  onWindowMessage = (e: MessageEvent) => {
    const { type, payload } = e.data;
    if (!type || !EVENTS_TO_EMIT.has(type)) {
      return;
    }

    this.emit(type, payload);
  };
}

export default WindowMessageEventsEmitter;
