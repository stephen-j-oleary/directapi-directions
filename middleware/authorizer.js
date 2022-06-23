
import * as flows from "./authFlows.js";

/**
 * Checks different authorization types and sends the authorized user_id and/or client_id in res.locals
 * @param {string | string[]} supportedFlows The supported authorization flows
 * @param {string} scope The required scope
 * @returns {function} express middleware function
 */
const authorizer = (supportedFlows, scope = "") => async (req, res, next) => {
  try {
    const { user_id, client_id } = await Promise.any(
      (typeof supportedFlows === "string")
        ? flows[supportedFlows](req, scope)
        : supportedFlows.map(name => flows[name](req, scope))
    );

    res.locals.authorized_user_id = user_id;
    res.locals.authorized_client_id = client_id;

    return next();
  }
  catch (err) {
    res.status(401).json({ error: "unauthorized" });
  }
}


export default authorizer;
