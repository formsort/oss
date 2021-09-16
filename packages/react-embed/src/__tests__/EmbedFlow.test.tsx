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
  beforeEach(() => {
    loadMock = jest.fn();
    addEventListenerMock = jest.fn();
    embedMock = {
      loadFlow: loadMock,
      setSize: jest.fn(),
      addEventListener: addEventListenerMock,
    };
    mockWebEmbedApi.mockReturnValueOnce(embedMock);
  });
  afterEach(() => {
    mockWebEmbedApi.mockClear();
  });

  it('should load flows without variant label', () => {
    render(<EmbedFlow flowLabel="test-flow" clientLabel="test-client" />);
    expect(loadMock).toBeCalledWith(
      'test-client',
      'test-flow',
      undefined,
      undefined
    );
  });

  it('should load flows with variant label', () => {
    render(
      <EmbedFlow
        flowLabel="test-flow"
        clientLabel="test-client"
        variantLabel="test-variant"
      />
    );
    expect(loadMock).toBeCalledWith(
      'test-client',
      'test-flow',
      'test-variant',
      undefined
    );
  });

  it('should pass down the event listeners given as props', () => {
    const flowloadedMock = jest.fn();
    render(
      <EmbedFlow
        flowLabel="test-flow"
        clientLabel="test-client"
        variantLabel="test-variant"
        FlowLoaded={flowloadedMock}
      />
    );

    expect(loadMock).toBeCalledWith(
      'test-client',
      'test-flow',
      'test-variant',
      undefined
    );
    expect(embedMock.addEventListener).toBeCalledWith(
      'FlowLoaded',
      flowloadedMock
    );
  });

  it('should load flows with URL params', () => {
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
    expect(loadMock).toBeCalledWith(
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
