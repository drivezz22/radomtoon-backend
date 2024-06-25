const express = require("express");
const stripeController = require("../controllers/stripe-controller");

const stripeRouter = express.Router();

stripeRouter.get("/config", (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

stripeRouter.post("/create-payment-intent/tier/:tierId", stripeController.createIntent);

module.exports = stripeRouter;
