import {
  AnalyticsEventType,
  CustomQuestionMessage,
  WebEmbedMessage,
} from '../src'

const hasAllUniqueValues = (obj: { [key: string]: any }) => {
  const values = new Set();
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const value = obj[keys[i]];
    if (values.has(value)) {
      return false;
    }
    values.add(value)
  }
  return true;
}

test('AnalyticsEventType values are all unique', () => {
    expect(hasAllUniqueValues(AnalyticsEventType)).toBe(true);
});

test('CustomQuestionMessage values are all unique', () => {
    expect(hasAllUniqueValues(CustomQuestionMessage)).toBe(true);
});

test('WebEmbedMessage values are all unique', () => {
    expect(hasAllUniqueValues(WebEmbedMessage)).toBe(true);
});
