const axios = require("axios");
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


module.exports = Google;