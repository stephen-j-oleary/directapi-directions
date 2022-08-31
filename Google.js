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

const API_KEY = process.env.GOOGLE_API_KEY;
const API_URL = process.env.GOOGLE_API_URL;

const Google = {
  async sendRequest(endpoint, { params, ...options } = {}) {
    if (typeof endpoint !== "string" || !(params instanceof URLSearchParams)) throw new TypeError("Invalid argument");

    // Add api key
    params.append("key", API_KEY);

    // Construct request path string
    const path = `${API_URL}/${endpoint}?${params.toString()}`;

    // Send request
    const response = await axios.get(path);
    return response.data;
  }
}

class GoogleSearch {
  /**
   * Creates a new Session
   * @constructor
   * @param {string} [token] (Optional) A unique token for the session
   */
  constructor(token) {
    //super("place/autocomplete/json");
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