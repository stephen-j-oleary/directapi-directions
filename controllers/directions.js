
import validate from "../utils/validate.js";
import directions from "../services/directions/index.js";

import requestSchema from "../schemas/directions/request.js";
import _ from "lodash";

export const validator = validate({ query: requestSchema })

/**
 * @openapi
 * /directions:
 *   get:
 *     description: Gets directions for a given set of stops
 *     parameters:
 *       - name: stops
 *         in: query
 *         required: true
 *         description: A string of pipe(|) separated stops. Different modifiers can be added before the address separated by a colon(:). Accepted stop formats are an address or coordinates.
 *         schema:
 *           type: string
 *           example: origin:1676 40th Street, Calgary, AB|3368 Heritage Drive, Calgary, AB|235 Heritage Drive, Calgary, AB|1956 Fourth Avenue, Calgary, AB|destination:785 7th Ave, Calgary, AB
 *     responses:
 *       "200":
 *         description: Successfully returned a route
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/DirectionsResult"
 *       "400":
 *         description: Invalid Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/GeneralError"
 *       "401":
 *         description: Invalid Authentication
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/GeneralError"
 *       "403":
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/GeneralError"
 *       "500":
 *         description: Internal Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/GeneralError"
 */
export const controller = (req, res, next) => {
  return directions(req)
    .then(dir => res.status(200).json(dir))
    .catch(next);
}

export default {
  validator,

  controller
}
