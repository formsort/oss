import * as WebEmbedApi from '@formsort/web-embed-api';
import type {
  IEventMap,
  IFormsortWebEmbed,
  IFormsortWebEmbedConfig,
} from '@formsort/web-embed-api';
import {
  createElement,
  type CSSProperties,
  type MutableRefObject,
  type ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react';

// Using this type to preserve auto-complete for default environments
// while allowing any other string to be passed.
// See https://github.com/microsoft/TypeScript/issues/29729
type LiteralUnion<T extends U, U = string> = T | (U & Record<never, never>);

export type FormsortEnv = LiteralUnion<'staging' | 'production'>;

export interface IEmbedFlowLoadProps {
  clientLabel: string;
  flowLabel: string;
  variantLabel?: string;
  responderUuid?: string;
  formsortEnv?: FormsortEnv;
  queryParams?: ReadonlyArray<readonly [string, string]>;
  embedConfig?: IFormsortWebEmbedConfig;
}

export interface IReactEmbedEventMap {
  onUnauthorized?: IEventMap['unauthorized'];
  onRedirect?: IEventMap['redirect'];
  onFlowLoaded?: IEventMap['FlowLoaded'];
  onFlowClosed?: IEventMap['FlowClosed'];
  onFlowFinalized?: IEventMap['FlowFinalized'];
  onStepLoaded?: IEventMap['StepLoaded'];
  onStepCompleted?: IEventMap['StepCompleted'];
}

export interface EmbedFlowProps
  extends IEmbedFlowLoadProps,
    IReactEmbedEventMap {}

type FormsortWebEmbedFactory = (
  rootEl: HTMLElement,
  config?: IFormsortWebEmbedConfig
) => IFormsortWebEmbed;

const getFormsortWebEmbed = (
  moduleExport: typeof WebEmbedApi
): FormsortWebEmbedFactory => {
  const defaultExport = moduleExport.default as unknown;

  if (typeof defaultExport === 'function') {
    return defaultExport as FormsortWebEmbedFactory;
  }

  const nestedDefault =
    defaultExport && typeof defaultExport === 'object'
      ? (defaultExport as unknown as { default?: FormsortWebEmbedFactory })
          .default
      : undefined;

  if (typeof nestedDefault === 'function') {
    return nestedDefault;
  }

  throw new Error('Unable to load @formsort/web-embed-api default export');
};

const getSupportedAnalyticsEvent = (
  moduleExport: typeof WebEmbedApi
): typeof WebEmbedApi.SupportedAnalyticsEvent => {
  const directExport = (
    moduleExport as unknown as {
      SupportedAnalyticsEvent?: typeof WebEmbedApi.SupportedAnalyticsEvent;
    }
  ).SupportedAnalyticsEvent;

  if (directExport) {
    return directExport;
  }

  const defaultExport =
    moduleExport.default &&
    typeof (moduleExport.default as unknown) === 'object'
      ? (moduleExport.default as unknown as {
          SupportedAnalyticsEvent?: typeof WebEmbedApi.SupportedAnalyticsEvent;
        })
      : undefined;

  if (defaultExport?.SupportedAnalyticsEvent) {
    return defaultExport.SupportedAnalyticsEvent;
  }

  throw new Error('Unable to load @formsort/web-embed-api event exports');
};

const FormsortWebEmbed = getFormsortWebEmbed(WebEmbedApi);
const SupportedAnalyticsEvent = getSupportedAnalyticsEvent(WebEmbedApi);

export const eventMapping: Record<keyof IReactEmbedEventMap, keyof IEventMap> =
  {
    onUnauthorized: 'unauthorized',
    onRedirect: 'redirect',
    onFlowLoaded: SupportedAnalyticsEvent.FlowLoaded,
    onFlowClosed: SupportedAnalyticsEvent.FlowClosed,
    onFlowFinalized: SupportedAnalyticsEvent.FlowFinalized,
    onStepLoaded: SupportedAnalyticsEvent.StepLoaded,
    onStepCompleted: SupportedAnalyticsEvent.StepCompleted,
  };

const buildFlowQueryParams = ({
  queryParams,
  responderUuid,
  formsortEnv,
}: Pick<
  IEmbedFlowLoadProps,
  'queryParams' | 'responderUuid' | 'formsortEnv'
>): Array<[string, string]> | undefined => {
  const flowQueryParams: Array<[string, string]> =
    queryParams?.map(([key, value]) => [key, value]) ?? [];

  if (responderUuid) {
    flowQueryParams.push(['responderUuid', responderUuid]);
  }

  if (formsortEnv) {
    flowQueryParams.push(['formsortEnv', formsortEnv]);
  }

  return flowQueryParams.length ? flowQueryParams : undefined;
};

const getQueryParamsKey = (
  queryParams: Array<[string, string]> | undefined
): string => JSON.stringify(queryParams ?? []);

const getEmbedConfigKey = (
  embedConfig: IFormsortWebEmbedConfig | undefined
): string => {
  try {
    return JSON.stringify(embedConfig ?? {});
  } catch {
    return String(embedConfig);
  }
};

const getFlowLoadKey = ({
  clientLabel,
  embedConfigKey,
  flowLabel,
  queryParamsKey,
  variantLabel,
}: {
  clientLabel: string;
  embedConfigKey: string;
  flowLabel: string;
  queryParamsKey: string;
  variantLabel?: string;
}): string =>
  JSON.stringify([
    clientLabel,
    embedConfigKey,
    flowLabel,
    queryParamsKey,
    variantLabel,
  ]);

const attachEventListener = <K extends keyof IEventMap>(
  embed: IFormsortWebEmbed,
  eventName: K,
  eventListener: IEventMap[K]
): (() => void) => {
  embed.addEventListener(eventName, eventListener);

  return () => {
    embed.removeEventListener(eventName, eventListener);
  };
};

const attachEventListeners = (
  embed: IFormsortWebEmbed,
  eventListenersRef: MutableRefObject<IReactEmbedEventMap>,
  onFlowClosed: () => void
): Array<() => void> => [
  attachEventListener(embed, 'unauthorized', () => {
    eventListenersRef.current.onUnauthorized?.();
  }),
  attachEventListener(embed, 'redirect', (event) =>
    eventListenersRef.current.onRedirect?.(event)
  ),
  attachEventListener(embed, SupportedAnalyticsEvent.FlowLoaded, (event) => {
    eventListenersRef.current.onFlowLoaded?.(event);
  }),
  attachEventListener(embed, SupportedAnalyticsEvent.FlowClosed, (event) => {
    onFlowClosed();
    eventListenersRef.current.onFlowClosed?.(event);
  }),
  attachEventListener(embed, SupportedAnalyticsEvent.FlowFinalized, (event) => {
    eventListenersRef.current.onFlowFinalized?.(event);
  }),
  attachEventListener(embed, SupportedAnalyticsEvent.StepLoaded, (event) => {
    eventListenersRef.current.onStepLoaded?.(event);
  }),
  attachEventListener(embed, SupportedAnalyticsEvent.StepCompleted, (event) => {
    eventListenersRef.current.onStepCompleted?.(event);
  }),
];

export const EmbedFlow = ({
  clientLabel,
  flowLabel,
  variantLabel,
  responderUuid,
  formsortEnv,
  queryParams,
  embedConfig,
  onUnauthorized,
  onRedirect,
  onFlowLoaded,
  onFlowClosed,
  onFlowFinalized,
  onStepLoaded,
  onStepCompleted,
}: EmbedFlowProps): ReactElement | null => {
  const containerRef = useRef<HTMLDivElement>(null);
  const eventListenersRef = useRef<IReactEmbedEventMap>({});
  const [closedFlowKey, setClosedFlowKey] = useState<string>();

  eventListenersRef.current = {
    onUnauthorized,
    onRedirect,
    onFlowLoaded,
    onFlowClosed,
    onFlowFinalized,
    onStepLoaded,
    onStepCompleted,
  };

  const flowQueryParams = buildFlowQueryParams({
    queryParams,
    responderUuid,
    formsortEnv,
  });
  const queryParamsKey = getQueryParamsKey(flowQueryParams);
  const embedConfigKey = getEmbedConfigKey(embedConfig);
  const flowLoadKey = getFlowLoadKey({
    clientLabel,
    embedConfigKey,
    flowLabel,
    queryParamsKey,
    variantLabel,
  });
  const flowClosed = closedFlowKey === flowLoadKey;

  useEffect(() => {
    const containerElement = containerRef.current;

    if (!containerElement) {
      return undefined;
    }

    setClosedFlowKey(undefined);

    const embed = FormsortWebEmbed(containerElement, embedConfig);
    const removeEventListeners = attachEventListeners(
      embed,
      eventListenersRef,
      () => {
        setClosedFlowKey(flowLoadKey);
      }
    );

    embed.loadFlow(clientLabel, flowLabel, variantLabel, flowQueryParams);

    return () => {
      removeEventListeners.forEach((removeEventListener) => {
        removeEventListener();
      });
      embed.unloadFlow();
    };
  }, [flowLoadKey]);

  if (flowClosed) {
    return null;
  }

  return createElement('div', {
    ref: containerRef,
    style: embedConfig?.style as CSSProperties | undefined,
  });
};

export default EmbedFlow;
