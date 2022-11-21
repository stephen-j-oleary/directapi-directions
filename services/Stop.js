
/**
 * @typedef {Object} Stop
 * @property {string} address
 * @property {[string, string][]} modifiers
 */

import _ from "lodash";

/**
 * Parses modifier string(s) to a modifier pairs array.
 * @param {string|string[]} val The modifier string(s)
 * @returns {[string, string][]} The modifier pairs
 */
function parseModifiers(val) {
  return _.chain(val)
    .thru(val => _.isString(val) ? val.split(";") : val)
    .thru(val => _.isArray(val) ? val : [])
    .map(item => _.isString(item)
      ? item.split(":")
      : _.isArray(item)
      ? item
      : []
    )
    .value();
}

/**
 * Parses an address string with modifiers.
 * @param {string} val
 * @returns {{ address: string, modifiers: [string, string][] }}
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
    this.modifiers = [...modifiers, ...additionalModifiers];
  }

  toString() {
    return this.address;
  }

  toModifierString() {
    return [
      ..._.map(this.modifiers, pair => pair.join(":")),
      this.address
    ].join(";");
  }

  setModifier(key, value) {
    this.modifiers.push([key, value]);
  }

  hasModifier(key, value = null) {
    console.log({ modifiers: this.modifiers, key, value });
    return _.some(this.modifiers, v => (
      v[0] === key
      && (value === null || v[1] === value)
    ));
  }
}
