const { PrismaClient } = require("@prisma/client");
const { userData } = require("./mocks/user-data");
const { deliveryStatusTypeData } = require("./mocks/delivery-status-type-data");
const {
  isCreatorAcceptStatusTypeData,
} = require("./mocks/is-creator-accept-status-type-data");
const { milestoneRankData } = require("./mocks/milestone-rank-data");
const { tierRankData } = require("./mocks/tier-rank-data");
const { productStatusTypeData } = require("./mocks/product-status-type-data");
const { approvalStatusTypeData } = require("./mocks/approval-status-type-data");

const prisma = new PrismaClient();

const initialRun = async () => {
  await prisma.user.createMany({ data: userData });
  await prisma.deliveryStatus.createMany({ data: deliveryStatusTypeData });
  await prisma.isCreatorAcceptStatus.createMany({ data: isCreatorAcceptStatusTypeData });
  await prisma.milestoneRank.createMany({ data: milestoneRankData });
  await prisma.productStatusType.createMany({ data: productStatusTypeData });
  await prisma.tierRank.createMany({ data: tierRankData });
  await prisma.approvalStatus.createMany({ data: approvalStatusTypeData });
};
initialRun();
