import EmbedMessagingManager, {
  type IFormsortEmbedConfig,
  type IEventMap,
  SupportedAnalyticsEvent,
} from '@formsort/embed-messaging-manager';

import { getMessageSender } from './iframe-utils';
import { isLocalOrLegacyFlowOrigin } from './utils';

interface IFormsortEmbedControls {
  unloadFlow: () => void;
  setSize: (width: string, height: string) => void;
  addEventListener<K extends keyof IEventMap>(
    eventName: K,
    fn: IEventMap[K]
  ): void;
  removeEventListener<K extends keyof IEventMap>(
    eventName: K,
    eventListener: IEventMap[K]
  ): void;
}

interface IFormsortWebEmbed extends IFormsortEmbedControls {
  loadFlow: (
    clientLabel: string,
    flowLabel: string,
    variantLabel?: string,
    queryParams?: Array<[string, string]>
  ) => void;
}

interface IFormsortSecureWebEmbed extends IFormsortEmbedControls {
  loadFlow: (
    clientLabel: string,
    flowLabel: string,
    variantLabel?: string,
    responderUuid?: string,
    initialAnswers?: FormsortInitialAnswers
  ) => void;
}

interface IFormsortWebEmbedConfig extends IFormsortEmbedConfig {
  useHistoryAPI?: boolean;
  /**
   * iframe title attribute for accessibility
   */
  iframeTitle?: string;
  /**
   * iframe allow attribute for permissions
   * e.g. "camera;"
   */
  iframeAllow?: string;
}

type FormsortInitialAnswerValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | FormsortInitialAnswerValue[]
  | { [key: string]: FormsortInitialAnswerValue };

type FormsortInitialAnswers = Record<string, FormsortInitialAnswerValue>;

const DEFAULT_CONFIG: IFormsortWebEmbedConfig = {
  useHistoryAPI: false,
};

const DEFAULT_ALLOW = 'camera;';

let secureIframeCount = 0;

const addPostData = (
  formEl: HTMLFormElement,
  name: string,
  value: FormsortInitialAnswerValue
) => {
  if (value === undefined) {
    return;
  }

  if (Array.isArray(value)) {
    if (value.every((item) => typeof item !== 'object' || item === null)) {
      const selectEl = document.createElement('select');
      selectEl.name = name;
      selectEl.multiple = true;
      value.forEach((item) => {
        const optionEl = document.createElement('option');
        optionEl.value = item === null ? '' : String(item);
        optionEl.selected = true;
        selectEl.appendChild(optionEl);
      });
      formEl.appendChild(selectEl);
      return;
    }

    value.forEach((item, index) => {
      addPostData(formEl, `${name}[${index}]`, item);
    });
    return;
  }

  if (typeof value === 'object' && value !== null) {
    Object.entries(value).forEach(([key, item]) => {
      addPostData(formEl, `${name}[${key}]`, item);
    });
    return;
  }

  const inputEl = document.createElement('input');
  inputEl.type = 'hidden';
  inputEl.name = name;
  inputEl.value = value === null ? '' : String(value);
  formEl.appendChild(inputEl);
};

