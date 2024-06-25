const express = require("express");
const supporterAuthenticate = require("../middlewares/supporter-authenticate");

const supportProductRouter = express.Router();

supportProductRouter.post("/tier/:tierId", supporterAuthenticate, () => {});

module.exports = supportProductRouter;
