
import express from "express";
import docs from "./docs.js";
import authcode from "./authcode.js";
import authorize from "./authorize.js";
import token from "./token.js";
import user from "./user/index.js";
import client from "./client.js";

const router = express.Router();


// Automatically generated documentation
router.use("/docs", docs);

// Api routes
router.use("/authcode", authcode);

router.use("/authorize", authorize);

router.use("/token", token);

router.use("/user", user);

router.use("/client", client);


export default router;
