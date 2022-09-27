const { Router } = require("express");
const { postDaily } = require("../controller/dailyController");
const router = Router();

router.post("/", postDaily);

module.exports = router;
