import * as constants from '../src';

test('constant message values are all unique', () => {
  const values = new Set();
  Object.keys(constants).forEach(constant => {
    expect(values.has(constant)).toBe(false);
    values.add(constant)
  });
});
