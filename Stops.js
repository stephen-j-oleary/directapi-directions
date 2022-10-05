
import Stop from "./Stop.js";
import _ from "lodash";

export default class Stops {
  constructor(stops = []) {
    this.stops = _(stops)
      .thru(val => _.isString(val)
        ? val.split("|")
        : _.isArray(val)
          ? val
          : []
      )
      .map(s => new Stop(s))
      .value();
  }

  get length() {
    return this.stops.length;
  }

  get originIndex() {
    return this.origin.index;
  }

  get originAddress() {
    return this.origin.value.address;
  }

  get origin() {
    const index = this.hasModifier("origin")
      ? this.indexOfModifier("origin")
      : this.hasModifier("destination")
        ? this.indexOfModifier("destination")
        : 0;
    const value = this.stops[index];

    return { index, value };
  }

  get waypointsIndexes() {
    return this.waypoints.map(s => s.index);
  }

  get waypointsAddresses() {
    return this.waypoints.map(s => s.value.address);
  }

  get waypoints() {
    const waypoints = this.stops.flatMap((s, i) => (
      (!s.hasModifier("origin") && !s.hasModifier("destination"))
        ? [{ index: i, value: s }]
        : []
    ));
    if (this.length === waypoints.length) waypoints.shift();
    return waypoints;
  }

  get destinationIndex() {
    return this.destination.index;
  }

  get destinationAddress() {
    return this.destination.value.address;
  }

  get destination() {
    const index = this.hasModifier("destination")
      ? this.indexOfModifier("destination")
      : this.hasModifier("origin")
        ? this.indexOfModifier("origin")
        : 0;
    const value = this.stops[index];

    return { index, value };
  }

  indexOfModifier(modifier) {
    return this.stops.findIndex(s => s.hasModifier(modifier));
  }

  hasModifier(modifier) {
    return (this.indexOfModifier(modifier) !== -1);
  }
}
