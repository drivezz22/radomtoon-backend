const productService = require("../services/product-service");
const supportProductService = require("../services/support-product-service");
const webProfitService = require("../services/web-profit-service");
const createError = require("../utils/create-error");
const tryCatch = require("../utils/try-catch-wrapper");
const dayjs = require("dayjs");
const { MONTH_NAME_MAP, PRODUCT_STATUS_ID } = require("../constants");
const axios = require("axios");
const ARIMA = require("arima");

const statController = {};

function transformAndSort(data) {
  return Object.entries(data)
    .map(([key, value]) => ({
      label: key,
      value: value,
    }))
    .sort((a, b) => b.value - a.value); // Sort by value in descending order
}

const getCommonStats = async () => {
  const successProjects = await productService.getAllProject();
  const supportProjects = await supportProductService.getSupport();
  const supportProductFilter = supportProjects.filter((el) => el.deletedAt === null);

  return {
    totalProjectCount: successProjects.length,
    totalFunding: successProjects.reduce((acc, { totalFund }) => acc + totalFund, 0),
    totalContributions: supportProductFilter.length,
  };
};

function getFullMonthName(shortMonth) {
  const monthAbbreviations = {
    Jan: "January",
    Feb: "February",
    Mar: "March",
    Apr: "April",
    May: "May",
    Jun: "June",
    Jul: "July",
    Aug: "August",
    Sep: "September",
    Oct: "October",
    Nov: "November",
    Dec: "December",
  };

  return monthAbbreviations[shortMonth] || "Invalid month abbreviation";
}

const getDateRange = (year) => ({
  startDate: new Date(`${year}-01-01`),
  endDate: new Date(`${year}-12-31`),
});

const getFilteredProductsByMonth = async (startDate, endDate) => {
  const allProducts = await productService.getAllSuccessfulOrPendingProjectsBetweenDates(
    startDate,
    endDate
  );

  return allProducts.map((el) => ({
    productId: el.id,
    categoryId: el.categoryId,
    category: el.category.category,
    totalFund: el.totalFund,
    supportProduct: el.supportProducts,
  }));
};

const getCumulativeFundsByMonth = (allSupportProducts, filterMonth) => {
  let cumulativeFund = 0;
  return filterMonth.map((month) => {
    const totalFundMonth = allSupportProducts
      .filter((el) => el.month === month)
      .reduce((acc, item) => acc + item.fund, 0);
    cumulativeFund += totalFundMonth;
    return { label: month, fund: cumulativeFund };
  });
};

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

  res.status(200).json([
    { title: "active projects", amount: totalProjectCount },
    { title: "towards ideas", amount: totalFunding, currency: "THB" },
    { title: "contributions", amount: totalContributions },
    { title: "RADOMTOON's profits", amount: totalWebProfit, currency: "THB" },
  ]);
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
  const totalFundString = String(totalFunding);
  const estimatedFunding = +totalFundString[0] * 10 ** (totalFundString.length - 1);
  res.status(200).json({
    stat: {
      projectSupport: totalProjectCount,
      towardIdea: estimatedFunding,
      contribution: totalContributions,
    },
  });
});

statController.getTopFiveCategories = tryCatch(async (req, res) => {
  const { startDate, endDate } = getDateRange(new Date().getFullYear());
  const products = await getFilteredProductsByMonth(startDate, endDate);

  const productDataAllMonth = [];
  products.forEach((product) => {
    product.supportProduct.forEach((support) => {
      const filterData = productDataAllMonth.filter(
        (el) => el.month === dayjs(support.createdAt).format("MMM")
      );
      if (filterData.length === 0) {
        productDataAllMonth.push({
          month: dayjs(support.createdAt).format("MMM"),
          fundData: { [product.category]: support.tier.price },
          supporterData: { [product.category]: 1 },
        });
      } else {
        if (filterData[0].fundData[product.category] === undefined) {
          filterData[0].fundData[product.category] = support.tier.price;
          filterData[0].supporterData[product.category] = 1;
        } else {
          filterData[0].fundData[product.category] += support.tier.price;
          filterData[0].supporterData[product.category] += 1;
        }
      }
    });
  });

  const productDataAllMonthMap = productDataAllMonth.map((el) => ({
    month: el.month,
    topFiveByTotalFund: transformAndSort(el.fundData).slice(0, 5),
    topFiveByTotalSupporter: transformAndSort(el.supporterData).slice(0, 5),
  }));

  res.status(200).json({ productDataAllMonth: productDataAllMonthMap });
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

  if (mapSupportProduct.length > 0) {
    const autoarima = new ARIMA({ p: 2, d: 1, q: 2, verbose: false }).train(
      mapSupportProduct.map((el) => el.fund)
    );
    const [pred, errors] = autoarima.predict(3);

    const lastFund = cumulativeFundAllMonth[findIndexMonth].fund;
    cumulativeFundAllMonth[findIndexMonth].forecast = lastFund;

    for (let i = 0; i < 3; i++) {
      const monthIndex = findIndexMonth + i + 1;
      if (monthIndex < MONTH_NAME_MAP.length) {
        const month = MONTH_NAME_MAP[monthIndex];
        if (!cumulativeFundAllMonth.find((el) => el.label === month)) {
          const value = pred[i] > 0 ? Math.round(pred[i]) : 0;
          if (monthIndex - 1 >= 0) {
            cumulativeFundAllMonth.push({
              label: month,
              forecast: cumulativeFundAllMonth[monthIndex - 1].forecast + value,
            });
          } else {
            cumulativeFundAllMonth.push({
              label: month,
              forecast: value,
            });
          }
        }
      }
    }
  }

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
    title: "Active Creator",
    value: currentMonthCount,
    prev: lastMonthCount,
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
    title: "Active Supporter",
    value: countSupporterCurrentMonth,
    prev: countSupporterLastMonth,
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
  res.status(200).json({
    title: "Average Funding",
    value: averageFund,
  });
});

