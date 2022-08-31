const express = require("express"),
      router = express.Router();

router.use("/docs", require("./docs")); // Automatically generated documentation

router.use("/", require("./authorization")); // Authorization server

router.use(require("../middleware/auth")); // Authentication

router.use("/directions", require("./directions"));

module.exports = router;