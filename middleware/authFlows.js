
import Token from "../helpers/Token.js";
import User from "../schemas/User.js";
import Client from "../schemas/Client.js";



const basic = async (request, requiredScope) => {
  // Request parameters
  const { authorization } = request.headers;
  if (!authorization) throw new Error();

  const [ type, credentials ] = authorization.split(" ");
  if (type !== "Basic") throw new Error();

  const [ emailOrId, password ] = Buffer.from(credentials, "base64").toString().split(":");
  if (!emailOrId || !password) throw new Error();

  // Retrieve user from DB
  const user = await User.findOne({ $or: [
    { user_id: emailOrId },
    { email: emailOrId }
  ] });

  if (!user || !user.comparePassword(password)) throw new Error("Invalid credentials");
  if (!user.hasScope(requiredScope)) throw new Error("Unauthorized scope");

  return { user_id: user.user_id };
};


const client_basic = async (request) => {
  // Request parameters
  const { authorization } = request.headers;
  if (!authorization) throw new Error();

  const [ type, credentials ] = authorization.split(" ");
  if (type !== "Basic") throw new Error();

  const [ client_id, client_secret ] = Buffer.from(credentials, "base64").toString().split(":");
  if (!client_id || !client_secret) throw new Error();

  // Retrieve user from DB
  const client = await Client.findOne({ client_id });

  if (!client || !client.verifyCredentials({ client_secret })) throw new Error("Invalid credentials");

  return { client_id: client.client_id };
};


const user_credentials = async (request, requiredScope) => {
  // Request parameters
  const { user_id, email, password } = request.body;

  const query = {};
  user_id && (query.user_id = user_id);
  email && (query.email = email);

  const user = await User.findOne(query);

  if (!user || !user.comparePassword(password)) throw new Error("Invalid credentials");
  if (!user.hasScope(requiredScope)) throw new Error("Unauthorized scope");

  return { user_id: user.user_id };
};


const client_credentials = async (request) => {
  // Request parameters
  const { client_id, client_secret } = request.body;

  const client = await Client.findOne({ client_id });
  if (!client || !client.verifyCredentials({ client_secret })) throw new Error("Invalid credentials");

  return { client_id: client.client_id };
};


const access_token = async (request, requiredScope) => {
  // Request parameters
  const { authorization } = request.headers;
  if (!authorization) throw new Error();

  const [ type, token ] = authorization.split(" ");
  if (type !== "Bearer") throw new Error();

  if (!Token.validate(token, "token")) throw new Error();
  if (!Token.verifyPayload(token, {
    scope: {
      validator_functions: [
        (scope) => (scope.split(" ").includes(requiredScope))
      ]
    }
  })) {
    throw new Error();
  }

  const { user_id, client_id } = Token.read(token);
  return { user_id, client_id };
}



export default {
  basic,
  client_basic,
  user_credentials,
  client_credentials,
  access_token
};
