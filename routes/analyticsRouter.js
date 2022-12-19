var express = require("express");
var router = express.Router();
const auth = require("../utilities/auth");

// Controllers
const { runReport,getAvg } = require("../controller/analyticsController");

router.post("/", runReport);
router.post("/promedio", getAvg);
module.exports = router;
