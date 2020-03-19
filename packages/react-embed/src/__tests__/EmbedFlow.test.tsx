import React from 'react';
import { render } from '@testing-library/react';
import FormsortWebEmbed, { IFormsortWebEmbed } from '@formsort/web-embed-api';

import EmbedFlow from '..';

jest.mock('@formsort/web-embed-api');

const mockWebEmbedApi = FormsortWebEmbed as jest.MockedFunction<typeof FormsortWebEmbed>;

describe('EmbedFlow componenet', () => {
  let loadMock: jest.Mock;
  let embedMock: IFormsortWebEmbed;
  let addEventListenerMock: jest.Mock;
  beforeEach(() => {
    loadMock = jest.fn();
    addEventListenerMock = jest.fn();
    embedMock = {
      loadFlow: loadMock,
      setSize: jest.fn(),
      addEventListener: addEventListenerMock
    };
    mockWebEmbedApi.mockReturnValueOnce(embedMock);
  });
  afterEach(() => {
    mockWebEmbedApi.mockClear();
  });

  it('should load flows without variant label', () => {
    render(<EmbedFlow flowLabel='test-flow' clientLabel='test-client' />);
    expect(loadMock).toBeCalledWith('test-client', 'test-flow', undefined);
  });

  it('should load flows with variant label', () => {
    render(<EmbedFlow flowLabel='test-flow' clientLabel='test-client' variantLabel='test-variant' />);
    expect(loadMock).toBeCalledWith('test-client', 'test-flow', 'test-variant');
  });

  it('should pass down the event listeners given as props', () => {
    const flowloadedMock = jest.fn();
    render(
      <EmbedFlow
        flowLabel='test-flow'
        clientLabel='test-client'
        variantLabel='test-variant'
        flowloaded={flowloadedMock}
      />);

    expect(loadMock).toBeCalledWith('test-client', 'test-flow', 'test-variant');
    expect(embedMock.addEventListener).toBeCalledWith('flowloaded', flowloadedMock);
  });
});
