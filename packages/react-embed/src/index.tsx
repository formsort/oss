import FormsortWebEmbed, { IFormsortWebEmbed } from '@formsort/web-embed-api';
import React, { useEffect, useRef } from 'react';

type EventProps = Partial<
  Pick<
    IFormsortWebEmbed,
    'onFlowLoaded' | 'onFlowClosed' | 'onFlowFinalized' | 'onRedirect'
  >
>;
interface LoadProps {
  clientLabel: string;
  flowLabel: string;
  variantLabel?: string;
}

export type EmbedFlowProps = LoadProps & EventProps;

// TODO: attaching the listeners in this way isn't extensible -- violation of open–closed principle
// possible solution: add .on method to @formsort/web-embed-api to attach listeners
const attachEventListenersToEmbed = (
  embed: IFormsortWebEmbed,
  events: EventProps
): void => {
  const { onFlowLoaded, onFlowClosed, onFlowFinalized, onRedirect } = events;
  if (onFlowLoaded) {
    embed.onFlowLoaded = onFlowLoaded;
  }
  if (onFlowClosed) {
    embed.onFlowClosed = onFlowClosed;
  }
  if (onFlowFinalized) {
    embed.onFlowFinalized = onFlowFinalized;
  }
  if (onRedirect) {
    embed.onRedirect = onRedirect;
  }
};

const onMount = (
  containerRef: React.RefObject<HTMLDivElement>,
  props: EmbedFlowProps
): void => {
  const containerElement = containerRef.current;
  if (containerElement) {
    const { clientLabel, flowLabel, variantLabel, ...eventListeners } = props;
    const embed = FormsortWebEmbed(containerElement);
    attachEventListenersToEmbed(embed, eventListeners);
    embed.loadFlow(clientLabel, flowLabel, variantLabel);
  }
};

const EmbedFlow: React.FunctionComponent<EmbedFlowProps> = props => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onMount(containerRef, props);
  }, []);

  return <div ref={containerRef} />;
};

export default EmbedFlow;
