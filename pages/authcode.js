
import express from "express";
import Client from "../schemas/Client.js";
import User from "../schemas/User.js";
import Token from "../helpers/Token.js";
import ApiError from "../../helpers/ApiError.mjs";
import validateParams from "../../helpers/validate-params.mjs";
import authorizeMW from "../middleware/authorize.js";
import assignDefined from "../../helpers/assignDefined.mjs";

const router = express.Router();


/**
 * @openapi
 * /authcode:
 *   get:
 *     description: Generate an auth code
 *     security:
 *       - basic: []
 *     parameters:
 *       - name: client_id
 *         in: query
 *         schema:
 *           type: string
 *         required: true
 *       - name: redirect_uri
 *         in: query
 *         schema:
 *           type: string
 *         required: true
 *       - name: scope
 *         in: query
 *         schema:
 *           type: string
 *       - name: state
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Successfully issued authorization code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   description: The auth code the was generated
 *                 state:
 *                   type: string
 *                   description: The state that was passed in (if applicable)
 *               required:
 *                 - code
 *       "401":
 *         description: Unauthorized
 *         $ref: "#/components/responses/ApiError"
 *       "500":
 *         description: Server error
 *         $ref: "#/components/responses/ApiError"
 */
router.get("/", validateParams({
  client_id:      { in: "query", type: "string", required: true },
  redirect_uri:   { in: "query", type: "string", required: true },
  scope:          { in: "query", type: "string" },
  state:          { in: "query", type: "string" }
}), authorizeMW(null, [ "basic" ]), async (req, res, next) => {
  // Request parameters
  const { authorized_user_id } = res.locals;
  const { client_id, redirect_uri, scope, state } = req.query;

  try {
    const client = await Client.findOne({ client_id });
    if (!client || !client.verifyCredentials({ redirect_uri })) {
      throw new ApiError(401, "unauthorized_client", "Invalid client_id or redirect_uri");
    }

    const user = await User.findOne({ user_id: authorized_user_id });
    if (!user) throw new ApiError(401, "access_denied", "Invalid user credentials");

    if (scope && !user.hasScope(scope)) throw new ApiError(401, "access_denied", "Scope not authorized");
    const authorized_scope = scope || user.scope.join(" ");

    const code = Token.generate({ client_id, redirect_uri, user_id: user.user_id, scope: authorized_scope }, "code").token;

    /* const query = new URLSearchParams(assignDefined({}, { code, state })).toString();
    return res.status(302).redirect(redirect_uri); */

    res.status(200).json(
      assignDefined({}, { code, state })
    );
  }
  catch (err) {
    next(err);
  }
});


export default router;
