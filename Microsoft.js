const { MicrosoftSession: Session } = require("./Session"),
      axios = require("axios"),
      catcher = require("./catcher");
require("dotenv").config();

module.exports = class Microsoft {
  /**
   * @constructor
   * @param {{ expires, accessToken, refreshToken }} sessionOptions 
   */
  constructor(sessionOptions = {}) {
    this.session = new Session(sessionOptions);
  }

  /**
   * Authorizes the Microsoft API session
   * @param {string} code The authorization code obtained at user login
   * @returns {Promise<this>}
   */
  async authorize(code) {
    if (typeof code !== "string") throw new TypeError("Invalid Argument");
    this.session = await this.session.authorize(code);
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
    const path = `${process.env.MICROSOFT_API_URL}${route}?${params.toString()}`;
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
    let response = await this.getEndpoint(`contactFolders`);
    return response.map(element => element.id);
  }

  /**
   * Filters a set of contacts
   * @param {Object[]} contacts The contact group to filter
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
   * Gets contacts from the client's Microsoft account for a given query
   * @param {string} query The query to search contacts with
   * @returns {Promise}
   */
  async getContacts(query) {
    if (typeof query !== "string" && typeof query !== "undefined") throw new TypeError("Invalid Argument");
    const folders = await this.getContactFolders();
    let contacts = [];
    for (const id of folders) {
      let response = await this.getEndpoint(`contactFolders/${id}/contacts`);
      contacts = [...contacts, ...response];
    }
    return (typeof query !== "undefined") ? this.filterContacts(contacts, query) : contacts;
  }

  /**
   * Generates search results for a given query
   * @param {string} query The search query to generate results for
   * @returns {Promise}
   */
  async autocomplete(query) {
    if (typeof query !== "string") throw new TypeError("Invalid Argument");
    let contacts = await this.getContacts(query);
    return Microsoft.formatAutocomplete(contacts);
  }

  /**
   * Formats each contact in a given set to the Api standard format
   * @param {*[]} contacts An array of contacts to be formatted
   * @returns {import('./Google').AutocompleteResult[]} {@link ../Google/AutocompleteResult}
   */
  static formatAutocomplete(contacts = []) {
    if (!Array.isArray(contacts)) throw new TypeError("Invalid Argument");
    return contacts.flatMap(contact => {
      const fullName = contact.displayName || `${contact.givenName} ${contact.surname}`.trim();
      let predictions = [];
      if (contact.homeAddress) predictions.push({ fullName, address: contact.homeAddress });
      if (contact.businessAddress) predictions.push({ fullName, address: contact.businessAddress });
      if (contact.otherAddress) predictions.push({ fullName, address: contact.otherAddress });
      return predictions;
    }).map(prediction => ({
      "address": prediction.address,
      "description": `${prediction.fullName} - ${prediction.address}`,
      "mainText": prediction.fullName,
      "secondaryText": prediction.address
    }));
  }
}