const express = require("express"),
      router = express.Router();

// Setup body parser for POST requests
router.use(express.urlencoded({extended: false}));

router.use("/login", require("./login"));

router.use("/auth-code", require("./auth-code"));

router.use("/authorize", require("./authorize"));

router.use("/token", require("./token"));

router.use("/user", require("./user"));

router.use("/client", require("./client"));

module.exports = router;