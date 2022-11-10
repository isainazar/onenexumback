const { Router } = require("express");
const { postDaily, dailyProgress } = require("../controller/dailyController");
const auth = require("../utilities/auth");

const router = Router();

router.post("/", postDaily);
router.get("/dailyProgress", auth, dailyProgress);

module.exports = router;