statController.getCountProject = tryCatch(async (req, res) => {
  const approvalProducts = await productService.getApprovalProduct();
  const statusCounts = approvalProducts.reduce((acc, { productStatusId }) => {
    acc[productStatusId] = (acc[productStatusId] || 0) + 1;
    return acc;
  }, {});

  res.status(200).json({
    title: "Success Projects",
    value: statusCounts[PRODUCT_STATUS_ID.SUCCESS] || 0,
    total: approvalProducts.length,
  });
});

statController.getProjectOverview = tryCatch(async (req, res) => {
  const approvalProducts = await productService.getApprovalProduct();
  const statusCounts = approvalProducts.reduce((acc, { productStatusId }) => {
    acc[productStatusId] = (acc[productStatusId] || 0) + 1;
    return acc;
  }, {});

  res.status(200).json([
    { label: "Success", value: statusCounts[PRODUCT_STATUS_ID.SUCCESS] || 0 },
    { label: "Active", value: statusCounts[PRODUCT_STATUS_ID.PENDING] || 0 },
    { label: "Failed", value: statusCounts[PRODUCT_STATUS_ID.FAILED] || 0 },
  ]);
});

statController.getProductFundTrend = tryCatch(async (req, res) => {
  const { productId } = req.params;

  const existProduct = await productService.checkCreatorIdMatchProductId(
    req.user.id,
    +productId
  );

  if (!existProduct) {
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

  const cumulativeFundAllMonth = getCumulativeFundsByMonth(
    mapSupportProduct,
    filterMonth
  );

  if (mapSupportProduct.length > 0) {
    const autoarima = new ARIMA({ p: 2, d: 1, q: 2, verbose: false }).train(
      mapSupportProduct.map((el) => el.fund)
    );
    const [pred, errors] = autoarima.predict(3);

    const lastFund = cumulativeFundAllMonth[findIndexMonth].fund;
    cumulativeFundAllMonth[findIndexMonth].forecast = lastFund;

    for (let i = 0; i < 3; i++) {
      const monthIndex = findIndexMonth + i + 1;
      if (monthIndex < MONTH_NAME_MAP.length) {
        const month = MONTH_NAME_MAP[monthIndex];
        if (!cumulativeFundAllMonth.find((el) => el.label === month)) {
          const value = pred[i] > 0 ? Math.round(pred[i]) : 0;
          if (monthIndex - 1 >= 0) {
            cumulativeFundAllMonth.push({
              label: month,
              forecast: cumulativeFundAllMonth[monthIndex - 1].forecast + value,
            });
          } else {
            cumulativeFundAllMonth.push({
              label: month,
              forecast: value,
            });
          }
        }
      }
    }
  }

  res.status(200).json({ cumulativeFundAllMonth });
});

statController.getTierStat = tryCatch(async (req, res, next) => {
  const { productId } = req.params;

  const existProduct = await productService.checkCreatorIdMatchProductId(
    req.user.id,
    +productId
  );

  if (!existProduct) {
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

  const combineData = existProduct.productTiers.map(({ tierName }) => ({
    label: tierName,
    value: 0,
  }));

  const combineTier = allSupportProduct.reduce(
    (acc, { tier: { tierName, price } }) => {
      const foundedIndex = acc.findIndex((el) => el.label === tierName);
      if (foundedIndex !== -1) {
        acc[foundedIndex].value += price;
      }
      return acc;
    },
    [...combineData]
  );

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

statController.getGeoJson = tryCatch(async (req, res) => {
  const response = await axios.get(
    "https://raw.githubusercontent.com/apisit/thailand.json/master/thailandwithdensity.json"
  );
  res.json(response.data);
});

module.exports = statController;