const createFormsortWebEmbed = (
  rootEl: HTMLElement,
  config: IFormsortWebEmbedConfig,
  secure = false
) => {
  const iframeEl = document.createElement('iframe');
  const { style, iframeAllow = DEFAULT_ALLOW, iframeTitle } = config;
  let loadedOrigin: string;
  let formEl: HTMLFormElement | undefined;
  iframeEl.style.border = 'none';
  iframeEl.allow = iframeAllow || DEFAULT_ALLOW;
  if (style) {
    const { width = '', height = '' } = style;
    iframeEl.style.width = width;
    iframeEl.style.height = height;
  }

  if (iframeTitle) {
    iframeEl.title = iframeTitle;
  }

  const frameName = `formsort-secure-embed-form-${secureIframeCount++}`;
  iframeEl.name = frameName;

  // frame name should be set before appending to the DOM
  // otherwise POSTs targeting the iframe can open a new tab instead of the iframe
  rootEl.appendChild(iframeEl);

  const setSize = (width?: string | number, height?: string | number) => {
    if (width !== undefined) {
      iframeEl.style.width = width.toString();
    }
    if (height !== undefined) {
      iframeEl.style.height = height.toString();
    }
  };

  const unloadFlow = () => {
    removeListeners();
    formEl?.remove();
    try {
      rootEl.removeChild(iframeEl);
    } catch {
      // noop: iframe already removed OR blur event triggered by iframe removal
    }
  };

  const messagingManager = new EmbedMessagingManager({
    config,
    sendMessageToEmbed: getMessageSender(iframeEl),
    onRedirect: (url: string) => {
      if (
        config.useHistoryAPI &&
        'history' in window &&
        url.indexOf(window.location.origin) === 0
      ) {
        window.history.pushState({}, document.title, url);
      } else {
        window.location.assign(url);
      }
    },
    onResize: setSize,
    onFlowClosed: unloadFlow,
  });

  messagingManager.addEventListener(
    SupportedAnalyticsEvent.FlowLoaded,
    (payload) => {
      if (payload.documentTitle && !iframeEl.title) {
        iframeEl.title = payload.documentTitle;
      }
    }
  );

  const onWindowMessage = (message: MessageEvent<unknown>) => {
    const { origin: msgOrigin, source, data } = message;
    if (source !== iframeEl.contentWindow) {
      // If we have multiple Formsort instances within a page, only listen to events coming
      // from the iframe that this embed instance controls.
      return;
    }

    if (msgOrigin !== loadedOrigin) {
      return;
    }

    messagingManager.onMessage(data);
  };

  if (typeof window !== undefined) {
    window.addEventListener('message', onWindowMessage);
  }

  const removeListeners = () => {
    window.removeEventListener('message', onWindowMessage);
  };

  const loadFlow = (
    clientLabel: string,
    flowLabel: string,
    variantLabel?: string,
    queryParamsOrResponderUuid?: Array<[string, string]> | string,
    initialAnswers?: FormsortInitialAnswers
  ) => {
    let urlBase: string;
    if (config.origin) {
      loadedOrigin = config.origin;

      if (isLocalOrLegacyFlowOrigin(config.origin)) {
        urlBase = `${config.origin}/client/${clientLabel}`;
      } else {
        urlBase = config.origin;
      }
    } else {
      const subdomain = clientLabel
        .toLowerCase()
        .replace(/[^0-9a-z]/g, '') // Remove non-alphanumerics
        .replace(/^[0-9]+/, ''); // Remove leading numbers
      loadedOrigin = urlBase = `https://${subdomain}.formsort.app`;
    }

    let url = `${urlBase}/flow/${flowLabel}`;
    if (variantLabel) {
      url += `/variant/${variantLabel}`;
    }

    if (!secure) {
      if (Array.isArray(queryParamsOrResponderUuid)) {
        url += `?${queryParamsOrResponderUuid
          .map(
            ([key, value]) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
          )
          .join('&')}`;
      }

      iframeEl.src = url;
      return;
    }

    formEl?.remove();
    const nextFormEl = document.createElement('form');
    formEl = nextFormEl;
    nextFormEl.method = 'POST';
    nextFormEl.hidden = true;
    nextFormEl.action = url;
    nextFormEl.target = frameName;
    Object.entries(initialAnswers ?? {}).forEach(([key, value]) => {
      addPostData(nextFormEl, key, value);
    });
    if (typeof queryParamsOrResponderUuid === 'string') {
      addPostData(nextFormEl, 'responderUuid', queryParamsOrResponderUuid);
    }
    rootEl.appendChild(nextFormEl);
    nextFormEl.submit();
  };

  return {
    loadFlow,
    unloadFlow,
    setSize,
    addEventListener: messagingManager.addEventListener,
    removeEventListener: messagingManager.removeEventListener,
  };
};

const FormsortWebEmbed = (
  rootEl: HTMLElement,
  config: IFormsortWebEmbedConfig = DEFAULT_CONFIG
): IFormsortWebEmbed => createFormsortWebEmbed(rootEl, config);

const FormsortSecureWebEmbed = (
  rootEl: HTMLElement,
  config: IFormsortWebEmbedConfig = DEFAULT_CONFIG
): IFormsortSecureWebEmbed => createFormsortWebEmbed(rootEl, config, true);

export {
  FormsortInitialAnswers,
  FormsortInitialAnswerValue,
  FormsortSecureWebEmbed,
  IFormsortSecureWebEmbed,
  IFormsortWebEmbed,
  IFormsortWebEmbedConfig,
  IEventMap,
};

export { SupportedAnalyticsEvent } from '@formsort/embed-messaging-manager';

export default FormsortWebEmbed;
