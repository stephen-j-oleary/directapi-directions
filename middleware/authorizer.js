
/**
 * Checks different authorization types and sends the authorized user_id and/or client_id in res.locals
 * @param {function | function[]} flows The supported authorization flows
 * @param {string} scope The required scope
 * @returns {function} express middleware function
 */
const authorizer = (flows, scope = "") => async (req, res, next) => {
  try {
    const { user_id, client_id } = await Promise.any(
      (typeof flows === "function")
        ? [flows(req, scope)]
        : flows.map(flow => flow(req, scope))
    );

    res.locals.authorized_user_id = user_id;
    res.locals.authorized_client_id = client_id;

    return next();
  }
  catch (err) {
    res.status(401).json({ error: "unauthorized", error_message: err.message });
  }
}


export * from "./authFlows.js";
export default authorizer;
