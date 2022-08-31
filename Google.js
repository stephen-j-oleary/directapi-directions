/**
 * @typedef {Object} AutocompleteResult
 * @property {string} placeId
 * @property {string} description
 * @property {string} mainText
 * @property {string} secondaryText
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

module.exports = {
  Google,
  GoogleSearch
}