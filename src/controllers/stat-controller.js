const productService = require("../services/product-service");
const supportProductService = require("../services/support-product-service");
const webProfitService = require("../services/web-profit-service");
const createError = require("../utils/create-error");
const tryCatch = require("../utils/try-catch-wrapper");
const dayjs = require("dayjs");
const { MONTH_NAME_MAP, PRODUCT_STATUS_ID } = require("../constants");

const statController = {};

const getCommonStats = async () => {
  const successProjects = await productService.getAllSuccessProject();
  const totalProjectCount = successProjects.length;
  const totalFunding = successProjects.reduce((acc, { totalFund }) => acc + totalFund, 0);

  const supportProjects = await supportProductService.getSupport();
  const totalContributions = supportProjects.length;

  return {
    totalProjectCount,
    totalFunding,
    totalContributions,
  };
};

const getDateRange = (year) => {
  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31`);
  return { startDate, endDate };
};

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

const compareTotalFundDesc = (a, b) => b.totalFund - a.totalFund;
const compareTotalSupporterDesc = (a, b) => b.totalSupporter - a.totalSupporter;

statController.getAdminStat = tryCatch(async (req, res) => {
  const { totalProjectCount, totalFunding, totalContributions } = await getCommonStats();

  const webProfits = await webProfitService.getAllProfit();
  const totalWebProfit = webProfits.reduce(
    (acc, { totalProfit }) => acc + totalProfit,
    0
  );

  const stat = {
    projectSupport: totalProjectCount,
    towardIdea: totalFunding,
    contribution: totalContributions,
    webProfit: totalWebProfit,
  };

  res.status(200).json({ stat });
});

statController.getStatByProduct = tryCatch(async (req, res) => {
  const { productId } = req.params;
  const supportProjects = await supportProductService.getSupportByProductId(+productId);
  const supporterCount = supportProjects.length;

  const product = await productService.findProductByCreatorIdAndProductId(
    req.user.id,
    +productId
  );
  if (!product) {
    createError({
      message: "No product created by this creator",
      statusCode: 400,
    });
  }

  const stat = {
    supporter: supporterCount,
    totalFund,
    availableFund,
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
  const today = new Date();
  const { startDate, endDate } = getDateRange(today.getFullYear());
  const products = await getFilteredProductsByMonth(startDate, endDate);

  const productDataAllMonth = MONTH_NAME_MAP.map((month) => {
    const filteredProducts = products.filter((el) => el.month === month);
    const topFiveByTotalFund = [...filteredProducts]
      .sort(compareTotalFundDesc)
      .slice(0, 5);
    const topFiveByTotalSupporter = [...filteredProducts]
      .sort(compareTotalSupporterDesc)
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
  const findIndexMonth = MONTH_NAME_MAP.findIndex((month) => month === todayMonth);
  const filterMonth = MONTH_NAME_MAP.slice(0, findIndexMonth + 1);

  const { startDate, endDate } = getDateRange(today.getFullYear());
  const allProducts = await productService.getAllProjectFilterByStartEndDate(
    startDate,
    endDate
  );
  const mapCreatorData = allProducts.map((el) => ({
    creatorId: el.creatorId,
    month: dayjs(el.updatedAt).format("MMM"),
  }));

  const getCurrentAndLastMonthCount = (monthIndex, mapData, monthList) => {
    const currentMonthData = mapData.filter((el) => el.month === monthList[monthIndex]);
    const currentMonthCount = new Set(currentMonthData.map((el) => el.creatorId)).size;

    const lastMonthCount =
      monthIndex > 0
        ? new Set(
            mapData
              .filter((el) => el.month === monthList[monthIndex - 1])
              .map((el) => el.creatorId)
          ).size
        : 0;

    return { currentMonthCount, lastMonthCount };
  };

  const { currentMonthCount, lastMonthCount } = getCurrentAndLastMonthCount(
    findIndexMonth,
    mapCreatorData,
    MONTH_NAME_MAP
  );

  res.status(200).json({
    currentMonthCreatorActive: {
      month: todayMonth,
      count: currentMonthCount,
    },
    lastMonthCreatorActive: {
      month: findIndexMonth > 0 ? MONTH_NAME_MAP[findIndexMonth - 1] : null,
      count: lastMonthCount,
    },
  });
});

statController.getSupporterActive = tryCatch(async (req, res) => {
  const today = new Date();
  const todayMonth = dayjs(today).format("MMM");
  const findIndexMonth = MONTH_NAME_MAP.findIndex((month) => month === todayMonth);
  const filterMonth = [...MONTH_NAME_MAP].slice(0, findIndexMonth + 1);

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

  let countSupporterLastMonth;
  if (findIndexMonth - 1 > 0) {
    const supporterIdLastMonth = mapSupporterData
      .filter((el) => el.month === MONTH_NAME_MAP[findIndexMonth - 1])
      .map((el) => el.supporterId);
    countSupporterLastMonth = new Set(supporterIdLastMonth).size;
  } else {
    countSupporterLastMonth = 0;
  }

  res.status(200).json({
    currentMonthCreatorActive: {
      month: MONTH_NAME_MAP[filterMonth],
      count: countSupporterCurrentMonth,
    },
    lastMonthCreatorActive: {
      month: findIndexMonth > 0 ? MONTH_NAME_MAP[filterMonth] : null,
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
  const getApprovalProduct = await productService.getApprovalProduct();
  const mapApprovalProduct = getApprovalProduct.map((el) => {
    return { productStatusId: el.productStatusId };
  });
  const countPending = mapApprovalProduct.filter(
    (el) => el.productStatusId === PRODUCT_STATUS_ID.PENDING
  );
  const countSuccess = mapApprovalProduct.filter(
    (el) => el.productStatusId === PRODUCT_STATUS_ID.SUCCESS
  );
  const countFailed = mapApprovalProduct.filter(
    (el) => el.productStatusId === PRODUCT_STATUS_ID.FAILED
  );

  res.status(200).json({
    totalProject: mapApprovalProduct.length,
    pendingProject: countPending.length,
    successProject: countSuccess.length,
    failedProject: countFailed.length,
  });
});

statController.getProductFundTrend = tryCatch(async (req, res) => {
  const today = new Date();
  const todayMonth = dayjs(today).format("MMM");
  const findIndexMonth = MONTH_NAME_MAP.findIndex((month) => month === todayMonth);
  const filterMonth = [...MONTH_NAME_MAP].slice(0, findIndexMonth + 1);

  const startDate = new Date(`${today.getFullYear()}-01-01`);
  const endDate = new Date(`${today.getFullYear()}-12-31`);
  const getAllSupportProduct =
    await supportProductService.getAllSupporterProductFilterByStartEndDate(
      startDate,
      endDate
    );

  const mapSupportProduct = getAllSupportProduct.map((el) => ({
    month: dayjs(el.createdAt).format("MMM"),
    fund: el.tier.price,
  }));

  let cumulativeFund = 0;
  const cumulativeFundAllMonth = filterMonth.map((month) => {
    const filterMonth = mapSupportProduct.filter((el) => el.month === month);
    const totalFundMonth = filterMonth.reduce((acc, item) => acc + item.fund, 0);
    cumulativeFund = cumulativeFund + totalFundMonth;
    return { month, cumulativeFund: cumulativeFund };
  });

  res.status(200).json({ cumulativeFundAllMonth });
});

module.exports = statController;
