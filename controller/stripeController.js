const Stripe = require("stripe");
const KEY_PRIVATE_STRIPE = process.env.KEY_PRIVATE_STRIPE;
const PRICE_ID = process.env.PRICE_ID;
const URL = process.env.URL;

const { User } = require("../DataBase/index");
const stripe = new Stripe(KEY_PRIVATE_STRIPE);

const paymentStripe = async (req, res) => {
  console.log(stripe);
  const { id_user } = req.body;
  if (!id_user) {
    return res.status(500).json({ message: "field required" });
  }
  const userr = await User.findByPk(id_user);
  if (!userr) {
    return res.status(400).json({ message: "Este usuario no existe" });
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
  if (!session) {
    return res.status(404).json({ message: "Error al crear pago" });
  }
  const usuarioPago = await User.update(
    {
      idPayment: session.id,
    },
    {
      where: {
        id_user: id_user,
      },
    }
  );
  if (!usuarioPago) {
    return res
      .status(500)
      .json({ message: "El usuareio no se pudo actualizar con exito" });
  }
  return res.json({ url: session.url });
};
const getPayments = async (req, res) => {
  const transfers = await stripe.paymentIntents.list();
  console.log(transfers.data);
  return res.status(200).json(transfers);
};
module.exports = {
  paymentStripe,
  getPayments,
};
