const productService = require("../services/product-service");
const supportProductService = require("../services/support-product-service");
const webProfitService = require("../services/web-profit-service");
const createError = require("../utils/create-error");
const tryCatch = require("../utils/try-catch-wrapper");
const dayjs = require("dayjs");
const { MONTH_NAME_MAP, PRODUCT_STATUS_ID } = require("../constants");

const statController = {};

const getCommonStats = async () => {
  const successProjects = await productService.getAllProject();
  const supportProjects = await supportProductService.getSupport();

  return {
    totalProjectCount: successProjects.length,
    totalFunding: successProjects.reduce((acc, { totalFund }) => acc + totalFund, 0),
    totalContributions: supportProjects.length,
  };
};

const getDateRange = (year) => ({
  startDate: new Date(`${year}-01-01`),
  endDate: new Date(`${year}-12-31`),
});

const getFilteredProductsByMonth = async (startDate, endDate) => {
  const allProducts = await productService.getAllSuccessProjectFilterByStartEndDate(
    startDate,
    endDate
  );
  return allProducts.map((el) => ({
    productName: el.productName,
    totalFund: el.totalFund,
    totalSupporter: el.supportProducts.length,
    month: dayjs(el.deadline).format("MMM"),
  }));
};

const getCumulativeFundsByMonth = (allSupportProducts, filterMonth) => {
  let cumulativeFund = 0;
  return filterMonth.map((month) => {
    const totalFundMonth = allSupportProducts
      .filter((el) => el.month === month)
      .reduce((acc, item) => acc + item.fund, 0);
    cumulativeFund += totalFundMonth;
    return { month, cumulativeFund };
  });
};

const compareDesc = (key) => (a, b) => b[key] - a[key];

const getUniqueSupporters = (allSupportProduct) => {
  const uniqueSupporterSet = new Set();
  return allSupportProduct
    .map((supporter) => ({
      id: supporter.user.id,
      provinceId: supporter.user.provinceId,
    }))
    .filter((supporter) => {
      const key = `${supporter.id}-${supporter.provinceId}`;
      if (!uniqueSupporterSet.has(key)) {
        uniqueSupporterSet.add(key);
        return true;
      }
      return false;
    });
};

const countProvinces = (uniqueSupporters) => {
  return uniqueSupporters.reduce((acc, supporter) => {
    acc[supporter.provinceId] = (acc[supporter.provinceId] || 0) + 1;
    return acc;
  }, {});
};

statController.getAdminStat = tryCatch(async (req, res) => {
  const { totalProjectCount, totalFunding, totalContributions } = await getCommonStats();
  const webProfits = await webProfitService.getAllProfit();
  const totalWebProfit = webProfits.reduce(
    (acc, { totalProfit }) => acc + totalProfit,
    0
  );

  res.status(200).json({
    stat: {
      projectSupport: totalProjectCount,
      towardIdea: totalFunding,
      contribution: totalContributions,
      webProfit: totalWebProfit,
    },
  });
});

statController.getStatByProduct = tryCatch(async (req, res) => {
  const { productId } = req.params;
  const supportProjects = await supportProductService.getSupportByProductId(+productId);
  const product = await productService.findProductByCreatorIdAndProductId(
    req.user.id,
    +productId
  );

  if (!product) {
    throw createError({ message: "No product created by this creator", statusCode: 400 });
  }
  if (!product) {
    createError({
      message: "No product created by this creator",
      statusCode: 400,
    });
  }

  const stat = {
    supporter: supportProjects.length,
    totalFund: product.totalFund,
    availableFund: product.availableFund,
  };

  res.status(200).json({ stat });
});

statController.getStat = tryCatch(async (req, res) => {
  const { totalProjectCount, totalFunding, totalContributions } = await getCommonStats();

  res.status(200).json({
    stat: {
      projectSupport: totalProjectCount,
      towardIdea: totalFunding,
      contribution: totalContributions,
    },
  });
});

statController.getTopFiveCategories = tryCatch(async (req, res) => {
  const { startDate, endDate } = getDateRange(new Date().getFullYear());
  const products = await getFilteredProductsByMonth(startDate, endDate);

  const productDataAllMonth = MONTH_NAME_MAP.map((month) => {
    const filteredProducts = products.filter((el) => el.month === month);
    const topFiveByTotalFund = [...filteredProducts]
      .sort(compareDesc("totalFund"))
      .slice(0, 5);
    const topFiveByTotalSupporter = [...filteredProducts]
      .sort(compareDesc("totalSupporter"))
      .slice(0, 5);

    return { month, topFiveByTotalFund, topFiveByTotalSupporter };
  });

  res.status(200).json(productDataAllMonth);
});

