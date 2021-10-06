const router = require("express").Router(),
      MongoClient = require("mongodb").MongoClient,
      AuthServer = require("../Authorization"),
      bodyParser = require("body-parser");
require("dotenv").config();

/**
 * @openapi
 * /authentication/token:
 *   post:
 *     description: Generates an access token given valid client credentials
 *     security: [{
 *       basicAuth: []
 *     }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               grantType:
 *                 type: string
 *                 enum: 
 *                   - client_credentials
 *               scope:
 *                 type: string
 *             required:
 *               - grantType
 *               - scope
 *     responses:
 *       '200':
 *         description: Successfully authenticated the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 tokenType:
 *                   type: string
 *                   enum:
 *                     - bearer
 *                 expiresIn:
 *                   type: number
 *                 scope:
 *                   type: string
 *               required:
 *                 - accessToken
 *                 - tokenType
 *                 - expiresIn
 *       '400':
 *         description: Invalid Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/GeneralError"
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/GeneralError"
 *       '500':
 *         description: Internal Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/GeneralError"
 */
router.post("/authentication/token", bodyParser.urlencoded({ extended: false }), async (req, res) => {
  const { grantType, scope } = req.body;
  if (grantType !== "client_credentials") return res.status(400).json({code: "unsupported_grant_type", message: "Expected 'client_credentials' grantType"});
  const { authorization } = req.headers;
  if (!authorization) return res.status(401).json({code: "invalid_client", message: "Missing Authorization Header"});
  const [ authType, encodedCredentials ] = authorization.trim().split(" ");
  if (authType !== "Basic") return res.status(401).json({code: "invalid_client", message: "Expected Basic Authentication"});
  const [ clientId, clientSecret ] = Buffer.from(encodedCredentials, 'base64').toString().split(":");
  try {
    const token = await new AuthServer().generateToken({clientId, clientSecret}, scope);
    return res.status(200).json({
      accessToken: token.token,
      tokenType: "bearer",
      expiresIn: token.expiresIn,
      scope: token.scope
    });
  }
  catch (err) {
    if (err.message === "Invalid Argument") return res.status(400).json({code: "invalid_request", message: "Invalid Request"});
    if (err.message === "Invalid Client") return res.status(401).json({code: "invalid_client", message: "Invalid Client Credentials"})
    if (err.message === "Not Authorized") return res.status(401).json({code: "unauthorized_client", message: "Unauthorized"});
    return res.status(500).json({message: err.message});
  }
});

/**
 * @openapi
 * /authentication/clients:
 *   post:
 *     description: Creates a new api client
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientEmail:
 *                 type: string
 *               clientPassword:
 *                 type: string
 *             required:
 *               - clientEmail
 *               - clientPassword
 *     responses:
 *       '200':
 *         description: Successfully added a new client
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientId:
 *                   type: string
 *                 clientSecret:
 *                   type: string
 *               required:
 *                 - clientId
 *                 - clientSecret
 *       '400':
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/GeneralError"
 *       '500':
 *         description: Internal error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/GeneralError"
 */
router.post("/authentication/clients", async (req, res) => {
  const { clientEmail, clientPassword } = req.body;
  if (typeof clientEmail !== "string" || typeof clientPassword !== "string") return res.status(400).send({message: "Invalid Request"});
  try {
    let client = await new AuthServer().createNewClient(clientEmail, clientPassword);
    return res.status(200).json(client);
  } catch (err) {
    if (err.message === "Invalid Argument") return res.status(400).json({message: "Invalid Request"});
    if (err.message === "Client Already Exists") return res.status(400).json({message: "Client Already Exists"});
    return res.status(500).json({message: err.message});
  }
})

/**
 * Authentication middleware that checks the client's access scope
 */
router.use("/", async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) return res.status(401).json({"message": "Missing Authorization Header"});
  const [ authType, token ] = authorization.trim().split(" ");
  if (authType !== "Bearer") return res.status(401).json({"message": "Expected A Bearer Token"});
  const requiredScope = await determineRequestScope(req);
  if (new AuthServer().verifyToken(token, requiredScope)) {
    next();
  } else {
    return res.status(403).json({"message": "Unauthorized"});
  }
});

async function determineRequestScope(req) {
  const route = req.path.substr(1);
  const scopeOptions = await getScopes(route);
  let scope = scopeOptions.filter(option => {
    const { query: queryLimit, queryParams: queryParamLimits } = option.limits;
    if (queryLimit) {
      const { min, max } = queryLimit;
      const queryLength = req.query.length;
      if (queryLength < min || queryLength > max) return false;
    }
    if (queryParamLimits) {
      for (const key in queryParamLimits) {
        const limit = queryParamLimits[key];
        const queryValue = req.query[key];
        if (limit.arrLength) {
          const { min, max, separator } = limit.arrLength;
          const arrLength = queryValue.split(separator).length;
          if (arrLength < min || arrLength > max) return false;
        }
        if (limit.strLength) {
          const { min, max } = limit.strLength;
          const strLength = queryValue.length;
          if (strLength < min || strLength > max) return false;
        }
      }
    }
    return true;
  });
  return scope[0]?.value || `${route}:free`;
}

/**
 * Gets the default scope value to be used for a new client
 * @returns {Promise<string>}
 */
async function getScopes(route) {
  let clusterConnection = await MongoClient.connect(process.env.DB_CLUSTER_URL);
  let collection = clusterConnection.db("Authorization_Server").collection("Scopes");
  let result = await collection.find({ route }).toArray();
  clusterConnection.close();
  return result;
}

module.exports = router;