const Stripe = require("stripe");
const KEY_PRIVATE_STRIPE = process.env.KEY_PRIVATE_STRIPE;
const { User } = require("../DataBase/index");
const stripe = new Stripe(KEY_PRIVATE_STRIPE);

const paymentStripe = async (req, res) => {
  const userID = req.user.id;
  const {
    name,
    lastname,
    password,
    date_birth,
    email,
    country,
    region,
    gender,
    user_type,
    idPayment,
  } = req.body;

  if (userID) {
    if (
      (name,
      lastname &&
        password &&
        date_birth &&
        email &&
        country &&
        region &&
        gender &&
        user_type &&
        idPayment)
    ) {
      try {
        const payment = await stripe.paymentIntents.create({
          amount: 14,
          currency: "USD",
          description: "Pack payment",
          payment_method: idPayment,
          confirm: true,
        });
        if (payment.status === "succeeded") {
          const newUser = await User.create({
            id_user: userID,
            name,
            lastname,
            password,
            date_birth,
            email,
            country,
            region,
            gender,
            user_type,
          });
          if (newUser) {
            res.send({
              title: "success",
              message: "Successful payments",
              status: "200",
            });
          } else {
            res.send({
              title: "Error!",
              message: "Rental not Created",
              status: "500",
            });
          }
        }
      } catch (error) {
        res.send({
          title: "Error!",
          message:
            error.payment_intent.last_payment_error.message ||
            "An error has occurred",
          status: "400",
        });
      }
    } else {
      res.status(404).json({ message: "Error Required Field not Found" });
    }
  } else {
    res.sendStatus(403);
  }
};

module.exports = {
  paymentStripe,
};
