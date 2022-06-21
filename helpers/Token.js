
import jwt from "jsonwebtoken";
import config from "../../config.js";

const { authToken, authCode } = config;

const DEFAULTS = {
  token: {
    issuer: authToken.issuer,
    expiresIn: authToken.expiresIn,
    algorithm: authToken.algorithm,
    privateKey: authToken.privateKey.replace(/\\n/g, "\n"),
    publicKey: authToken.publicKey.replace(/\\n/g, "\n")
  },
  code: {
    issuer: authCode.issuer,
    expiresIn: authCode.expiresIn,
    algorithm: authCode.algorithm,
    privateKey: authCode.privateKey.replace(/\\n/g, "\n"),
    publicKey: authCode.publicKey.replace(/\\n/g, "\n")
  }
};


export default class Token {
  /**
   * Generates an access token
   * @param {string} client_id
   * @param {string} user_id
   * @param {string} scope
   * @returns {{ token, expires_in, scope }}
   */
  static generate(payload, type = "token") {
    if (typeof payload !== "object" || typeof type !== "string") throw new TypeError("Invalid argument");

    const defaults = DEFAULTS[type];

    return {
      token: jwt.sign(payload, defaults.privateKey, { algorithm: defaults.algorithm, issuer: defaults.issuer, expiresIn: defaults.expiresIn }),
      expires_in: defaults.expiresIn
    };
  }


  /**
   * Checks if the passed token is valid; Throws if it is invalid
   * @param {string} token The JWT to be validated
   * @returns {boolean}
   */
  static validate(token, type = "token") {
    if (typeof token !== "string" || token.length === 0) return false;

    const defaults = DEFAULTS[type];

    try {
      jwt.verify(token, defaults.publicKey, {
        issuer: defaults.issuer,
        algorithms: [defaults.algorithm]
      });

      return true;
    }
    catch (err) {
      return false;
    }
  }


  /**
   * Verifies the token payload
   * @param {string} token The JWT to be verified
   * @param {object} verifier The object to verify the token against
   */
  static verifyPayload(token, verifier) {
    if (typeof token !== "string" || token.length === 0 || typeof verifier !== "object") throw new TypeError("Invalid argument");

    try {
      const payload = Token.read(token);

      return Object.entries(verifier).every(([name, v]) => {
        if (checkParamPresent(payload, name)) {
          const param = payload[name];

          if (!checkOneOf(param, v.oneOf)) return false;
          if (!checkValidators(param, v.validator_functions)) return false;
          return true;
        }
        else if (v.required) {
          return false;
        }
      });
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
  static read(token) {
    if (typeof token !== "string") throw new TypeError("Invalid argument");

    const payload = jwt.decode(token);
    if (!payload) throw new Error("Invalid token");

    return payload;
  }
}

const checkParamPresent = (params, name) => {
  return (Object.keys(params).includes(name));
};

const checkOneOf = (param, oneOf = undefined) => {
  if (!oneOf) return true;
  return (oneOf.includes(param));
};

const checkValidators = (param, validators = undefined) => {
  if (!validators) return true;
  for (const vFunc of validators) {
    if (!vFunc(param)) return false;
  }
  return true;
};
