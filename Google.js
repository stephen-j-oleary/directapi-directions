/**
 * @typedef {Object} AutocompleteResult
 * @property {string} placeId
 * @property {string} description
 * @property {string} mainText
 * @property {string} secondaryText
 */
/** 
 * @typedef {Object} DirectionsResult
 * @property {string} copyright
 * @property {number[]} stopOrder
 * @property {string[]} warnings
 * @property {DirectionsLeg[]} legs {@link DirectionsLeg}
 */
/**
 * @typedef {Object} DirectionsLeg
 * @property {number} distance Distance in meters
 * @property {number} duration Duration in seconds
 * @property {string} start Start address
 * @property {string} end End address
 */

const { GoogleSession: Session } = require("./Session"),
      axios = require("axios"),
      catcher = require("./catcher");
require("dotenv").config();

class Google {
  /**
   * Creates a new Session
   * @constructor
   * @param {string} endpointPath The path of the endpoint to be used for requests to the Google Api
   */
  constructor(endpointPath) {
    this.endpointPath = endpointPath;
    this.key = process.env.GOOGLE_API_KEY;
  }

  /**
   * Calls an endpoint of the Google Maps API
   * @param {Object.<string, string>} queryParams
   * @param {Object} [options] 
   * @param {boolean} options.isSession
   * @returns {Promise<Object|TypeError|Error>}
   */
  async getEndpoint(queryParams, options = {}) {
    const { isSession = false } = options;
    if (typeof queryParams !== "object" || typeof isSession !== "boolean") throw new TypeError("Invalid Argument");
    const params = new URLSearchParams(queryParams);
    params.append("key", this.key);
    if (isSession) params.append("sessiontoken", this.session.token);
    const path = `${process.env.GOOGLE_API_URL}${this.endpointPath}?${params.toString()}`;
    let response = await axios.get(path);
    return response.data;
  }
}

class GoogleSearch extends Google {
  /**
   * Creates a new Session
   * @constructor
   * @param {string} [token] (Optional) A unique token for the session
   */
  constructor(token) {
    super("place/autocomplete/json");
    this.session = new Session(token);
  }

  /**
   * Calls the place autocomplete endpoint of the Google Maps API
   * @param {string} query 
   * @returns {Promise<AutocompleteResult|TypeError|Error>} {@link AutocompleteResult}
   */
   async autocomplete(query) {
    if (typeof query !== "string") throw new TypeError("Invalid Argument");
    let response = await this.getEndpoint({ input: query }, { isSession: true });
    if (response.status !== "OK") throw new Error(response.status);
    return GoogleSearch.formatResponse(response.predictions);
  }

  /**
   * Formats the response object
   * @static
   * @param {*[]} [response] 
   * @returns {AutocompleteResult[]} {@link AutocompleteResult}
   * @throws {TypeError} Invalid Argument
   */
   static formatResponse(response = []) {
    if (!Array.isArray(response)) throw new TypeError("Invalid Argument");
    return response.filter(prediction => (
      prediction.place_id && prediction.description
    )).map(prediction => ({
      placeId: prediction.place_id,
      description: prediction.description,
      mainText: prediction.structured_formatting?.main_text || prediction.description,
      secondaryText: prediction.structured_formatting?.secondary_text || undefined
    }));
  }
}

class GoogleDirections extends Google {
  /**
   * Creates a new instance of the GoogleDirections class
   * @constructor
   */
  constructor() {
    super("directions/json");
    /** @type {{ id: number, value: string, modifier?: string }[]} */
    this.stops;
  }

  get start() {
    return this.findStop("modifier", "start") || this.findStop("modifier", "end") || this.stops[0];
  }

  get wasStartSent() {
    return !!this.findStop("modifier", "start");
  }

  get end() {
    return this.findStop("modifier", "end") || this.findStop("modifier", "start") || this.stops[0];
  }

  get wasEndSent() {
    return !!this.findStop("modifier", "end");
  }

  get middleStops() {
    let middleStops = this.stops.filter(stop => !(stop.modifier === "start" || stop.modifier === "end"));
    if (middleStops.length === 0) return [];
    if (!this.wasStartSent && !this.wasEndSent) middleStops.shift();
    return middleStops;
  }

  /**
   * Searches an array of stops for a given query
   * @param {string} propertyName The property of the stop to search for the query in
   * @param {string} query The query to search for
   * @returns {{ id: number, value: string, modifier?: string }|false} The first matching stop; or false if no stop matched the query
   */
  findStop(propertyName, query) {
    let stop = this.stops.find(stop => (stop[propertyName]?.includes(query) || stop[propertyName] === query));
    return stop || false;
  }

  // start
  //  end
  //   start = start; end = end; Remove start and end from stops
  //  !end
  //   start = start; end = start; Remove start from stops; Remove last leg
  // !start
  //  end
  //   start = end; end = end; Remove end from stops; Remove first leg
  //  !end
  //   start = stops[0]; end = stops[0]; Remove stops[0] from stops; Remove last leg

  /**
   * Calls the directions endpoint of the Google Maps API
   * @param {string} stops
   * @param {Object} [options]
   * @returns {Promise<DirectionsResult|TypeError|Error>} {@link DirectionsResult}
   */
  async directions(stops, options = {}) {
    if (typeof stops !== "string" || typeof options !== "object") throw new TypeError("Invalid Argument");
    // Convert stops string to an array of objects
    this.stops = stops.split("|").map((stop, index) => {
      return { 
        id: index, 
        ...(stop.includes(":")) ? { 
          value: stop.split(":")[1], 
          modifier: stop.split(":")[0] 
        } : { 
          value: stop 
        } 
      };
    });
    let response = await this.getEndpoint({
      origin: this.start.value,
      destination: this.end.value,
      ...(this.middleStops.length > 0) ? { 
        waypoints: `optimize:true|${this.middleStops.map(stop => stop.value).join("|")}` 
      } : {},
      ...options
    }, { isSession: false });
    if (response.status !== "OK") throw new Error(response.status);
    if (!this.wasStartSent && !this.wasEndSent) response.routes[0].legs.pop();
    if (!this.wasStartSent && this.wasEndSent) response.routes[0].legs.shift();
    if (!this.wasEndSent && this.wasStartSent) response.routes[0].legs.pop();
    let stopOrder = (this.wasStartSent || (!this.wasStartSent && !this.wasEndSent)) ? [ this.start.id ] : [];
    for (const waypointIndex of response.routes[0].waypoint_order) {
      stopOrder.push(Object.values(this.middleStops).map(stop => stop.id)[waypointIndex]);
    }
    if (this.wasEndSent) stopOrder.push(this.end.id);
    response.routes[0].waypoint_order = stopOrder;
    return GoogleDirections.formatResponse(response.routes[0]);
  }

  /**
   * Formats the response object
   * @static
   * @param {{}} [route] 
   * @returns {DirectionsResult} {@link DirectionsResult}
   * @throws {TypeError} Invalid Argument
   */
  static formatResponse(route = {}) {
    if (typeof route !== "object") throw new TypeError("Invalid Argument");
    if (Object.keys(route).length === 0) return {};
    return {
      copyright: route.copyrights,
      warnings: route.warnings,
      stopOrder: route.waypoint_order,
      legs: route.legs.map(leg => ({
        distance: leg.distance.value,
        duration: leg.duration_in_traffic?.value || leg.duration.value,
        start: leg.start_address,
        end: leg.end_address
      }))
    }
  }
}

module.exports = {
  Google,
  GoogleSearch,
  GoogleDirections
}