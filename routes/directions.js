const { GoogleDirections } = require("../Google");

const express = require("express"),
      router = express.Router(),
      sanitize = require("sanitize")();

/**
 * @openapi
 * /directions:
 *   get:
 *     description: Gets directions for a given set of stops
 *     parameters:
 *       - name: stops
 *         in: query
 *         required: true
 *         description: Stops along the route separated by a "|" character. Use a Google place_id when available. Other accepted formats are an address or coordinates. These stops will be reordered to optimize the route. To specify a start or end point, add the prefix "start:" or "end:" before the stop
 *         schema:
 *           type: string
 *           example: start:1676 40th Street,Calgary,AB|3368 Heritage Drive,Calgary,AB|235 Heritage Drive,Calgary,AB|1956 Fourth Avenue,Calgary,AB|end:785 7th Ave,Calgary,AB
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
  const { stops, ...otherQueries } = req.query;
  if (typeof stops !== "string") return res.status(400).json({code: "invalid_request", message: "Invalid Request"});
  let googleMaps = new GoogleDirections();
  try {
    let directions = await googleMaps.directions(stops, otherQueries);
    return res.status(200).json(directions);
  } catch (err) {
    if (err.message === "Too Few Stops") return res.status(400).json({code: "invalid_request", message: "Too Few Stops"});
    return res.status(500).json({"message": err.message});
  }
});

module.exports = router;