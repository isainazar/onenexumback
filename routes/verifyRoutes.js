var express = require("express");
const {
  verifyToken,
  verifyStatus,
} = require("../controller/verifyTokenController");
var router = express.Router();

router.post("/", verifyToken);
router.post("/", verifyStatus);

module.exports = router;
