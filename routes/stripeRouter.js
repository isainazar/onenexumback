const { Router } = require("express");
const auth = require("../utilities/auth");

const { paymentStripe } = require("../controller/stripeController");

const router = Router();

router.post("/paymentStripe", auth, paymentStripe);

module.exports = router;
