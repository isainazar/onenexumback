const Stripe = require("stripe");
const KEY_PRIVATE_STRIPE = process.env.KEY_PRIVATE_STRIPE;
const { User } = require("../DataBase/index");
const stripe = new Stripe(KEY_PRIVATE_STRIPE);

const paymentStripe = async (req, res) => {
  const { id_user } = req.session;
  const { idPayment } = req.body;

  if (id_user) {
    if (idPayment) {
      try {
        const payment = await stripe.paymentIntents.create({
          amount: 1,
          currency: "USD",
          description: "Pack payment",
          payment_method: idPayment,
          confirm: true,
        });
        if (payment.status === "succeeded") {
          const newUser = await User.update(
            {
              status: true,
            },
            {
              where: {
                id_user: id_user,
              },
            }
          );
          if (newUser) {
            res.send({
              title: "success",
              message: "Successful payments",
              status: "200",
            });
          } else {
            res.send({
              title: "Error!",
              message: "Payment not Created",
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
