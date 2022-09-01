const Directions = require("../Directions.js");

const express = require("express"),
      router = express.Router();

/**
 * @openapi
 * /directions:
 *   get:
 *     description: Gets directions for a given set of stops
 *     parameters:
 *       - name: stops
 *         in: query
 *         required: true
 *         description: A string of pipe(|) separated stops. Different modifiers can be added before the address separated by a colon(:). Use a Google place_id when available. Other accepted formats are an address or coordinates.
 *         schema:
 *           type: string
 *           example: start:1676 40th Street, Calgary, AB|3368 Heritage Drive, Calgary, AB|235 Heritage Drive, Calgary, AB|1956 Fourth Avenue, Calgary, AB|end:785 7th Ave, Calgary, AB
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
router.get("/", async (req, res) => {
  const { stops } = req.query;

  if (typeof stops !== "string") return res.status(400).json({ code: "invalid_request", message: "Invalid request" });

  const directions = new Directions();

  try {
    directions.setStops(Directions.parseStops(stops));
    await directions.calculate();
    return res.status(200).json(directions.response);
  }
  catch (err) {
    if (err.message === "Too few stops") return res.status(400).json({ code: "invalid_request", message: "Too Few Stops" });
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;