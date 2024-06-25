require("dotenv").config();
const morgan = require("morgan");
const express = require("express");
const cors = require("cors");
const notFoundMiddleware = require("./middlewares/not-found");
const errorMiddleware = require("./middlewares/error");
const authRouter = require("./routes/auth-route");
const creatorRouter = require("./routes/creator-route");
const authenticate = require("./middlewares/authenticate");
const productRouter = require("./routes/product-route");
const adminAuthenticate = require("./middlewares/admin-authenticate");
const adminRouter = require("./routes/admin-route");
const creatorAuthenticate = require("./middlewares/creator-authenticate");
const commentRouter = require("./routes/comment-route");
const milestoneRouter = require("./routes/milestone-route");
;

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());



app.use("/auth", authRouter);
app.use("/admin", authenticate, adminAuthenticate, adminRouter);
app.use("/creators", authenticate, creatorAuthenticate, creatorRouter);
app.use("/products", authenticate, productRouter);
app.use("/comments", authenticate, commentRouter);
app.use("/milestones", authenticate, creatorAuthenticate, milestoneRouter);


// feature/payment   ///////////////////////

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2022-08-01",
});

app.use(express.static(process.env.STATIC_DIR));


app.get("/config", (req, res) => {
    res.send({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
});

app.post("/create-payment-intent", async (req, res) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            currency: "EUR",
            amount: 1999,
            automatic_payment_methods: { enabled: true },
        });

        // Send publishable key and PaymentIntent details to client
        res.send({
            clientSecret: paymentIntent.client_secret
        });
    } catch (e) {
        return res.status(400).send({
            error: {
                message: e.message,
            },
        });
    }
});

///////////////////////////////////


app.use(notFoundMiddleware);
app.use(errorMiddleware);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server is running on port : ${PORT}`));
