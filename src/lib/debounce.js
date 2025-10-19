// Simple debounce utility used by autosave logic. Exported for unit testing.
export function debounce(fn, wait) {
    let timeout = null;
    return function (...args) {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            timeout = null;
            fn.apply(this, args);
        }, wait);
    };
}
