var express = require("express");
const {
  verifyToken,
  verifyStatus,
} = require("../controller/verifyTokenController");
var router = express.Router();

router.post("/", verifyToken);
router.post("/status&tyc", verifyStatus);

module.exports = router;
