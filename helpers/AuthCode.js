
import Token from "./Token.js";
import config from "../../config.js";

const { authCode } = config;
const defaults = {
  ...authCode,
  privateKey: authCode.privateKey.replace(/\\n/g, "\n"),
  publicKey: authCode.publicKey.replace(/\\n/g, "\n")
};


const AuthCode = Token(defaults);


export default AuthCode;
