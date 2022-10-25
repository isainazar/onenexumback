const Stripe = require("stripe");
const KEY_PRIVATE_STRIPE = process.env.KEY_PRIVATE_STRIPE;
const PRICE_ID = process.env.PRICE_ID;

const { User } = require("../DataBase/index");
const stripe = new Stripe(KEY_PRIVATE_STRIPE);

const paymentStripe = async (req, res) => {
  /* const { id_user } = req.session;
  const { idPayment } = req.body;
  console.log(req.session);
  if (id_user) {
    if (idPayment) {
      try {
        const payment = await stripe.paymentIntents.create({
          type: "card",
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
            req.session.status = true;

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
          message: "An error has occurred",
          status: "400",
        });
      }
    } else {
      res.status(404).json({ message: "Error Required Field not Found" });
    }
  } else {
    res.sendStatus(403);
  } */
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: PRICE_ID,
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `http://localhost:3002/login`,
    cancel_url: `http://localhost:3002/quizz`,
  });
  console.log(session);
  return res.redirect(303, session.url);
};

module.exports = {
  paymentStripe,
};
