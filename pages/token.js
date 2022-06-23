
import express from "express";
import ApiError from "../../helpers/ApiError.mjs";
import Token from "../helpers/Token.js";
import Client from "../schemas/Client.js";
import schemas from "../schemas/requests/token.js";

// Middleware
import authorizer from "../middleware/authorizer.js";
import validator from "../middleware/validator.js";

const router = express.Router();


/**
 * @openapi
 * /token:
 *   post:
 *     description: Generates an access token given valid client credentials
 *     security:
 *       - basic: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               grant_type:
 *                 type: string
 *                 enum:
 *                   - authorization_code
 *               code:
 *                 description: The authorization code obtained from the authorize endpoint
 *                 type: string
 *               redirect_uri:
 *                 type: string
 *               client_id:
 *                 type: string
 *             required:
 *               - grant_type
 *               - code
 *               - redirect_uri
 *               - client_id
 *     responses:
 *       "200":
 *         description: Successfully authenticated the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                 token_type:
 *                   type: string
 *                   enum:
 *                     - Bearer
 *                 expires_in:
 *                   type: number
 *                 scope:
 *                   type: string
 *               required:
 *                 - access_token
 *                 - token_type
 *                 - expires_in
 *                 - scope
 *       "400":
 *         description: Invalid Request
 *         $ref: "#/components/responses/ApiError"
 *       "401":
 *         description: Unauthorized
 *         $ref: "#/components/responses/ApiError"
 *       "500":
 *         description: Server error
 *         $ref: "#/components/responses/ApiError"
 */
router.post("/",
  validator(schemas.post),
  authorizer("client_basic"),
  async (req, res, next) => {
    // Request parameters
    const { authorized_client_id } = res.locals;
    const { code, redirect_uri, client_id } = req.body; // Body

    try {
      if (authorized_client_id !== client_id) throw new ApiError(401, "invalid_client");

      // Verify the client
      const client = await Client.findOne({ client_id });
      if (!client || !client.verifyCredentials({ redirect_uri })) {
        throw new ApiError(401, "invalid_client", "Invalid client_id or redirect_uri");
      }

      if (!Token.validate(code, "code")) throw new ApiError(400, "invalid_grant");
      if (!Token.verifyPayload(code, {
        client_id:    { required: true, oneOf: [ client_id ] },
        redirect_uri: { required: true, oneOf: [ redirect_uri ] }
      })) throw new ApiError(400, "invalid_grant");

      const { user_id, scope } = Token.read(code);

      // Generate the token
      const { token, expires_in } = Token.generate({ client_id, user_id, scope }, "token");

      // Format the response
      return res.status(200).json({
        access_token: token,
        token_type: "Bearer",
        expires_in: expires_in,
        scope: scope
      });
    }
    catch (err) {
      next(err);
    }
  }
);


export default router;
