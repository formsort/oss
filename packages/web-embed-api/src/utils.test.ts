import { isLocalOrLegacyFlowOrigin } from './utils';

describe('isLocalOrFlowDomain', () => {
  test.each([
    ['http://localhost:4040', true],
    ['localhost:4040', true],
    ['https://localhost', true],
    ['http://127.0.0.1', true],
    ['flow.formsort.com', true],
    ['flow.beta.formsort.com', true],
    ['client_name.formsort.app', false],
    ['https://client_name.formsort.app', false],
    ['mycustomdomain.com', false],
    ['https://mycustomdomain.com', false],
    ['www.mycustomdomain.com', false],
    ['some://invalid.url', false],
  ])('%s -> %s', (url, expected) => {
    expect(isLocalOrLegacyFlowOrigin(url)).toBe(expected);
  });
});
