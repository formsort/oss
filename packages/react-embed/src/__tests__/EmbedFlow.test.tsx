import FormsortWebEmbed, { IFormsortWebEmbed } from '@formsort/web-embed-api';
import { render } from '@testing-library/react';
import React from 'react';

import EmbedFlow from '..';

jest.mock('@formsort/web-embed-api');

const mockWebEmbedApi = FormsortWebEmbed as jest.MockedFunction<
  typeof FormsortWebEmbed
>;

describe('EmbedFlow component', () => {
  let loadMock: jest.Mock;
  let embedMock: IFormsortWebEmbed;
  let addEventListenerMock: jest.Mock;
  let removeEventListenerMock: jest.Mock;

  beforeEach(() => {
    loadMock = jest.fn();
    addEventListenerMock = jest.fn();
    removeEventListenerMock = jest.fn();
    embedMock = {
      loadFlow: loadMock,
      unloadFlow: jest.fn(),
      setSize: jest.fn(),
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    };
    mockWebEmbedApi.mockReturnValueOnce(embedMock);
  });
  afterEach(() => {
    mockWebEmbedApi.mockClear();
  });

  test('should load flows without variant label', () => {
    render(<EmbedFlow flowLabel="test-flow" clientLabel="test-client" />);
    expect(loadMock).toHaveBeenCalledWith(
      'test-client',
      'test-flow',
      undefined,
      undefined
    );
  });

  test('should load flows with variant label', () => {
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

  test('should pass down the event listeners given as props', () => {
    const flowloadedMock = jest.fn();
    const flowFinalizedMock = jest.fn();
    const redirectMock = jest.fn();
    const unauthorizedMock = jest.fn();

    render(
      <EmbedFlow
        flowLabel="test-flow"
        clientLabel="test-client"
        variantLabel="test-variant"
        onFlowLoaded={flowloadedMock}
        onFlowFinalized={flowFinalizedMock}
        onRedirect={redirectMock}
        onUnauthorized={unauthorizedMock}
      />
    );

    expect(loadMock).toHaveBeenCalledWith(
      'test-client',
      'test-flow',
      'test-variant',
      undefined
    );
    expect(embedMock.addEventListener).toHaveBeenCalledTimes(5);
    expect(embedMock.addEventListener).toHaveBeenCalledWith(
      'FlowLoaded',
      flowloadedMock
    );

    expect(embedMock.addEventListener).toHaveBeenCalledWith(
      'FlowFinalized',
      flowFinalizedMock
    );
    expect(embedMock.addEventListener).toHaveBeenCalledWith('redirect', redirectMock);
    expect(embedMock.addEventListener).toHaveBeenCalledWith(
      'unauthorized',
      unauthorizedMock
    );
    // Check for FlowClosed event listener that removes the parent container of the embed
    expect(embedMock.addEventListener).toHaveBeenCalledWith(
      'FlowClosed',
      expect.any(Function)
    );
  });

  test('should load flows with URL params', () => {
    const uuid = 'b1c7d9c8-f4b0-4f3f-9fc3-abf32ae8a061';
    render(
      <EmbedFlow
        flowLabel="test-flow"
        clientLabel="test-client"
        variantLabel="test-variant"
        responderUuid={uuid}
        formsortEnv="staging"
      />
    );
    expect(loadMock).toHaveBeenCalledWith(
      'test-client',
      'test-flow',
      'test-variant',
      [
        ['responderUuid', uuid],
        ['formsortEnv', 'staging'],
      ]
    );
  });
});
