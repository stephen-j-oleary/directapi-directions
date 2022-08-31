
import Token from "./Token.js";
import config from "../../config.js";

const { authToken } = config;
const defaults = {
  ...authToken,
  privateKey: authToken.privateKey.replace(/\\n/g, "\n"),
  publicKey: authToken.publicKey.replace(/\\n/g, "\n")
};


const AccessToken = Token(defaults);


export default AccessToken;
