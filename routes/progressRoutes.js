var express = require("express");
var router = express.Router();

const auth = require("../utilities/auth");

// Controllers
const { progress } = require("../controller/progressController");

router.put("/", progress);

module.exports = router;
