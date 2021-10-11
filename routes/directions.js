const GoogleMaps = require("../Google");

const express = require("express"),
      router = express.Router();

/**
 * @openapi
 * /directions:
 *   get:
 *     description: Gets directions for a given set of stops
 *     parameters:
 *       - name: start
 *         in: query
 *         required: true
 *         description: Start location for the route. Use a Google place_id when available. Other accepted formats are an address or coordinates. This stop will not be reordered when optimizing the route.
 *         schema:
 *           type: string
 *           example: 1676 40th Street,Calgary,AB
 *       - name: end
 *         in: query
 *         required: true
 *         description: End location for the route. Use a Google place_id when available. Other accepted formats are an address or coordinates. This stop will not be reordered when optimizing the route.
 *         schema:
 *           type: string
 *           example: 785 7th Ave,Calgary,AB
 *       - name: stops
 *         in: query
 *         required: false
 *         description: Stops along the route separated by a "|" character. Use a Google place_id when available. Other accepted formats are an address or coordinates. These stops will be reordered to optimize the route.
 *         schema:
 *           type: string
 *           example: 3368 Heritage Drive,Calgary,AB|235 Heritage Drive,Calgary,AB|1956 Fourth Avenue,Calgary,AB
 *     responses:
 *       '200':
 *         description: Successfully returned a route
 *         content: 
 *           application/json:
 *             schema:
 *               type: array
 *               items: 
 *                 $ref: "#/components/schemas/DirectionsResult"
 *       '400':
 *         description: Invalid Request
 *         content: 
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/GeneralError"
 *       '401':
 *         description: Invalid Authentication
 *         content: 
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/GeneralError"
 *       '403':
 *         description: Forbidden
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
router.get("/", async (req, res) => {
  const { start, end, ...otherQueries } = req.query;
  if (typeof start !== "string" || typeof end !== "string") return res.status(400).send({"message": "INVALID_REQUEST"});
  let googleMaps = new GoogleMaps();
  let directions;
  try {
    directions = await googleMaps.directions(start, end, otherQueries);
  } catch (err) {
    console.error(err);
    return res.status(500).send({"message": err.message});
  }
  res.status(200).json(directions);
});

module.exports = router;