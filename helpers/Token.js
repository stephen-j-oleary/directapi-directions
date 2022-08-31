
import jwt from "jsonwebtoken";


function Token({ issuer, expiresIn, algorithm, privateKey, publicKey }) {
  const algorithms = [algorithm];

  /**
   * Generates an access token
   * @param {object} payload
   * @returns {{ token, expiresIn }}
   */
  function generate(payload) {
    if (typeof payload !== "object") throw new TypeError("Invalid argument");

    const token = jwt.sign(payload, privateKey, { algorithm, issuer, expiresIn });

    return { token, expiresIn };
  }


  /**
   * Validates the token
   * @param {string} token The JWT to be validated
   * @returns {boolean}
   */
  function validate(token) {
    if (typeof token !== "string" || token.length === 0) return false;

    try {
      jwt.verify(token, publicKey, { issuer, algorithms });

      return true;
    }
    catch (err) {
      return false;
    }
  }


  /**
   * Validates the token payload
   * @param {string} token The JWT to be validated
   * @param {object} schema The schema to validate the token against
   * @returns {boolean}
   */
  function validatePayload(token, schema, options = {}) {
    if (typeof token !== "string" || token.length === 0 || typeof schema !== "object") throw new TypeError("Invalid argument");

    try {
      const payload = read(token);

      schema.validateSync(payload, options);

      return true;
    }
    catch (err) {
      return false;
    }
  }


  /**
   * Reads the token
   * @param {string} token The JWT to be read
   * @returns {object} The payload of the token
   */
  function read(token) {
    if (typeof token !== "string") throw new TypeError("Invalid argument");

    const payload = jwt.decode(token);
    if (!payload) throw new Error("Invalid token");

    return payload;
  }


  return { generate, validate, validatePayload, read };
}


export default Token;
