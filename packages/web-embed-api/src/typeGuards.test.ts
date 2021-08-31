import { WebEmbedMessage } from '@formsort/constants';
import { isIWebEmbedEventData } from './typeGuards';

describe('isIWebEmbedEventData', () => {
  test.each([1, 'hello', null, undefined, {}, { type: 'hello' }])(
    '%p is not IWebEmbedEventData',
    (val) => {
      expect(isIWebEmbedEventData(val)).toEqual(false);
    }
  );

  test.each(Object.values(WebEmbedMessage).map((type) => ({ type })))(
    '%p is IWebEmbedEventData',
    (val) => {
      expect(isIWebEmbedEventData(val)).toEqual(true);
    }
  );
});
