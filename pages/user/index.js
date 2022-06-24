
// Nested pages
import verify from "./verify.js";

import express from "express";
import jsonPatch from "json-patch";
import mergePatch from "json-merge-patch";

import assignDefined from "../../../helpers/assignDefined.mjs";
import ApiError from "../../../helpers/ApiError.mjs";
import User from "../../schemas/User.js";
import schemas from "../../schemas/requests/user.js";

// Middleware
import authorizer, { basic, client_basic, access_token } from "../../middleware/authorizer.js";
import validator from "../../middleware/validator.js";

const router = express.Router();


/**
 * @openapi
 * /user:
 *   get:
 *     description: Get user information
 *     security:
 *       - basic: []
 *       - oauth2: []
 *     parameters:
 *       - name: user_id
 *         in: query
 *         description: Filters the returned clients by user_id
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/User"
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
router.get("/",
  validator(schemas.get),
  authorizer([basic, access_token], "user:read"),
  async (req, res, next) => {
    // Request parameters
    const { authorized_user_id } = res.locals;
    const { user_id } = req.query;

    try {
      const queryFilter = assignDefined({}, { user_id });
      const authFilter = { user_id: authorized_user_id };
      const filter = {
        $and: [ queryFilter, authFilter ]
      };

      const users = await User.find(filter, { password: 0 });
      if (!users || users.length === 0) throw new ApiError(404, "resource_not_found");

      res.status(200).json(users);
    }
    catch (err) {
      next(err);
    }
  }
);


/**
 * @openapi
 * /user:
 *   post:
 *     description: Create a new user
 *     security:
 *       - basic: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/User"
 *     responses:
 *       "201":
 *         description: Successfully created user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
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
router.post("/",
  validator(schemas.post),
  authorizer(client_basic),
  async (req, res, next) => {
    const { email, password, name } = req.body;

    try {
      // Create the new user document
      const user = new User({ email, password, name });
      await user.save();

      const { password: _, ...response } = user.toObject();

      res.status(201).json(response);
    }
    catch (err) {
      next(err);
    }
  }
);


/**
 * @openapi
 * /user:
 *   patch:
 *     description: Modify an existing user
 *     security:
 *       - basic: []
 *       - oauth2: []
 *     parameters:
 *       - name: user_id
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
 *         description: Successfully modified user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
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
router.patch("/:user_id",
  validator(schemas.patch),
  authorizer([basic, access_token], "user:update"),
  async (req, res, next) => {
    const { authorized_user_id } = res.locals;
    const { user_id } = req.params;

    try {
      const queryFilter = { user_id };
      const authFilter = { user_id: authorized_user_id };
      const filter = {
        $and: [ queryFilter, authFilter ]
      };

      let user = await User.findOne(filter);
      if (!user) throw new ApiError(404, "resource_not_found", "User could not be found");

      try {
        if (req.is("application/json-patch+json")) jsonPatch.apply(user, req.body);
        if (req.is("application/merge-patch+json")) user = mergePatch.apply(user, req.body);
      }
      catch (err) {
        throw new ApiError(400, "invalid_request", err.message);
      }

      await User.replaceOne(filter, user);

      const { password: _, ...response } = user.toObject();

      res.status(201).json(response);
    }
    catch (err) {
      next(err);
    }
  }
);


/**
 * @openapi
 * /user:
 *   delete:
 *     description: Delete a user
 *     security:
 *       - basic: []
 *       - oauth2: []
 *     parameters:
 *       - name: user_id
 *         in: path
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       "201":
 *         description: Successfully deleted user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: string
 *                   description: The user_id of the deleted user
 *               required:
 *                 - user_id
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
router.delete("/:user_id",
  validator(schemas.delete),
  authorizer([basic, access_token], "user:delete"),
  async (req, res, next) => {
    const { authorized_user_id } = res.locals;
    const { user_id } = req.params;

    try {
      const queryFilter = { user_id };
      const authFilter = { user_id: authorized_user_id };
      const filter = {
        $and: [ queryFilter, authFilter ]
      };

      const { deletedCount } = await User.deleteOne(filter);
      if (deletedCount === 0) throw new ApiError(404, "resource_not_found");

      res.status(201).json({ user_id });
    }
    catch (err) {
      next(err);
    }
  }
);


router.use("/verify", verify);


export default router;
