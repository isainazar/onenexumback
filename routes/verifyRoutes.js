var express = require("express");
const { verifyToken } = require("../controller/verifyTokenController");
var router = express.Router();

router.post("/", verifyToken);

module.exports = router;
