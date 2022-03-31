import FormsortWebEmbed, {
  IEventMap,
  IFormsortWebEmbed,
  IFormsortWebEmbedConfig,
} from '@formsort/web-embed-api';
import React, { useEffect, useRef } from 'react';

// Using this type to preserve auto-complete for default environments
// while allowing any other string to be passed.
// See https://github.com/microsoft/TypeScript/issues/29729
type LiteralUnion<T extends U, U = string> = T | (U & Record<never, never>);
type FormsortEnv = LiteralUnion<'staging' | 'production'>;

interface ILoadProps {
  clientLabel: string;
  flowLabel: string;
  variantLabel?: string;
  responderUuid?: string;
  formsortEnv?: FormsortEnv;
  queryParams?: Array<[string, string]>;
  embedConfig?: IFormsortWebEmbedConfig;
}

export interface IReactEmbedEventMap {
  onRedirect?: IEventMap['redirect'];
  onFlowLoaded?: IEventMap['FlowLoaded'];
  onFlowClosed?: IEventMap['FlowClosed'];
  onFlowFinalized?: IEventMap['FlowFinalized'];
  onStepLoaded?: IEventMap['StepLoaded'];
  onStepCompleted?: IEventMap['StepCompleted'];
}

export type EmbedFlowProps = ILoadProps & IReactEmbedEventMap;

export const eventMapping: Record<keyof IReactEmbedEventMap, keyof IEventMap> =
  {
    onRedirect: 'redirect',
    onFlowLoaded: 'FlowLoaded',
    onFlowClosed: 'FlowClosed',
    onFlowFinalized: 'FlowFinalized',
    onStepLoaded: 'StepLoaded',
    onStepCompleted: 'StepCompleted',
  };

const attachEventListenersToEmbed = (
  embed: IFormsortWebEmbed,
  events: IReactEmbedEventMap
): void => {
  for (const [reactEventName, listener] of Object.entries(events)) {
    const embedEventName =
      eventMapping[reactEventName as keyof IReactEmbedEventMap];
    embed.addEventListener<typeof listener>(embedEventName, listener);
  }
};

const onMount = (
  containerRef: React.RefObject<HTMLDivElement>,
  props: EmbedFlowProps
): void => {
  const containerElement = containerRef.current;
  if (!containerElement) {
    return;
  }

  const {
    clientLabel,
    flowLabel,
    variantLabel,
    embedConfig,
    responderUuid,
    formsortEnv,
    queryParams = [],
    ...eventListeners
  } = props;

  const embed = FormsortWebEmbed(containerElement, embedConfig);
  attachEventListenersToEmbed(embed, eventListeners);

  if (responderUuid) {
    queryParams.push(['responderUuid', responderUuid]);
  }
  if (formsortEnv) {
    queryParams.push(['formsortEnv', formsortEnv]);
  }

  embed.loadFlow(
    clientLabel,
    flowLabel,
    variantLabel,
    queryParams.length ? queryParams : undefined
  );
};

const EmbedFlow: React.FunctionComponent<EmbedFlowProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const style = props.embedConfig?.style;

  useEffect(() => {
    onMount(containerRef, props);
  }, []);

  return <div ref={containerRef} style={style} />;
};

export default EmbedFlow;
