const { Router } = require("express");
const {
  postDaily,
  dailyProgress,
  dailyTotal,
  getDailyConfirm
} = require("../controller/dailyController");
const auth = require("../utilities/auth");

const router = Router();

router.post("/", postDaily);
router.get("/:user", getDailyConfirm);
router.get("/dailyProgress", auth, dailyProgress);
router.get("/dailyHistoric", auth, dailyTotal);

module.exports = router;
