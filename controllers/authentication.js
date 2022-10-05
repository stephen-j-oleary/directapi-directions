
export default (req, res, next) => {
  const proxySecret = req.header("X-RapidAPI-Proxy-Secret");

  return (proxySecret && proxySecret === process.env.RAPIDAPI_PROXY_SECRET)
    ? next()
    : res.status(401).json({ code: "invalid_client", message: "Requests must come from the RapidAPI server" })
}
