
export class AuthError extends Error {
  constructor(code, message, data) {
    super(message);
    this.code = code;
    this.data = data;
  }
}

export default (req, _, next) => {
  if (process.env.NODE_ENV === "dev") return next();

  const proxySecret = req.header("X-RapidAPI-Proxy-Secret");

  return (proxySecret && proxySecret === process.env.RAPIDAPI_PROXY_SECRET)
    ? next()
    : next(new AuthError("invalid_client", "Requests must come from the RapidAPI server"));
}
