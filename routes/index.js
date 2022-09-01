const express = require("express"),
      router = express.Router();

router.use(require("../middleware/auth")); // Authentication

router.use("/directions", require("./directions"));

module.exports = router;