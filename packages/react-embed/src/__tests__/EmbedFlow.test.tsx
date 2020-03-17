import React from 'react';
import { render } from '@testing-library/react';
import FormsortWebEmbed, { IFormsortWebEmbed } from '@formsort/web-embed-api';

import EmbedFlow from '..';

jest.mock('@formsort/web-embed-api');

const mockWebEmbedApi = FormsortWebEmbed as jest.MockedFunction<typeof FormsortWebEmbed>;

describe('EmbedFlow componenet', () => {
  let loadMock: jest.Mock;
  let embedMock: IFormsortWebEmbed;
  beforeEach(() => {
    loadMock = jest.fn();
    embedMock = {
      loadFlow: loadMock,
      setSize: jest.fn(),
      onFlowLoaded: jest.fn(),
      onFlowClosed: jest.fn(),
      onFlowFinalized: jest.fn(),
      onRedirect: jest.fn()
    }
    mockWebEmbedApi.mockReturnValueOnce(embedMock);
  })
  afterEach(() => {
    mockWebEmbedApi.mockClear();
  })

  it('should load flows without variant label', () => {
    render(<EmbedFlow flowLabel='test-flow' clientLabel='test-client' />);
    expect(loadMock).toBeCalledWith('test-client', 'test-flow', undefined);
  });

  it('should load flows with variant label', () => {
    render(<EmbedFlow flowLabel='test-flow' clientLabel='test-client' variantLabel='test-variant' />);
    expect(loadMock).toBeCalledWith('test-client', 'test-flow', 'test-variant');
  });

  it('should pass down the event listeners given as props', () => {
    const onFlowLoadedMock = jest.fn();
    render(<EmbedFlow flowLabel='test-flow' clientLabel='test-client' variantLabel='test-variant' onFlowLoaded={onFlowLoadedMock} />);
    expect(loadMock).toBeCalledWith('test-client', 'test-flow', 'test-variant');
    expect(embedMock.onFlowLoaded).toEqual(onFlowLoadedMock);
  });
});
