require("dotenv").config();
const morgan = require("morgan");
const express = require("express");
const cors = require("cors");
const { ToadScheduler } = require("toad-scheduler");
const notFoundMiddleware = require("./src/middlewares/not-found");
const errorMiddleware = require("./src/middlewares/error");
const authRouter = require("./src/routes/auth-route");
const creatorRouter = require("./src/routes/creator-route");
const authenticate = require("./src/middlewares/authenticate");
const productRouter = require("./src/routes/product-route");
const adminAuthenticate = require("./src/middlewares/admin-authenticate");
const adminRouter = require("./src/routes/admin-route");
const creatorAuthenticate = require("./src/middlewares/creator-authenticate");
const commentRouter = require("./src/routes/comment-route");
const milestoneRouter = require("./src/routes/milestone-route");
const supportProductRouter = require("./src/routes/support-product-route");
const historyRouter = require("./src/routes/history-route");
const statRouter = require("./src/routes/stat-route");
const stripeRouter = require("./src/routes/stripe-route");
const tierRouter = require("./src/routes/tier-route");
const { IMAGE_DIR } = require("./src/constants");
const { checkDeadlineJob } = require("./src/utils/toad-job");
const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.static(process.env.STATIC_DIR));
app.use(express.static(IMAGE_DIR));

app.use("/stripe", stripeRouter);
app.use("/auth", authRouter);
app.use("/admin", authenticate, adminAuthenticate, adminRouter);
app.use("/creators", creatorRouter);
app.use("/products", productRouter);
app.use("/comments", commentRouter);
app.use("/milestones", authenticate, creatorAuthenticate, milestoneRouter);
app.use("/tiers", authenticate, creatorAuthenticate, tierRouter);
app.use("/support-products", authenticate, supportProductRouter);
app.use("/histories", authenticate, historyRouter);
app.use("/stats", statRouter);

const scheduler = new ToadScheduler();
scheduler.addSimpleIntervalJob(checkDeadlineJob);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server is running on port : ${PORT}`));

scheduler.stop();
