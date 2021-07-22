/* eslint-disable no-param-reassign */

/**
 * A cache of provided by the user values to the input fields.
 * This is used to restore data when the user switches between different operations.
 * @type {Map<string, any>}
 */
export const globalValues = new Map();
/**
 * A cache for "local" values cached per instance of the component.
 *
 * @type {WeakMap<HTMLElement, Map<string, any>>}
 */
export const localValues = new WeakMap();

/**
 * @param {HTMLElement} element
 * @param {boolean} globalCache
 * @returns {Map<string, any>}
 */
export function getStore(element, globalCache) {
  if (globalCache) {
    return globalValues;
  }
  return localValues.get(element);
}


/**
 * @param {HTMLElement} element
 * @param {string} paramId
 * @param {boolean} globalCache
 * @returns {any}
 */
export function get(element, paramId, globalCache) {
  const store = getStore(element, globalCache);
  if (store && store.has(paramId)) {
    return store.get(paramId);
  }
  return undefined;
}

/**
 * @param {HTMLElement} element
 * @param {string} paramId
 * @param {any} value
 * @param {boolean} globalCache
 * @param {boolean=} isArray Whether the value is an array.
 * @param {number=} index The array index.
 */
export function set(element, paramId, value, globalCache, isArray, index) {
  const store = getStore(element, globalCache);
  if (isArray) {
    if (!store.has(paramId)) {
      store.set(paramId, []);
    }
    if (typeof index === 'number' && !Number.isNaN(index)) {
      store.get(paramId)[index] = value;
    } else {
      store.get(paramId).push(value);
    }
  } else {
    store.set(paramId, value);
  }
}

/**
 * @param {HTMLElement} element
 * @param {string} paramId
 * @param {boolean} globalCache
 * @returns {boolean}
 */
export function has(element, paramId, globalCache) {
  const store = getStore(element, globalCache);
  return store.has(paramId);
}


/**
 * @param {HTMLElement} element
 */
export function registerLocal(element) {
  localValues.set(element, new Map());
}

/**
 * @param {HTMLElement} element
 */
export function unregisterLocal(element) {
  localValues.delete(element);
}

/**
 * @param {HTMLElement} element
 * @param {string} paramId
 * @param {boolean} globalCache
 * @param {number=} index When set to a number it expects the value to be array and removes an item on the specified index.
 */
export function remove(element, paramId, globalCache, index) {
  const store = getStore(element, globalCache);
  if (typeof index === 'number' && !Number.isNaN(index)) {
    const value = /** @type any[] */ (store.get(paramId));
    if (Array.isArray(value)) {
      value.splice(index, 1);
    }
  } else {
    store.delete(paramId);
  }
}
