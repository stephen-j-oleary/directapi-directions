
import express from "express";
import jsonPatch from "json-patch";
import mergePatch from "json-merge-patch";

import validateParams from "../../helpers/validate-params.mjs";
import assignDefined from "../../helpers/assignDefined.mjs";
import ApiError from "../../helpers/ApiError.mjs";
import Client from "../schemas/Client.js";
import User from "../schemas/User.js";

// Middleware
import authorizer, { basic, access_token } from "../middleware/authorizer.js";

const router = express.Router();


/**
 * @openapi
 * /client:
 *   get:
 *     description: Get client information
 *     security:
 *       - basic: []
 *       - oauth2: []
 *     parameters:
 *       - name: client_id
 *         in: path
 *         description: Filters clients by client_id
 *         schema:
 *           type: string
 *       - name: user_id
 *         in: query
 *         description: Filters clients by user_id
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Client"
 *       "400":
 *         description: Invalid request
 *         $ref: "#/components/responses/ApiError"
 *       "401":
 *         description: Unauthorized
 *         $ref: "#/components/responses/ApiError"
 *       "404":
 *         description: Not found
 *         $ref: "#/components/responses/ApiError"
 *       "500":
 *         description: Server error
 *         $ref: "#/components/responses/ApiError"
 */
router.get("/:client_id?", validateParams({
  client_id:  { in: "params", type: "string" },
  user_id:    { in: "query", type: "string" }
}), authorizer([basic, access_token], "client:read"), async (req, res, next) => {
  // Request parameters
  const { authorized_user_id } = res.locals;
  const { user_id } = req.query;
  const { client_id } = req.params;

  try {
    const queryFilter = assignDefined({}, { user_id, client_id });
    const authFilter = { user_id: authorized_user_id };
    const filter = {
      $and: [ queryFilter, authFilter ]
    };

    const clients = await Client.find(filter);
    if (!clients || clients.length === 0) throw new ApiError(404, "resource_not_found");

    res.status(200).json(clients);
  }
  catch (err) {
    next(err);
  }
});


/**
 * @openapi
 * /client:
 *   post:
 *     description: Create a new client
 *     security:
 *       - basic: []
 *       - oauth2: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Client"
 *     responses:
 *       "201":
 *         description: Successfully created client
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Client"
 *       "400":
 *         description: Invalid request
 *         $ref: "#/components/responses/ApiError"
 *       "401":
 *         description: Unauthorized
 *         $ref: "#/components/responses/ApiError"
 *       "409":
 *         description: Duplicate resource
 *         $ref: "#/components/responses/ApiError"
 *       "500":
 *         description: Server error
 *         $ref: "#/components/responses/ApiError"
 */
router.post("/", authorizer([basic, access_token], "client:write"), async (req, res, next) => {
  const { authorized_user_id } = res.locals;
  const { name, redirect_uri, user_id = authorized_user_id } = req.body;

  try {
    if (authorized_user_id !== user_id) throw new ApiError(401, "unauthorized");

    // Create the new client document
    const client = new Client({ name, redirect_uri, user_id });
    await client.save();

    // Add the client to the user document
    await User.updateMany(
      { user_id },
      { $push: { clients: client.client_id } }
    );

    res.status(201).json(client);
  }
  catch (err) {
    next(err);
  }
});


/**
 * @openapi
 * /client:
 *   patch:
 *     description: Modify an existing client
 *     security:
 *       - basic: []
 *       - oauth2: []
 *     parameters:
 *       - name: client_id
 *         in: path
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json-patch+json:
 *           schema:
 *             $ref: "#/components/schemas/JsonPatch"
 *         application/merge-patch+json:
 *           schema:
 *             $ref: "#/components/schemas/MergePatch"
 *     responses:
 *       "201":
 *         description: Successfully modified client
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Client"
 *       "400":
 *         description: Invalid request
 *         $ref: "#/components/responses/ApiError"
 *       "401":
 *         description: Unauthorized
 *         $ref: "#/components/responses/ApiError"
 *       "404":
 *         description: Not found
 *         $ref: "#/components/responses/ApiError"
 *       "409":
 *         description: Duplicate resource
 *         $ref: "#/components/responses/ApiError"
 *       "500":
 *         description: Server error
 *         $ref: "#/components/responses/ApiError"
 */
router.patch("/:client_id?", validateParams({
  client_id: { in: "params", type: "string", required: true }
}), authorizer([basic, access_token], "client:update"), async (req, res, next) => {
  const { authorized_user_id } = res.locals;
  const { client_id } = req.params;

  try {
    const queryFilter = { client_id };
    const authFilter = { user_id: authorized_user_id };
    const filter = {
      $and: [ queryFilter, authFilter ]
    };

    let client = await Client.findOne(filter);
    if (!client) throw new ApiError(404, "resource_not_found", "Client could not be found");

    try {
      if (req.is("application/json-patch+json")) jsonPatch.apply(client, req.body);
      if (req.is("application/merge-patch+json")) client = mergePatch.apply(client, req.body);
    }
    catch (err) {
      throw new ApiError(400, "invalid_request", err.message);
    }

    await Client.replaceOne(filter, client);

    res.status(201).json(client);
  }
  catch (err) {
    next(err);
  }
});


/**
 * @openapi
 * /client:
 *   delete:
 *     description: Delete a client
 *     security:
 *       - basic: []
 *       - oauth2: []
 *     parameters:
 *       - name: client_id
 *         in: path
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       "201":
 *         description: Successfully deleted client
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 client_id:
 *                   type: string
 *                   description: The client_id of the deleted client
 *               required:
 *                 - client_id
 *       "400":
 *         description: Invalid request
 *         $ref: "#/components/responses/ApiError"
 *       "401":
 *         description: Unauthorized
 *         $ref: "#/components/responses/ApiError"
 *       "404":
 *         description: Not found
 *         $ref: "#/components/responses/ApiError"
 *       "500":
 *         description: Server error
 *         $ref: "#/components/responses/ApiError"
 */
router.delete("/:client_id?", validateParams({
  client_id: { in: "params", type: "string", required: true }
}), authorizer([basic, access_token], "client:delete"), async (req, res, next) => {
  const { authorized_user_id } = res.locals;
  const { client_id } = req.params;

  try {
    const queryFilter = { client_id };
    const authFilter = { user_id: authorized_user_id };
    const filter = {
      $and: [ queryFilter, authFilter ]
    };

    const { deletedCount } = await Client.deleteOne(filter);
    if (deletedCount === 0) throw new ApiError(404, "resource_not_found");

    res.status(201).json({ client_id });
  }
  catch (err) {
    next(err);
  }
});


export default router;
