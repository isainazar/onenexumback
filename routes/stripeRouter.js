const { Router } = require("express");
const auth = require("../utilities/auth");

const { paymentStripe, getPayment } = require("../controller/stripeController");

const router = Router();

router.post("/", auth, paymentStripe);
router.get("/get", auth, getPayment);

module.exports = router;
