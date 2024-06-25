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
const supportProductRouter = require("./routes/support-product-route");

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
app.use("/support-products", authenticate, supportProductRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server is running on port : ${PORT}`));
