
/**
 * @typedef {Object} Stop
 * @property {string} address
 * @property {string[]} modifiers
 */

import _ from "lodash";

function parseString(str) {
  const [address, ...modifiers] = str.split(":").reverse();
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

  hasModifier(modifier) {
    return this.modifiers.includes(modifier);
  }
}
