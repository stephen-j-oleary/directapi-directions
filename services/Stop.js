
/**
 * @typedef {Object} Stop
 * @property {string} address
 * @property {{}} modifiers
 */

import _ from "lodash";

/**
 * Parses a string or array of modifiers to a modifiers object.
 * Expects a string, an array of strings, or an array of pairs.
 * @param {string|string[]|string[][]} val The value to parse
 * @returns {{ [string]: string }} The modifiers object
 */
function parseModifiers(val) {
  if (_.isPlainObject(val)) return val;

  return _.chain(val)
    .thru(val => _.isString(val) ? val.split(";") : val)
    .thru(val => _.isArray(val) ? val : [])
    .map(item => _.isString(item) ? item.split(":") : item)
    .fromPairs()
    .value();
}

/**
 * Parses an address string with modifiers.
 * @param {string} val
 * @returns {{ address: string, modifiers: { [string]: string }}}
 */
function parseAddress(val) {
  const [address, ...rest] = _.chain(val)
    .thru(val => _.isString(val) ? val : "")
    .split(";")
    .reverse()
    .value();
  const modifiers = parseModifiers(rest);

  return { address, modifiers };
}

export default class Stop {
  constructor(props = {}) {
    const { address, modifiers } = parseAddress(props.address);
    const additionalModifiers = parseModifiers(props.modifiers);

    this.address = address;
    this.modifiers = { ...modifiers, ...additionalModifiers };
  }

  toString() {
    return this.address;
  }

  toModifierString() {
    const modifiersArr = _.chain(this.modifiers)
      .toPairs()
      .map(pair => pair.join(":"))
      .value();

    return [...modifiersArr, this.address].join(";");
  }

  setModifier(key, value) {
    this.modifiers[key] = value;
  }

  hasModifier(key, value = null) {
    console.log({ modifiers: this.modifiers, key, value });
    return (
      key in this.modifiers
      && (value === null || this.modifiers[key] === value)
    );
  }
}
