/**
 * @typedef {Object} Client
 * @property {string} clientId
 * @property {string} clientSecret
 */
/**
 * @typedef {Object} AccessTokenPayload
 * @property {string} clientId
 * @property {string} scope
 */

const fs = require("fs"),
      uuidFromString = require("uuid-by-string"),
      uuid = require("uuid"),
      crypto = require("crypto"),
      jwt = require("jsonwebtoken"),
      MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

const issuer = process.env.OAUTH_TOKEN_ISSUER,
      expiresIn = process.env.OAUTH_TOKEN_EXPIRY,
      algorithm = process.env.OAUTH_TOKEN_ALGORITHM;

const privateKey = fs.readFileSync("./private.pem", "utf-8"),
      publicKey = fs.readFileSync("./public.pem", "utf-8");

module.exports = class AuthorizationServer {
  /**
   * Adds a new client with default scope to the DB
   * @param {string} email The client's email
   * @param {string} clientSecret The client's hashed password
   * @returns {Promise<Client>} {@link Client} The newly created client
   */
  async createNewClient(email, clientSecret) {
    if (typeof email !== "string" || typeof clientSecret !== "string") throw new TypeError("Invalid Argument");
    const defaultScope = await this.getDefaultScope();
    const client = {
      clientId: uuidFromString(email, 5),
      clientSecret: crypto.createHash("sha512").update(clientSecret).digest("hex"),
      scope: defaultScope
    };
    if (await this.doesClientExist(client.clientId)) throw new Error("Client Already Exists");
    let clusterConnection = await MongoClient.connect(process.env.DB_CLUSTER_URL);
    let collection = clusterConnection.db("Authorization_Server").collection("Clients");
    let result = await collection.insertOne(client);
    clusterConnection.close();
    return {
      ...client,
      clientSecret: clientSecret
    };
  }

  /**
   * Checks whether a client already exists
   * @param {string} clientId The client's clientId or email
   * @returns {Promise<boolean>} Resolves true if client exists; Resolves false if client isn't found
   */
  async doesClientExist(clientId) {
    if (typeof clientId !== "string") throw new TypeError("Invalid Argument");
    clientId = (uuid.validate(clientId)) ? clientId : uuidFromString(clientId, 5);
    let clusterConnection = await MongoClient.connect(process.env.DB_CLUSTER_URL);
    let collection = clusterConnection.db("Authorization_Server").collection("Clients");
    let result = await collection.findOne({ clientId });
    return !!result;
  }

  /**
   * Verifies client credentials
   * @param {string} clientId The client's clientId or email
   * @param {string} clientSecret The client's clientSecret or hashed password
   * @returns {Promise<boolean>} Resolves true if credentials are valid; Resolves false if credentials are invalid
   */
  async verifyClient(clientId, clientSecret) {
    clientId = (uuid.validate(clientId)) ? clientId : uuidFromString(clientId, 5);
    let clusterConnection = await MongoClient.connect(process.env.DB_CLUSTER_URL);
    let collection = clusterConnection.db("Authorization_Server").collection("Clients");
    let result = await collection.findOne({ clientId });
    clusterConnection.close();
    return (crypto.createHash("sha512").update(clientSecret).digest("hex") === result.clientSecret);
  }
  
  /**
   * Gets the client's access scope
   * @param {string} clientId The client's email or clientId
   * @returns {Promise<string>}
   */
  async getClientScope(clientId) {
    clientId = (uuid.validate(clientId)) ? clientId : uuidFromString(clientId, 5);
    let clusterConnection = await MongoClient.connect(process.env.DB_CLUSTER_URL);
    let collection = clusterConnection.db("Authorization_Server").collection("Clients");
    let result = await collection.findOne({ clientId });
    clusterConnection.close();
    if (!result) return ""; // Client not found
    return result.scope;
  }

  /**
   * Filters out any unauthorized scopes from the requested scope
   * @param {string} clientScope The client's access scope
   * @param {string} requestedScope The requested scope
   * @returns {string}
   */
  verifyScope(clientScope, requestedScope) {
    if (typeof clientScope !== "string" || typeof requestedScope !== "string") throw new TypeError("Invalid Argument");
    return requestedScope.split(" ").filter(scope => (clientScope.split(" ").includes(scope))).join(" ");
  }

  /**
   * Gets the default scope value to be used for a new client
   * @returns {Promise<string>}
   */
  async getDefaultScope() {
    let clusterConnection = await MongoClient.connect(process.env.DB_CLUSTER_URL);
    let collection = clusterConnection.db("Authorization_Server").collection("Scopes");
    let result = await collection.find({ default: true }, {projection: { _id: 0, value: 1 }}).toArray();
    clusterConnection.close();
    return result.map(item => item.value).join(" ");
  }
  
  /**
   * Generates an access token for the given client
   * @param {{ clientId, clientSecret }} client The client to generate the token for
   * @param {string} requestedScope The scope being requested
   * @returns {{ token, scope }} An object containing the token
   */
  async generateToken(client, requestedScope) {
    if (typeof client !== "object" || typeof requestedScope !== "string") throw new TypeError("Invalid Argument");
    if (!await this.verifyClient(client.clientId, client.clientSecret)) throw new Error("Invalid Client");
    const clientScope = await this.getClientScope(client.clientId);
    let allowedScope = await this.verifyScope(clientScope, requestedScope);
    if (!allowedScope || allowedScope === "") throw new Error("Not Authorized");
    return {
      token: jwt.sign({
        clientId: client.clientId,
        scope: allowedScope
      }, privateKey, { 
        issuer: issuer, 
        expiresIn: expiresIn, 
        algorithm: algorithm 
      }),
      scope: allowedScope,
      expiresIn: expiresIn
    };
  }

  /**
   * Verifies the access token
   * @param {string} token The JWT to be verified
   * @param {string} requiredScope The scope required for the request
   * @returns {boolean}
   */
  verifyToken(token, requiredScope) {
    if (typeof token !== "string" || typeof requiredScope !== "string") throw new TypeError("Invalid Argument");
    try {
      const tokenPayload = jwt.verify(token, publicKey, { 
        issuer: issuer, 
        algorithms: [algorithm] 
      });
      if (!tokenPayload) return false;
      return (tokenPayload.scope.split(" ").includes(requiredScope));
    } catch (err) {
      return false;
    }
  }
}