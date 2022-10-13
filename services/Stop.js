
/**
 * @typedef {Object} Stop
 * @property {string} address
 * @property {string[]} modifiers
 */

import _ from "lodash";

function parseString(str) {
  const [address, ...rest] = str.split(";").reverse();
  const modifiers = Object.fromEntries(rest.map(item => item.split(":")));
  return { address, modifiers };
}

export default class Stop {
  constructor(init = {}) {
    const { address = "", modifiers = [] } = _.isString(init)
      ? parseString(init)
      : init;

    this.address = address;
    this.modifiers = modifiers;
  }

  hasModifier(key, value = null) {
    return (
      key in this.modifiers
      && (value === null || this.modifiers[key] === value)
    );
  }
}
