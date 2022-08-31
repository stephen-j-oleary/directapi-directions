
import express from "express";

import ApiError from "../../../helpers/ApiError.mjs";
import User from "../../schemas/User.js";
import schemas from "../../schemas/requests/user/verify.js";

// Middleware
import authorizer, { client_basic } from "../../middleware/authorizer.js";
import validator from "../../middleware/validator.js";

const router = express.Router();


/**
 * @openapi
 * /user/verify:
 *   post:
 *     description: Verifies a user's login credentials
 *     security:
 *       - basic: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               scope:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       "201":
 *         description: User credentials are valid
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
 *       "500":
 *         description: Server error
 *         $ref: "#/components/responses/ApiError"
 */
router.post("/",
  validator(schemas.post),
  authorizer(client_basic),
  async (req, res, next) => {
    // Request parameters
    const { email, password, scope } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user || !user.comparePassword(password)) throw new ApiError(401, "access_denied", "Invalid user credentials");

      if (scope && !user.hasScope(scope)) throw new ApiError(401, "access_denied", "Scope not authorized");

      const { password: _, ...response } = user.toObject();

      return res.status(201).send(response);
    }
    catch (err) {
      next(err);
    }
  }
);


export default router;
