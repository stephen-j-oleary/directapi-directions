
import authFlows from "./authFlows.js";

export default (scope, supportedFlows = []) => (
  async (req, res, next) => {
    try {
      const flows = supportedFlows.map(name => {
        return authFlows[name](req, scope);
      });

      const { user_id, client_id } = await Promise.any(flows);

      res.locals.authorized_user_id = user_id;
      res.locals.authorized_client_id = client_id;

      next();
    }
    catch (err) {
      res.status(401).json({ error: "unauthorized" });
    }
  }
);
