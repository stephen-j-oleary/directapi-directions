
import Token from "../helpers/Token.js";
import User from "../schemas/User.js";
import Client from "../schemas/Client.js";
import _ from "lodash";



export const basic = async (req, scope) => {
  // Authorization header
  const { authorization } = req.headers;
  if (!authorization) throw new Error("Missing authorization");

  const [type, credentials] = authorization.split(" ");
  if (type !== "Basic") throw new Error("Invalid authorization type");

  // Decode username and password from basic authentication
  const [emailOrId, password] = Buffer.from(credentials, "base64").toString().split(":");
  if (!emailOrId || !password) throw new Error("Invalid credentials");

  // Retrieve user from DB
  const user = await User.findOne({
    $or: [
      { user_id: emailOrId },
      { email: emailOrId }
    ]
  });

  if (!user || !user.comparePassword(password)) throw new Error("Invalid credentials");
  if (!user.hasScope(scope)) throw new Error("Unauthorized scope");

  return { user_id: user.user_id };
};


export const client_basic = async (req) => {
  // Authorization header
  const { authorization } = req.headers;
  if (!authorization) throw new Error("Missing authorization");

  const [type, credentials] = authorization.split(" ");
  if (type !== "Basic") throw new Error("Invalid authorization type");

  // Decode username and password from basic authentication
  const [client_id, client_secret] = Buffer.from(credentials, "base64").toString().split(":");
  if (!client_id || !client_secret) throw new Error("Invalid credentials");

  // Retrieve user from DB
  const client = await Client.findOne({ client_id });

  if (!client || !client.verifyCredentials({ client_secret })) throw new Error("Invalid credentials");

  return { client_id: client.client_id };
};


export const user_credentials = async (req, scope) => {
  // Request body
  const { user_id, email, password } = req.body;

  const user = await User.findOne(
    _.omitBy({ user_id, email, password }, _.isUndefined)
  );

  if (!user || !user.comparePassword(password)) throw new Error("Invalid credentials");
  if (!user.hasScope(scope)) throw new Error("Unauthorized scope");

  return { user_id: user.user_id };
};


export const client_credentials = async (req) => {
  // Request body
  const { client_id, client_secret } = req.body;

  const client = await Client.findOne({ client_id });

  if (!client || !client.verifyCredentials({ client_secret })) throw new Error("Invalid credentials");

  return { client_id: client.client_id };
};


export const access_token = async (req, scope) => {
  // Authorization header
  const { authorization } = req.headers;
  if (!authorization) throw new Error("Missing authorization");

  const [type, token] = authorization.split(" ");
  if (type !== "Bearer") throw new Error("Invalid authorization type");

  if (!Token.validate(token, "token")) throw new Error("Invalid or expired token");
  if (!Token.verifyPayload(token, {
    scope: {
      validator_functions: [
        s => s.split(" ").includes(scope)
      ]
    }
  })) {
    throw new Error("Unauthorized scope");
  }

  const { user_id, client_id } = Token.read(token);

  return { user_id, client_id };
}
