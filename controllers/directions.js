
import validate from "../utils/validate.js";
import getDirections from "../services/google/getDirections.js";
import Stops from "../services/Stops.js";
import getRequestSchema from "../schemas/getDirectionsRequest.json" assert { type: "json" };
import flowAsync from "../utils/flowAsync.js";
import _ from "lodash";

export const getDirectionsValidator = validate({ query: getRequestSchema });

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
export const getDirectionsController = (req, res, next) => {
  const pipeline = flowAsync(
    query => _.update(query, "stops", stops => new Stops(stops)),
    getDirections,
    directions => res.status(200).json(directions)
  );

  return pipeline(req.query).catch(next);
};

export default {
  getValidator: getDirectionsValidator,
  getController: getDirectionsController
}
