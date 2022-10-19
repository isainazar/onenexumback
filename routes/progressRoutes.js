var express = require("express");
var router = express.Router();

const auth = require("../utilities/auth");

// Controllers
const {
  progress5,
  progress7,
  progress10,
} = require("../controller/progressController");

router.put("/5%", auth, progress5);
router.put("/7%", auth, progress7);
router.put("/10%", auth, progress10);

module.exports = router;
