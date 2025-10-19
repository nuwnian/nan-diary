const { debounce } = require('../src/lib/debounce.cjs');

jest.useFakeTimers();

test('debounce delays function calls and collapses multiple calls', () => {
  const fn = jest.fn();
  const debounced = debounce(fn, 1000);

  debounced('a');
  debounced('b');
  debounced('c');

  // function should not have been called immediately
  expect(fn).not.toBeCalled();

  // Fast-forward time by less than debounce interval
  jest.advanceTimersByTime(500);
  expect(fn).not.toBeCalled();

  // Fast-forward to trigger
  jest.advanceTimersByTime(500);
  expect(fn).toBeCalledTimes(1);
  // Last call arguments should be from the last invocation
  expect(fn).toHaveBeenCalledWith('c');
});
