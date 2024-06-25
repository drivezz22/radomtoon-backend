const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const stripeRouter = express.Router();

stripeRouter.get("/config", (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

stripeRouter.post("/create-payment-intent", async (req, res, next) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "THB",
      amount: req.body.price || 2000,
      automatic_payment_methods: { enabled: true },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = stripeRouter;
