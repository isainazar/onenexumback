const Stripe = require("stripe");
const KEY_PRIVATE_STRIPE = process.env.KEY_PRIVATE_STRIPE;
const PRICE_ID = process.env.PRICE_ID;
const URL = process.env.URL;

const { User } = require("../DataBase/index");
const stripe = new Stripe(KEY_PRIVATE_STRIPE);

const paymentStripe = async (req, res) => {
  const { id_user } = req.body;
  if (!id_user) {
    return res.status(500).json({ message: "field required" });
  }
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: PRICE_ID,
        quantity: 1,
      },
    ],
    metadata: {
      id_user: id_user,
    },
    mode: "payment",
    success_url: `${URL}/login`,
    cancel_url: `${URL}/landing`,
  });
  console.log(session);
  return res.json({ url: session.url, idPayment: session.id });
};
const getPayment = async (req, res) => {
  const { idPayment } = req.body;
  if (!idPayment) {
    return res.status(500).json({ message: "field required" });
  }
  const session = await stripe.checkout.sessions.retrieve(idPayment);
  console.log(session);
  return res.status(200).json(session);
};
module.exports = {
  paymentStripe,
  getPayment,
};
