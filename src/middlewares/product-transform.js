const productTransform = (req, res, next) => {
  const data = req.body;
  console.log("data", data);
  if (data.goal) {
    data.goal = +data.goal;
  }
  if (data.milestoneDetailList && typeof data.milestoneDetailList === "string") {
    data.milestoneDetailList = JSON.parse(data.milestoneDetailList);
  }
  if (data.categoryId) {
    data.categoryId = +data.categoryId;
  }
  if (data.tierDetailList && typeof data.tierDetailList === "string") {
    data.tierDetailList = JSON.parse(data.tierDetailList);
  }
  console.log("Data 2 ", data);
  req.body = data;
  next();
};

module.exports = productTransform;
