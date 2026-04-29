import FormsortWebEmbed, {
  SupportedAnalyticsEvent,
  type IEventMap,
  type IFormsortWebEmbed,
} from '@formsort/web-embed-api';
import { act, render } from '@testing-library/react';
import React, { StrictMode } from 'react';

import EmbedFlow from '..';

jest.mock('@formsort/web-embed-api', () => ({
  __esModule: true,
  default: jest.fn(),
  SupportedAnalyticsEvent: {
    FlowLoaded: 'FlowLoaded',
    FlowClosed: 'FlowClosed',
    FlowFinalized: 'FlowFinalized',
    StepLoaded: 'StepLoaded',
    StepCompleted: 'StepCompleted',
    ResponderStateUpdated: 'ResponderStateUpdated',
  },
}));

const mockWebEmbedApi = FormsortWebEmbed as jest.MockedFunction<
  typeof FormsortWebEmbed
>;

const getAddedListener = <K extends keyof IEventMap>(
  addEventListenerMock: jest.Mock,
  eventName: K
): IEventMap[K] => {
  const listenerCall = addEventListenerMock.mock.calls.find(
    ([addedEventName]) => addedEventName === eventName
  );

  if (!listenerCall) {
    throw new Error(`Expected ${String(eventName)} listener to be registered`);
  }

  return listenerCall[1] as IEventMap[K];
};

