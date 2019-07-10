import { EventEmitter } from "events";

import { SET_ANSWER_VALUE_MSG, SET_ANSWERS_MSG } from "@formsort/constants";

const EVENTS_TO_EMIT = new Set([SET_ANSWERS_MSG, SET_ANSWER_VALUE_MSG]);

class WindowMessageEventsEmitter extends EventEmitter {
  constructor() {
    super();
    window.addEventListener("message", this.onWindowMessage);
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
