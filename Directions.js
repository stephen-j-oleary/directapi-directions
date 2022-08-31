/**
 * @typedef {Object} Stop
 * @property {boolean} [start]
 * @property {boolean} [end]
 * @property {string} address
 */
/**
 * @typedef {Object} DirectionsResponse
 * @property {string} copyright
 * @property {string[]} warnings
 * @property {number[]} stopOrder
 * @property {DirectionsLeg[]} legs {@link DirectionsLeg}
 */
/**
 * @typedef {Object} DirectionsLeg
 * @property {number} distance Distance in meters
 * @property {number} duration Duration in seconds
 * @property {string} start Start address
 * @property {string} end End address
 */

const { Google } = require("./Google.js");

const MINIMUM_STOPS = 2;
const DIRECTIONS_ENDPOINT = "directions/json";


class Directions {
  static async sendRequest(options = {}) {
    return Google.sendRequest(DIRECTIONS_ENDPOINT, options);
  }

  static parseStops(stopsString) {
    if (typeof stopsString !== "string") throw new TypeError("Invalid argument");

    return stopsString.split("|").map(s => {
      const address = s.split(":").pop();
      const modifiers = s.split(":").slice(0, -1);
      return {
        address,
        start: modifiers.includes("start"),
        end: modifiers.includes("end")
      };
    });
  }

  /**
   * Creates a new instance of the Directions class
   * @constructor
   */
  constructor() {
    this.stops = [];
    this.copyright = undefined;
    this.warnings = undefined;
    this.legs = undefined;
    this.stopOrder = undefined;
  }

  /**
   * Sets the given stops on the Directions instance
   * @param {(Stop | string)[]} stops
   */
  setStops(stops) {
    if (!Array.isArray(stops)) throw new TypeError("Invalid argument");

    // Reset any previously calculated route information
    this.copyright = undefined;
    this.warnings = undefined;
    this.legs = undefined;
    this.stopOrder = undefined;

    // Set new stops
    this.stops = stops.map((s, i) => ({
      index: i,
      ...(typeof s === "string") ? { address: s } : s
    }));
  }

  /**
   * Calculates the best route for the current stops
   * @param {{}} options
   * @returns {Promise}
   */
  async calculate(options = {}) {
    if (typeof options !== "object") throw new TypeError("Invalid argument");

    if (this.stops.length < MINIMUM_STOPS) throw new Error("Too few stops");

    const response = await Directions.sendRequest({
      params: new URLSearchParams({
        origin: this.start.address,
        destination: this.end.address,
        ...(this.middleStops.length > 0) ? {
          waypoints: `optimize:true|${this.middleStops.map(s => s.address).join("|")}`
        } : {},
        ...options
      })
    });

    if (response.status !== "OK") throw new Error(response.status);

    const route = response.routes[0];

    this.copyright = route.copyrights;
    this.warnings = route.warnings;

    this.legs = route.legs;
    if (!this.hasStart && !this.hasEnd) this.legs.pop();
    if (this.hasStart && !this.hasEnd) this.legs.pop();
    if (!this.hasStart && this.hasEnd) this.legs.shift();

    this.stopOrder = [];
    if (this.hasStart || (!this.hasStart && !this.hasEnd)) this.stopOrder.push(this.start.index);
    for (const waypointIndex of route.waypoint_order) {
      this.stopOrder.push(this.middleStops[waypointIndex].index);
    }
    if (this.hasEnd) this.stopOrder.push(this.end.index);

    return;
  }

  /**
   * The response containing the calculated route information
   * @type {DirectionsResponse}
   */
  get response() {
    if (!this.legs || !this.stopOrder) return {};

    return {
      copyright: this.copyright || null,
      warnings: this.warnings || [],
      stopOrder: this.stopOrder,
      legs: this.legs.map(leg => ({
        distance: leg.distance.value,
        duration: leg.duration_in_traffic?.value || leg.duration.value,
        start: leg.start_address,
        end: leg.end_address
      }))
    };
  }

  /**
   * The origin to be used when calculating the route
   * @type {Stop}
   */
  get start() {
    return this.stops.find(s => s.start) || this.stops.find(s => s.end) || this.stops[0];
  }

  /**
   * A boolean indicating whether a start was explicitely specified in the stops
   * @type {boolean}
   */
  get hasStart() {
    return this.stops.some(s => s.start);
  }

  /**
   * The destination to be used when calculating the route
   * @type {Stop}
   */
  get end() {
    return this.stops.find(s => s.end) || this.stops.find(s => s.start) || this.stops[0];
  }

  /**
   * A boolean indicating whether an end was explicitely specified in the stops
   * @type {boolean}
   */
  get hasEnd() {
    return this.stops.some(s => s.end);
  }

  /**
   * The waypoints to be used when calculating the route
   * @type {Stop[]}
   */
  get middleStops() {
    let middleStops = this.stops.filter(s => !(s.start || s.end));
    if (!this.hasStart && !this.hasEnd) middleStops.shift();
    return middleStops;
  }
}


module.exports = Directions;