describe('EmbedFlow component', () => {
  let loadMock: jest.Mock;
  let unloadMock: jest.Mock;
  let embedMock: IFormsortWebEmbed;
  let addEventListenerMock: jest.Mock;
  let removeEventListenerMock: jest.Mock;

  beforeEach(() => {
    loadMock = jest.fn();
    unloadMock = jest.fn();
    addEventListenerMock = jest.fn();
    removeEventListenerMock = jest.fn();
    embedMock = {
      loadFlow: loadMock,
      unloadFlow: unloadMock,
      setSize: jest.fn(),
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    };
    mockWebEmbedApi.mockReturnValue(embedMock);
  });

  afterEach(() => {
    mockWebEmbedApi.mockReset();
  });

  test('loads flows without variant label', () => {
    render(<EmbedFlow flowLabel="test-flow" clientLabel="test-client" />);

    expect(loadMock).toHaveBeenCalledWith(
      'test-client',
      'test-flow',
      undefined,
      undefined
    );
  });

  test('loads flows with variant label', () => {
    render(
      <EmbedFlow
        flowLabel="test-flow"
        clientLabel="test-client"
        variantLabel="test-variant"
      />
    );

    expect(loadMock).toHaveBeenCalledWith(
      'test-client',
      'test-flow',
      'test-variant',
      undefined
    );
  });

  test('passes embed config to the web embed and applies style to the container', () => {
    const embedConfig = {
      iframeTitle: 'Example flow',
      style: {
        width: '80%',
        height: '400px',
      },
    };

    const { container } = render(
      <EmbedFlow
        flowLabel="test-flow"
        clientLabel="test-client"
        embedConfig={embedConfig}
      />
    );

    expect(mockWebEmbedApi).toHaveBeenCalledWith(
      container.firstChild,
      embedConfig
    );
    expect((container.firstChild as HTMLDivElement).style.width).toBe('80%');
    expect((container.firstChild as HTMLDivElement).style.height).toBe('400px');
  });

  test('does not reload when rerendered with an equivalent inline embed config', () => {
    const { rerender } = render(
      <EmbedFlow
        flowLabel="test-flow"
        clientLabel="test-client"
        embedConfig={{
          style: {
            width: '80%',
            height: '400px',
          },
        }}
      />
    );

    rerender(
      <EmbedFlow
        flowLabel="test-flow"
        clientLabel="test-client"
        embedConfig={{
          style: {
            width: '80%',
            height: '400px',
          },
        }}
      />
    );

    expect(mockWebEmbedApi).toHaveBeenCalledTimes(1);
    expect(loadMock).toHaveBeenCalledTimes(1);
    expect(unloadMock).not.toHaveBeenCalled();
  });

  test('bridges web embed events to the latest React callbacks', () => {
    const flowLoadedMock = jest.fn();
    const updatedFlowLoadedMock = jest.fn();
    const flowFinalizedMock = jest.fn();
    const redirectMock = jest.fn().mockReturnValue({ cancel: true });
    const unauthorizedMock = jest.fn();

    const { rerender } = render(
      <EmbedFlow
        flowLabel="test-flow"
        clientLabel="test-client"
        onFlowLoaded={flowLoadedMock}
        onFlowFinalized={flowFinalizedMock}
        onRedirect={redirectMock}
        onUnauthorized={unauthorizedMock}
      />
    );

    rerender(
      <EmbedFlow
        flowLabel="test-flow"
        clientLabel="test-client"
        onFlowLoaded={updatedFlowLoadedMock}
        onFlowFinalized={flowFinalizedMock}
        onRedirect={redirectMock}
        onUnauthorized={unauthorizedMock}
      />
    );

    const flowLoadedListener = getAddedListener(
      addEventListenerMock,
      SupportedAnalyticsEvent.FlowLoaded
    );
    const flowFinalizedListener = getAddedListener(
      addEventListenerMock,
      SupportedAnalyticsEvent.FlowFinalized
    );
    const redirectListener = getAddedListener(
      addEventListenerMock,
      'redirect'
    );
    const unauthorizedListener = getAddedListener(
      addEventListenerMock,
      'unauthorized'
    );

    const eventPayload = {
      answers: {},
      responder: {
        responderUuid: 'responder-uuid',
        sessionUuid: 'session-uuid',
      },
      variantRevisionUuid: 'variant-revision-uuid',
      stepId: 'step-id',
      stepIndex: 0,
      answerSources: {},
    };
    const redirectPayload = {
      url: 'https://example.com',
      answers: {},
      responder: {
        responderUuid: 'responder-uuid',
        sessionUuid: 'session-uuid',
      },
    };

    flowLoadedListener(eventPayload);
    flowFinalizedListener(eventPayload);
    const redirectResult = redirectListener(redirectPayload);
    unauthorizedListener();

    expect(flowLoadedMock).not.toHaveBeenCalled();
    expect(updatedFlowLoadedMock).toHaveBeenCalledWith(eventPayload);
    expect(flowFinalizedMock).toHaveBeenCalledWith(eventPayload);
    expect(redirectMock).toHaveBeenCalledWith(redirectPayload);
    expect(redirectResult).toEqual({ cancel: true });
    expect(unauthorizedMock).toHaveBeenCalled();
  });

  test('hides the container after FlowClosed and calls the React callback', () => {
    const flowClosedMock = jest.fn();
    const { container } = render(
      <EmbedFlow
        flowLabel="test-flow"
        clientLabel="test-client"
        onFlowClosed={flowClosedMock}
      />
    );

    const flowClosedListener = getAddedListener(
      addEventListenerMock,
      SupportedAnalyticsEvent.FlowClosed
    );
    const eventPayload = {
      answers: {},
      responder: {
        responderUuid: 'responder-uuid',
        sessionUuid: 'session-uuid',
      },
      variantRevisionUuid: 'variant-revision-uuid',
      stepId: 'step-id',
      stepIndex: 0,
      answerSources: {},
    };

    act(() => {
      flowClosedListener(eventPayload);
    });

    expect(flowClosedMock).toHaveBeenCalledWith(eventPayload);
    expect(container.firstChild).toBeNull();
  });

  test('loads flows with URL params without mutating props', () => {
    const uuid = 'b1c7d9c8-f4b0-4f3f-9fc3-abf32ae8a061';
    const queryParams: Array<[string, string]> = [['name', 'Olivia']];

    render(
      <EmbedFlow
        flowLabel="test-flow"
        clientLabel="test-client"
        variantLabel="test-variant"
        queryParams={queryParams}
        responderUuid={uuid}
        formsortEnv="staging"
      />
    );

    expect(loadMock).toHaveBeenCalledWith(
      'test-client',
      'test-flow',
      'test-variant',
      [
        ['name', 'Olivia'],
        ['responderUuid', uuid],
        ['formsortEnv', 'staging'],
      ]
    );
    expect(queryParams).toEqual([['name', 'Olivia']]);
  });

  test('unloads the flow and removes event listeners on unmount', () => {
    const { unmount } = render(
      <EmbedFlow flowLabel="test-flow" clientLabel="test-client" />
    );

    unmount();

    expect(removeEventListenerMock).toHaveBeenCalledTimes(8);
    expect(unloadMock).toHaveBeenCalledTimes(1);
  });

  test('cleans up the development StrictMode remount', () => {
    const { unmount } = render(
      <StrictMode>
        <EmbedFlow flowLabel="test-flow" clientLabel="test-client" />
      </StrictMode>
    );

    unmount();

    expect(mockWebEmbedApi).toHaveBeenCalledTimes(2);
    expect(unloadMock).toHaveBeenCalledTimes(2);
  });
});
