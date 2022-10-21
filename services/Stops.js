
import Stop from "./Stop.js";
import _ from "lodash";

export default class Stops {
  constructor({ stops = [], ...props } = {}) {
    this._stops = _.chain(stops)
      .thru(val => _.isString(val) ? val.split("|") : val)
      .thru(val => _.isArray(val) ? val : [])
      .map(s => _.isString(s)
        ? new Stop({ address: s })
        : (s instanceof Stop)
        ? s
        : new Stop(s)
      )
      .each((s, i) => !s.hasModifier("index") && s.setModifier("index", i.toString()))
      .value();
  }

  get stops() {
    const value = this._stops;
    const string = value.map(item => item.toString()).join("|");
    const modifierString = value.map(item => item.toModifierString()).join("|");

    return { value, string, modifierString };
  }

  get origin() {
    if (!this.length) return undefined;

    const value = [
      this.findByModifier("type", "origin"),
      this.findByModifier("type", "destination"),
      this._stops[0]
    ].find(i => i !== undefined);
    const string = value.toString();
    const modifierString = value.toModifierString();

    return { value, string, modifierString };
  }

  get destination() {
    if (!this.length) return undefined;

    const value = [
      this.findByModifier("type", "destination"),
      this.findByModifier("type", "origin"),
      this._stops[0]
    ].find(i => i !== undefined);
    const string = value.toString();
    const modifierString = value.toModifierString();

    return { value, string, modifierString };
  }

  get waypoints() {
    const value = _.chain(this._stops)
      .filter(item => !(item.hasModifier("type", "origin") || item.hasModifier("type", "destination")))
      .tap(value => (value.length === this.length) && value.shift())
      .value();
    const string = _.chain(value)
      .map(item => item.toString())
      .thru(val => (val.length >= 2) ? ["optimize:true", ...val] : val)
      .join("|")
      .value();
    const modifierString = _.chain(value)
      .map(item => item.toModifierString())
      .thru(val => (val.length >= 2) ? ["optimize:true", ...val] : val)
      .join("|")
      .value();

    return { value, string, modifierString };
  }

  get length() {
    return this._stops.length;
  }

  findByModifier(key, value = null) {
    return this._stops.find(s => s.hasModifier(key, value));
  }

  hasModifier(key, value = null) {
    return (this.findByModifier(key, value) !== undefined);
  }
}
