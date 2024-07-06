const tierService = require("../services/tier-service");
const tryCatch = require("../utils/try-catch-wrapper");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const stripeController = {};

stripeController.createIntent = tryCatch(async (req, res) => {
  const { tierId } = req.params;
  const tierData = await tierService.getTierById(+tierId);

  const paymentIntent = await stripe.paymentIntents.create({
    currency: "THB",
    amount: tierData.price * 100,
    automatic_payment_methods: { enabled: true },
  });

  res.status(200).send({
    clientSecret: paymentIntent.client_secret,
  });
});

module.exports = stripeController;
