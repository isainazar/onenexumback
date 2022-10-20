const { Router } = require("express");
const auth = require("../utilities/auth");

const { paymentStripe } = require("../controller/stripeController");

const router = Router();

router.post("/", auth, paymentStripe);

module.exports = router;
