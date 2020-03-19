import FormsortWebEmbed, {
  IFormsortWebEmbed,
  IEventMap
} from '@formsort/web-embed-api';
import React, { useEffect, useRef } from 'react';

interface ILoadProps {
  clientLabel: string;
  flowLabel: string;
  variantLabel?: string;
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
