/**
 * @typedef {Object} SessionResource
 * @property {GoogleSessionResource} google
 * @property {MicrosoftSessionResource} microsoft
 */
/**
 * @typedef {Object} GoogleSessionResource
 * @property {string} token A unique token for the session
 */
/**
 * @typedef {Object} MicrosoftSessionResource
 * @property {number} expires The date and time (parsed to ms) that the session expires
 * @property {string} accessToken The access token for the Microsoft Graph API
 * @property {string} refreshToken The refresh token for the Microsoft Graph API
 */

const uuid = require('uuid'),
      axios = require("axios");
require("dotenv").config();

class GoogleSession {
  /**
   * Generates a new Session token
   * @constructor
   * @param {string} [token] (Optional) A unique token for the session
   * @returns {GoogleSessionResource} {@link GoogleSessionResource}
   */
  constructor(token = uuid.v4()) {
    this.token = (GoogleSession.isUUID(token)) ? token : uuid.v4();
  }

  /**
   * Checks if a token is a valid V4 UUID
   * @static
   * @param {string} token Token to check
   * @returns {boolean}
   */
  static isUUID(token) {
    return (uuid.validate(token) && uuid.version(token) === 4);
  }
}

class MicrosoftSession {
  /**
   * Creates a new Session
   * @constructor
   * @param {MicrosoftSessionResource} [options] {@link MicrosoftSessionResource}
   * @returns {MicrosoftSessionResource} {@link MicrosoftSessionResource}
   */
  constructor(options = {}) {
    Object.assign(this, options);
  }

  /**
   * Authorizes the session on the Microsoft Graph API and obtains the session tokens
   * @param {string} authCode The authorization code obtained at user login
   * @returns {Promise<MicrosoftSessionResource>} {@link MicrosoftSessionResource}
   */
  async authorize(authCode) {
    if (typeof authCode !== "string") throw new TypeError("Invalid Argument");
    let response = await MicrosoftSession.loginRequest({
      code: authCode,
      redirect_uri: process.env.MICROSOFT_LOGIN_REDIRECT,
      grant_type: "authorization_code"
    }).catch(err => {
      throw new Error(err.error_description);
    });
    this.expires = MicrosoftSession.calculateExpiry(response.expires_in);
    this.accessToken = response.access_token;
    this.refreshToken = response.refresh_token;
    return this;
  }

  /**
   * Refreshes the tokens from the Microsoft Graph API
   * @returns {Promise<MicrosoftSessionResource>} {@link MicrosoftSessionResource}
   */
  async refresh() {
    let response = await MicrosoftSession.loginRequest({
      refresh_token: this.refreshToken,
      grant_type: "refresh_token"
    }).catch(err => {
      throw new Error(err.error_description);
    });
    this.expires = MicrosoftSession.calculateExpiry(response.expires_in);
    this.accessToken = response.access_token;
    this.refreshToken = response.refresh_token;
    return this;
  }

  /**
   * Calls the login endpoint of the Microsoft API to get or refresh tokens
   * @static
   * @param {Object} options 
   * @param {string} options.grant_type Must be `authorization_code` or `refresh_token`
   * @param {string} [options.code] The authorization code retrieved from user login
   * @param {string} [options.refresh_token] The refresh token retrieved from authorization
   * @param {string} [options.redirect_uri] The redirect_uri used at user login
   * @param {string} [options.code_verifier] The code_verifier used at user login (if one was used)
   * @returns {Promise}
   */
  static async loginRequest(options) {
    if (typeof options !== "object" || typeof options?.grant_type !== "string") throw new TypeError("Invalid Argument");
    options = {
      client_id: process.env.MICROSOFT_API_KEY,
      scope: process.env.MICROSOFT_API_SCOPE,
      client_secret: process.env.MICROSOFT_API_SECRET,
      ...options
    }
    let response = await axios.post(process.env.MICROSOFT_AUTH_URL, options);
    return response.data;
  }

  /**
   * Checks if a session is expired
   * @static
   * @param {MicrosoftSessionResource} session 
   * @returns {boolean}
   */
  static isActive(session) {
    if (typeof session !== "object") throw new TypeError("Invalid Argument");
    const now = new Date();
    return (session.expires > Date.parse(now));
  }

  /**
   * Calculates the expiry date
   * @static
   * @param {number} expiresIn The number of seconds until the session expires
   * @returns {number} The date and time (parsed to ms) that the session expires
   */
  static calculateExpiry(expiresIn) {
    if (typeof expiresIn !== "number") throw new TypeError("Invalid Argument");
    const now = new Date();
    return Date.parse(now) + (expiresIn * 1000);
  }
}

module.exports = { GoogleSession, MicrosoftSession };