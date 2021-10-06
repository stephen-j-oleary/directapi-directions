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
 * @property {OverviewPolyline} overviewPolyline {@link OverviewPolyline}
 * @property {DirectionsLeg[]} legs {@link DirectionsLeg}
 */
/**
 * @typedef {Object} DirectionsLeg
 * @property {Object} details
 * @property {Distance} details.distance {@link Distance}
 * @property {Duration} details.duration {@link Duration}
 * @property {Location} details.start {@link Location}
 * @property {Location} details.end {@link Location}
 * @property {DirectionsStep[]} steps {@link DirectionsStep}
 */
/**
 * @typedef {Object} DirectionsStep
 * @property {string} instructions
 * @property {string} maneuver
 * @property {OverviewPolyline} overviewPolyline {@link OverviewPolyline}
 * @property {Object} details
 * @property {Distance} details.distance {@link Distance}
 * @property {Duration} details.duration {@link Duration}
 * @property {Location} details.start {@link Location}
 * @property {Location} details.end {@link Location}
 */
/**
 * @typedef {Object} Distance
 * @property {number} value
 * @property {string} text
 */
/**
 * @typedef {Object} Duration
 * @property {number} value
 * @property {string} text
 */
/**
 * @typedef {Object} Location
 * @property {string} address
 * @property {Coordinates} coordinates {@link Coordinates}
 */
/**
 * @typedef {Object} OverviewPolyline
 * @property {string} points
 * @property {Object} bounds
 * @property {Coordinates} bounds.southwest {@link Coordinates}
 * @property {Coordinates} bounds.northeast {@link Coordinates}
 */
/**
 * @typedef {Object} Coordinates
 * @property {number} lat
 * @property {number} lng
 */

const { GoogleSession: Session } = require("./Session"),
      axios = require("axios"),
      catcher = require("./catcher");
require("dotenv").config();

module.exports = class Google {
  /**
   * Creates a new Session
   * @constructor
   * @param {string} [token] (Optional) A unique token for the session
   */
  constructor(token) {
    this.session = new Session(token);
    this.key = process.env.GOOGLE_MAPS_API_KEY;
  }

  /**
   * Calls an endpoint of the Google Maps API
   * @param {string} route 
   * @param {Object} [options] 
   * @param {Object.<string, string>} options.queryParams
   * @param {boolean} options.isSession
   * @returns {Promise}
   */
  async getEndpoint(route, options = {}) {
    const { queryParams = {}, isSession = true } = options;
    if (typeof route !== "string" || typeof queryParams !== "object" || typeof isSession !== "boolean") throw new TypeError("Invalid Argument");
    const params = new URLSearchParams(queryParams);
    params.append("key", this.key);
    if (isSession) params.append("sessiontoken", this.session.token);
    const path = `${process.env.GOOGLE_MAPS_API_URL}${route}?${params.toString()}`;
    let response = await axios.get(path);
    return response.data;
  }

  /**
   * Calls the place autocomplete endpoint of the Google Maps API
   * @param {string} query 
   * @returns {Promise<AutocompleteResult>} {@link AutocompleteResult}
   */
  async autocomplete(query) {
    if (typeof query !== "string") throw new TypeError("Invalid Argument");
    let response = await this.getEndpoint("place/autocomplete/json", { queryParams: { input: query } });
    if (response.status !== "OK") throw new Error(response.status);
    return Google.formatAutocomplete(response.predictions);
  }

  /**
   * Calls the directions endpoint of the Google Maps API
   * @param {string} start 
   * @param {string} end 
   * @param {Object} [options]
   * @param {string} [options.stops]
   * @returns {Promise<DirectionsResult>} {@link DirectionsResult}
   */
  async directions(start, end, options = {}) {
    if (typeof start !== "string" || typeof end !== "string") throw new TypeError("Invalid Argument");
    const { stops, ...otherOptions } = options;
    let params = {
      origin: start,
      destination: end
    };
    if (stops && typeof stops === "string") params.waypoints = `optimize:true|${stops}`;
    Object.assign(params, otherOptions);
    try {
      let response = await this.getEndpoint("directions/json", { queryParams: params, isSession: false });
      if (response.status !== "OK") throw new Error(response.status);
      return Google.formatDirections(response.routes[0]);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Formats the response object
   * @static
   * @param {*[]} [response] 
   * @returns {AutocompleteResult[]} {@link AutocompleteResult}
   */
  static formatAutocomplete(response = []) {
    return response.filter(prediction => (
      prediction.place_id && prediction.description
    )).map(prediction => ({
      placeId: prediction.place_id,
      description: prediction.description,
      mainText: prediction.structured_formatting?.main_text || prediction.description,
      secondaryText: prediction.structured_formatting?.secondary_text || undefined
    }));
  }

  /**
   * Formats the response object
   * @static
   * @param {{}} [route] 
   * @returns {DirectionsResult} {@link DirectionsResult}
   */
  static formatDirections(route = {}) {
    return {
      copyright: route.copyrights,
      stopOrder: route.waypointOrder,
      warnings: route.warnings,
      overviewPolyline: {
        points: route.overview_polyline.points,
        bounds: route.bounds
      },
      legs: route.legs.map(leg => ({
        details: {
          distance: leg.distance,
          duration: leg.duration_in_traffic || leg.duration,
          start: {
            address: leg.start_address,
            coordinates: leg.start_location
          },
          end: {
            address: leg.end_address,
            coordinates: leg.end_location
          }
        },
        steps: leg.steps.map(step => ({
          instructions: step.html_instructions,
          maneuver: step.maneuver,
          overviewPolyline: step.polyline,
          details: {
            distance: step.distance,
            duration: step.duration,
            start: {
              coordinates: step.start_location
            },
            end: {
              coordinates: step.end_location
            }
          }
        }))
      }))
    }
  }
}