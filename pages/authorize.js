
import express from "express";
import config from "../../config.js";
import Client from "../schemas/Client.js";
import ApiError from "../../helpers/ApiError.mjs";
import validateParams from "../../helpers/validate-params.mjs";
import assignDefined from "../../helpers/assignDefined.mjs";

const router = express.Router();


/**
 * @openapi
 * /authorize:
 *   get:
 *     description: Step 1 in the auth code flow
 *     security: []
 *     parameters:
 *       - name: response_type
 *         in: query
 *         schema:
 *           type: string
 *           oneOf: code
 *         required: true
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
 *       "302":
 *         description: Valid request. Redirect to the user login page
 *       "400":
 *         description: Invalid request
 *         $ref: "#/components/responses/ApiError"
 *       "401":
 *         description: Unauthorized
 *         $ref: "#/components/responses/ApiError"
 *       "500":
 *         description: Server error
 *         $ref: "#/components/responses/ApiError"
 */
router.get("/", validateParams({
  response_type:  { in: "query", type: "string", required: true, oneOf: [ "code" ] },
  client_id:      { in: "query", type: "string", required: true },
  redirect_uri:   { in: "query", type: "string", required: true },
  scope:          { in: "query", type: "string" },
  state:          { in: "query", type: "string" }
}), async (req, res, next) => {
  // Request parameters
  const { response_type, client_id, redirect_uri, scope, state } = req.query;

  try {
    const client = await Client.findOne({ client_id });
    if (!client || !client.verifyCredentials({ redirect_uri })) {
      throw new ApiError(401, "unauthorized_client", "Invalid client_id or redirect_uri");
    }

    const query = new URLSearchParams(assignDefined({}, { response_type, client_id, redirect_uri, scope, state })).toString();
    return res.status(302).redirect(`${config.app.url}/authorize?${query}`);
  }
  catch (err) {
    next(err);
  }
});


export default router;
