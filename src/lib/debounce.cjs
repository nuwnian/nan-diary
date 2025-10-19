// CommonJS version of debounce utility for test environments that run under CommonJS (Jest default)
function debounce(fn, wait) {
  let timeout = null;
  return function () {
    const args = arguments;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(function () {
      timeout = null;
      fn.apply(this, args);
    }, wait);
  };
}

module.exports = { debounce };
