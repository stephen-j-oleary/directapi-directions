/**
 * @typedef {Object} SearchResult
 * @property {string} placeId - A unique identifier for the returned prediction
 * @property {string} description.required - The human-readable name for the returned result
 * @property {string} mainText.required - Contains the main text of a prediction, usually the name of the place
 * @property {string} secondaryText - Contains the secondary text of a prediction, usually the location of the place
 */

const Microsoft = require("../Microsoft");

const express = require("express"),
      router = express.Router(),
      catcher = require("../catcher"),
      { GoogleSearch } = require("../Google");

/**
 * @openapi
 * /search: 
 *   get:
 *     description: Returns search results for a query
 *     parameters:
 *       - name: query
 *         in: query
 *         required: true
 *         description: Query to search for
 *         schema:
 *           type: string
 *           example: Calgary
 *       - name: session
 *         in: header
 *         required: false
 *         description: Session tokens to be used for the request
 *         schema:
 *           $ref: "#/components/schemas/SessionResource"
 *     responses: 
 *       '200': 
 *         description: Successfully returned a search result
 *         headers:
 *           session:
 *             description: The session tokens used for the request
 *             required: false
 *             schema:
 *               $ref: "#/components/schemas/SessionResource"
 *         content: 
 *           application/json:
 *             schema:
 *               type: array
 *               items: 
 *                 $ref: "#/components/schemas/SearchResult"
 *       '400':
 *         description: Invalid request
 *         content: 
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/GeneralError"
 *       '401':
 *         description: Not Authorized
 *         content: 
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/GeneralError"
 */
router.get("/", async (req, res) => {
  const { query } = req.query;
  if (typeof query !== "string") return res.status(400).send({"message": "Invalid Request"});
  const googleSessionToken = req.headers.google_session_token,
        microsoftSessionExpires = req.headers.microsoft_session_expires,
        microsoftSessionAccessToken = req.headers.microsoft_session_access_token,
        microsoftSessionRefreshToken = req.headers.microsoft_session_refresh_token;
  let googleMaps = new GoogleSearch(googleSessionToken);
  let microsoft = new Microsoft({expires: microsoftSessionExpires, accessToken: microsoftSessionAccessToken, refreshToken: microsoftSessionRefreshToken});
  let googleSuggestions = await catcher(googleMaps.autocomplete(query), []);
  let microsoftSuggestions = await catcher(microsoft.autocomplete(query), []);
  if (googleSessionToken) res.set("google_session_token", req.headers.google_session_token);
  if (microsoftSessionExpires) res.set("microsoft_session_expires", req.headers.microsoft_session_expires);
  if (microsoftSessionAccessToken) res.set("microsoft_session_access_token", req.headers.microsoft_session_access_token);
  if (microsoftSessionRefreshToken) res.set("microsoft_session_refresh_token", req.headers.microsoft_session_refresh_token);
  res.status(200).json([...microsoftSuggestions, ...googleSuggestions]);
});

module.exports = router;