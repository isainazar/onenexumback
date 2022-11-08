var express = require("express");
var router = express.Router();
const auth = require("../utilities/auth");

// Controllers
const { runReport } = require("../controller/analyticsController");

router.get("/", runReport);
module.exports = router;
