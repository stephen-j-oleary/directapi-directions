const { MicrosoftSession: Session } = require("./Session"),
      axios = require("axios"),
      catcher = require("./catcher");
require("dotenv").config();

module.exports = class Microsoft {
  constructor(options = { expires: undefined, accessToken: undefined, refreshToken: undefined }) {
    let { expires, accessToken, refreshToken } = options;
    this.session = new Session(options);
  }

  /**
   * Authorizes the Microsoft API session
   * @param {string} code The authorization code obtained at user login
   * @returns {Promise<this>}
   */
  async authorize(code) {
    if (typeof code !== "string") throw new TypeError("Invalid Argument");
    this.session = await this.session.authorize(code).catch(err => { throw err });
    return this;
  }

  /**
   * Calls an endpoint of the Microsoft API
   * @param {string} route 
   * @param {Object} queryParams 
   * @returns {Promise}
   */
  async getEndpoint(route, queryParams = {}) {
    if (typeof route !== "string" || typeof queryParams !== "object") throw new TypeError("Invalid Argument");
    const params = new URLSearchParams(queryParams);
    const path = `${process.env.MICROSOFT_GRAPH_API_URL}${route}?${params.toString()}`;
    let response = await axios.get(path, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      }
    });
    return response.data.value;
  }

  /**
   * Gets contact folders from the client's Microsoft account
   * @returns {Promise}
   */
  async getContactFolders() {
    let response = await catcher(this.getEndpoint(`contactFolders`), []);
    return response.map(element => element.id);
  }

  /**
   * Gets contacts from the client's Microsoft account for a given query
   * @param {string} query The query to search contacts with
   * @returns {Promise}
   */
  async getContacts(query) {
    const folders = await catcher(this.getContactFolders(), []);
    let contacts = [];
    for (const id of folders) {
      let response = await catcher(this.getEndpoint(`contactFolders/${id}/contacts`), []);
      contacts = [...contacts, ...response];
    }
    return (typeof query !== "undefined") ? this.filterContacts(contacts, query) : contacts;
  }

  /**
   * Filters a set of contacts
   * @param {*[]} contacts The contact group to filter
   * @param {string} query The query used to filter the contacts
   * @returns {*[]}
   */
  filterContacts(contacts, query) {
    if (!Array.isArray(contacts) || typeof query !== "string") throw new TypeError("Invalid Argument");
    return contacts.filter(contact => (
      Object.values(contact).filter(value => (typeof value === "string" && value.includes(query))).length
    ));
  }

  /**
   * Generates search results for a given query
   * @param {string} query The search query to generate results for
   * @returns {Promise}
   */
  async autocomplete(query) {
    if (typeof query !== "string") throw new TypeError("Invalid Argument");
    let contacts = await catcher(this.getContacts(query), []);
    return Microsoft.formatAutocomplete(contacts);
  }

  /**
   * Formats each contact in a given set to the Api standard format
   * @param {*[]} contacts An array of contacts to be formatted
   * @returns {import('./Google').AutocompleteResult[]} {@link ../Google/AutocompleteResult}
   */
  static formatAutocomplete(contacts = []) {
    if (!Array.isArray(contacts)) throw new TypeError("Invalid Argument");
    return contacts.flatMap(prediction => {
      const fullName = prediction.displayName || `${prediction.givenName} ${prediction.surname}`.trim();
      let addresses = [];
      if (prediction.homeAddress) addresses.push({ fullName, address: prediction.homeAddress });
      if (prediction.businessAddress) addresses.push({ fullName, address: prediction.businessAddress });
      if (prediction.otherAddress) addresses.push({ fullName, address: prediction.otherAddress });
      return addresses;
    }).map(prediction => ({
      "description": `${prediction.fullName} - ${prediction.address}`,
      "address": prediction.address,
      "mainText": prediction.fullName,
      "secondaryText": prediction.address
    }));
  }
}