import FormsortWebEmbed, {
  IEventMap,
  IFormsortWebEmbed,
  IFormsortWebEmbedConfig,
} from '@formsort/web-embed-api';
import React, { useEffect, useRef } from 'react';

interface ILoadProps {
  clientLabel: string;
  flowLabel: string;
  variantLabel?: string;
  responderUuid?: string;
  formsortEnv?: 'staging' | 'production';
  queryParams?: [string, string][];
  embedConfig?: IFormsortWebEmbedConfig;
}

export type EmbedFlowProps = ILoadProps & IEventMap;

const attachEventListenersToEmbed = (
  embed: IFormsortWebEmbed,
  events: IEventMap
): void => {
  Object.entries(events).forEach(([eventName, listener]) => {
    embed.addEventListener(eventName as keyof IEventMap, listener);
  });
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

const EmbedFlow: React.FunctionComponent<EmbedFlowProps> = props => {
  const containerRef = useRef<HTMLDivElement>(null);
  const style = props.embedConfig?.style;

  useEffect(() => {
    onMount(containerRef, props);
  }, []);

  return <div ref={containerRef} style={style} />;
};

export default EmbedFlow;