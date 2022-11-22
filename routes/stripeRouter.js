const { Router } = require("express");
const auth = require("../utilities/auth");

const {
  paymentStripe,
  getPayments,
} = require("../controller/stripeController");

const router = Router();

router.post("/", auth, paymentStripe);
router.get("/get", auth, getPayments);

module.exports = router;
