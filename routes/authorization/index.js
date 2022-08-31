const express = require("express"),
      router = express.Router();

// Setup body parser for POST requests
router.use(express.urlencoded({extended: false}));

router.use("/user", require("./user"));

router.use("/client", require("./client"));

module.exports = router;