statController.getTotalFundTrend = tryCatch(async (req, res) => {
  const today = new Date();
  const todayMonth = dayjs(today).format("MMM");
  const findIndexMonth = MONTH_NAME_MAP.findIndex((month) => month === todayMonth);
  const filterMonth = MONTH_NAME_MAP.slice(0, findIndexMonth + 1);

  const { startDate, endDate } = getDateRange(today.getFullYear());
  const allSupportProducts =
    await supportProductService.getAllSupporterProductFilterByStartEndDate(
      startDate,
      endDate
    );
  const mapSupportProduct = allSupportProducts.map((el) => ({
    month: dayjs(el.createdAt).format("MMM"),
    fund: el.tier.price,
  }));

  const cumulativeFundAllMonth = getCumulativeFundsByMonth(
    mapSupportProduct,
    filterMonth
  );

  res.status(200).json({ cumulativeFundAllMonth });
});

statController.getCreatorActive = tryCatch(async (req, res) => {
  const today = new Date();
  const todayMonth = dayjs(today).format("MMM");
  const monthIndex = MONTH_NAME_MAP.findIndex((month) => month === todayMonth);

  const { startDate, endDate } = getDateRange(today.getFullYear());
  const allProducts = await productService.getAllProjectFilterByStartEndDate(
    startDate,
    endDate
  );
  const mapCreatorData = allProducts.map((el) => ({
    creatorId: el.creatorId,
    month: dayjs(el.updatedAt).format("MMM"),
  }));

  const currentMonthData = mapCreatorData.filter(
    (el) => el.month === MONTH_NAME_MAP[monthIndex]
  );
  const currentMonthCount = new Set(currentMonthData.map((el) => el.creatorId)).size;

  const lastMonthCount =
    monthIndex > 0
      ? new Set(
          mapCreatorData
            .filter((el) => el.month === MONTH_NAME_MAP[monthIndex - 1])
            .map((el) => el.creatorId)
        ).size
      : 0;

  res.status(200).json({
    currentMonthCreatorActive: {
      month: todayMonth,
      count: currentMonthCount,
    },
    lastMonthCreatorActive: {
      month: monthIndex > 0 ? MONTH_NAME_MAP[monthIndex - 1] : null,
      count: lastMonthCount,
    },
  });
});

statController.getSupporterActive = tryCatch(async (req, res) => {
  const today = new Date();
  const todayMonth = dayjs(today).format("MMM");
  const monthIndex = MONTH_NAME_MAP.findIndex((month) => month === todayMonth);

  const startDate = new Date(`${today.getFullYear()}-01-01`);
  const endDate = new Date(`${today.getFullYear()}-12-31`);
  const getAllSupporter =
    await supportProductService.getAllSupporterProductFilterByStartEndDate(
      startDate,
      endDate
    );

  const mapSupporterData = getAllSupporter.map((el) => ({
    supporterId: el.userId,
    month: dayjs(el.createdAt).format("MMM"),
  }));

  const supporterIdCurrentMonth = mapSupporterData
    .filter((el) => el.month === todayMonth)
    .map((el) => el.supporterId);

  const countSupporterCurrentMonth = new Set(supporterIdCurrentMonth).size;

  const countSupporterLastMonth =
    monthIndex > 0
      ? new Set(
          mapSupporterData
            .filter((el) => el.month === MONTH_NAME_MAP[monthIndex - 1])
            .map((el) => el.supporterId)
        ).size
      : 0;

  res.status(200).json({
    currentMonthCreatorActive: {
      month: todayMonth,
      count: countSupporterCurrentMonth,
    },
    lastMonthCreatorActive: {
      month: monthIndex > 0 ? MONTH_NAME_MAP[monthIndex - 1] : null,
      count: countSupporterLastMonth,
    },
  });
});

statController.getAverageFund = tryCatch(async (req, res) => {
  const today = new Date();
  const startDate = new Date(`${today.getFullYear()}-01-01`);
  const endDate = new Date(`${today.getFullYear()}-12-31`);
  const getAllSupportProduct =
    await supportProductService.getAllSupporterProductFilterByStartEndDate(
      startDate,
      endDate
    );

  const totalFund = getAllSupportProduct.reduce((acc, item) => acc + item.tier.price, 0);

  const averageFund =
    getAllSupportProduct.length > 0 ? totalFund / getAllSupportProduct.length : 0;
  res.status(200).json({ averageFund });
});

statController.getCountProject = tryCatch(async (req, res) => {
  const approvalProducts = await productService.getApprovalProduct();
  const statusCounts = approvalProducts.reduce((acc, { productStatusId }) => {
    acc[productStatusId] = (acc[productStatusId] || 0) + 1;
    return acc;
  }, {});

  res.status(200).json({
    totalProject: approvalProducts.length,
    pendingProject: statusCounts[PRODUCT_STATUS_ID.PENDING] || 0,
    successProject: statusCounts[PRODUCT_STATUS_ID.SUCCESS] || 0,
    failedProject: statusCounts[PRODUCT_STATUS_ID.FAILED] || 0,
  });
});

statController.getProductFundTrend = tryCatch(async (req, res) => {
  const { productId } = req.params;

  const existProduct = await productService.checkCreatorIdMatchProductId(
    req.user.id,
    +productId
  );

  if (!existProduct.length) {
    return res.status(200).json({ cumulativeFundAllMonth: [] });
  }

  const today = new Date();
  const todayMonth = dayjs(today).format("MMM");
  const findIndexMonth = MONTH_NAME_MAP.findIndex((month) => month === todayMonth);
  const filterMonth = [...MONTH_NAME_MAP].slice(0, findIndexMonth + 1);

  const { startDate, endDate } = getDateRange(today.getFullYear());

  const getAllSupportProduct =
    await supportProductService.getAllSupporterProductFilterByStartEndDateProductId(
      startDate,
      endDate,
      +productId
    );

  const mapSupportProduct = getAllSupportProduct.map((el) => ({
    month: dayjs(el.createdAt).format("MMM"),
    fund: el.tier.price,
  }));

  let cumulativeFund = 0;
  const cumulativeFundAllMonth = filterMonth.map((month) => {
    const totalFundMonth = mapSupportProduct
      .filter((el) => el.month === month)
      .reduce((acc, item) => acc + item.fund, 0);
    cumulativeFund += totalFundMonth;
    return { month, cumulativeFund };
  });

  res.status(200).json({ cumulativeFundAllMonth });
});

statController.getTierStat = tryCatch(async (req, res, next) => {
  const { productId } = req.params;

  const existProduct = await productService.checkCreatorIdMatchProductId(
    req.user.id,
    +productId
  );

  if (!existProduct.length) {
    return res.status(200).json({ combineTier: [] });
  }

  const today = new Date();
  const { startDate, endDate } = getDateRange(today.getFullYear());
  const allSupportProduct =
    await supportProductService.getAllSupporterProductFilterByStartEndDateProductId(
      startDate,
      endDate,
      +productId
    );

  const combineTier = allSupportProduct.reduce((acc, { tier: { tierName, price } }) => {
    acc[tierName] = (acc[tierName] || 0) + price;
    return acc;
  }, {});

  res.status(200).json({ combineTier });
});

statController.getMapDensityAllProduct = tryCatch(async (req, res, next) => {
  const today = new Date();
  const { startDate, endDate } = getDateRange(today.getFullYear());
  const allSupportProduct =
    await supportProductService.getAllSupporterProductFilterByStartEndDate(
      startDate,
      endDate
    );

  const uniqueSupporters = getUniqueSupporters(allSupportProduct);
  const provinceCount = countProvinces(uniqueSupporters);

  res.status(200).json({ provinceCount });
});

statController.getMapDensityByProduct = tryCatch(async (req, res, next) => {
  const { productId } = req.params;

  const existProduct = await productService.checkCreatorIdMatchProductId(
    req.user.id,
    +productId
  );

  if (!existProduct.length) {
    return res.status(200).json({ provinceCount: {} });
  }

  const today = new Date();
  const { startDate, endDate } = getDateRange(today.getFullYear());
  const allSupportProduct =
    await supportProductService.getAllSupporterProductFilterByStartEndDateProductId(
      startDate,
      endDate,
      +productId
    );

  const uniqueSupporters = getUniqueSupporters(allSupportProduct);
  const provinceCount = countProvinces(uniqueSupporters);

  res.status(200).json({ provinceCount });
});
module.exports = statController;
