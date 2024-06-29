-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(50) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(10) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `profileImage` VARCHAR(191) NULL,
    `address` VARCHAR(191) NOT NULL,
    `provinceId` INTEGER NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Admin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(50) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL,

    UNIQUE INDEX `Admin_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Creator` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(50) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(10) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `profileImage` VARCHAR(191) NULL,
    `identityImage` VARCHAR(191) NOT NULL,
    `isCreatorAcceptId` INTEGER NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `provinceId` INTEGER NOT NULL,
    `biography` TEXT NULL,
    `website` VARCHAR(50) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL,

    UNIQUE INDEX `Creator_email_key`(`email`),
    UNIQUE INDEX `Creator_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Province` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `province` ENUM('AMNATCHAROEN', 'ANGTHONG', 'BANGKOK', 'BURIRAM', 'CHACHOENGSAO', 'CHAINAT', 'CHAIYAPHUM', 'CHANTHABURI', 'CHIANGMAI', 'CHIANGRAI', 'CHONBURI', 'CHUMPHON', 'KALASIN', 'KAMPAENGPHET', 'KANCHANABURI', 'KHONKAEN', 'KRABI', 'LAMPANG', 'LAMPHUN', 'LOEI', 'LOPBURI', 'MAEHONGSON', 'MAHASARAKHAM', 'MUKDAHAN', 'NAKHONNAYOK', 'NAKHONPATHOM', 'NAKHONPHANOM', 'NAKHONRATCHASIMA', 'NAKHONSAWAN', 'NAKHONSITHAMMARAT', 'NAN', 'NARATHIWAT', 'NONGBUALAMPHU', 'NONGKHAI', 'NONTHABURI', 'PATHUMTHANI', 'PATTANI', 'PHACHINBURI', 'PHANGNGA', 'PHATTHALUNG', 'PHAYAO', 'PHETCHABUN', 'PHETCHABURI', 'PHICHIT', 'PHITSANULOK', 'PHRANAKHONSIAYUDHYA', 'PHRAE', 'PHUKET', 'PRACHUAPKHILIKHAN', 'RANONG', 'RATCHABURI', 'RAYONG', 'ROIET', 'SAKAEO', 'SAKONNAKHON', 'SAMUTPRAKARN', 'SAMUTSAKHON', 'SAMUTSONGKHAM', 'SARABURI', 'SATUN', 'SISAKET', 'SINGBURI', 'SONGKHLA', 'SUKHOTHAI', 'SUPHANBURI', 'SURATTHANI', 'SURIN', 'TAK', 'TRAD', 'TRANG', 'UBONRATCHATHANI', 'UDONTHANI', 'UTHAITHANI', 'UTTARADIT', 'YALA', 'YASOTHON') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Comment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `comment` TEXT NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IsCreatorAcceptStatus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` ENUM('PENDING', 'ACCEPTED') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `creatorId` INTEGER NOT NULL,
    `productStatusId` INTEGER NULL,
    `approvalStatusId` INTEGER NULL,
    `categoryId` INTEGER NOT NULL,
    `productName` VARCHAR(256) NOT NULL,
    `goal` INTEGER NOT NULL,
    `deadline` DATETIME(3) NOT NULL,
    `productImage` VARCHAR(191) NOT NULL,
    `productVideo` VARCHAR(191) NULL,
    `story` MEDIUMTEXT NOT NULL,
    `totalFund` INTEGER NOT NULL DEFAULT 0,
    `availableFund` INTEGER NOT NULL DEFAULT 0,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CategoryType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category` ENUM('ART', 'COMICS', 'CRAFTS', 'DANCE', 'DESIGN', 'FASHION', 'FILM', 'GAMES', 'MUSIC', 'TECHNOLOGY') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductStatus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` ENUM('PENDING', 'FAILED', 'SUCCESS') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductMilestone` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `milestoneRankId` INTEGER NOT NULL,
    `approvalStatusId` INTEGER NULL,
    `milestoneDetail` TEXT NOT NULL,
    `evidenceTextDetail` TEXT NULL,
    `evidenceImage` VARCHAR(191) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MilestoneRank` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tier` ENUM('RANK1', 'RANK2', 'RANK3') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ApprovalStatus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` ENUM('PENDING', 'FAILED', 'SUCCESS') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductTier` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tierRankId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `tierName` VARCHAR(191) NOT NULL,
    `price` INTEGER NOT NULL,
    `tierDetail` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TierRank` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tier` ENUM('RANK1', 'RANK2', 'RANK3') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SupportProduct` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `tierId` INTEGER NOT NULL,
    `deliveryStatusId` INTEGER NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL,
    `deletedAt` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `deliveryStatus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` ENUM('PENDING', 'DELIVERED') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WebProfit` (
    `productId` INTEGER NOT NULL,
    `totalProfit` INTEGER NOT NULL,

    PRIMARY KEY (`productId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_provinceId_fkey` FOREIGN KEY (`provinceId`) REFERENCES `Province`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Creator` ADD CONSTRAINT `Creator_provinceId_fkey` FOREIGN KEY (`provinceId`) REFERENCES `Province`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Creator` ADD CONSTRAINT `Creator_isCreatorAcceptId_fkey` FOREIGN KEY (`isCreatorAcceptId`) REFERENCES `IsCreatorAcceptStatus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `Creator`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_productStatusId_fkey` FOREIGN KEY (`productStatusId`) REFERENCES `ProductStatus`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_approvalStatusId_fkey` FOREIGN KEY (`approvalStatusId`) REFERENCES `ApprovalStatus`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `CategoryType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductMilestone` ADD CONSTRAINT `ProductMilestone_approvalStatusId_fkey` FOREIGN KEY (`approvalStatusId`) REFERENCES `ApprovalStatus`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductMilestone` ADD CONSTRAINT `ProductMilestone_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductMilestone` ADD CONSTRAINT `ProductMilestone_milestoneRankId_fkey` FOREIGN KEY (`milestoneRankId`) REFERENCES `MilestoneRank`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductTier` ADD CONSTRAINT `ProductTier_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductTier` ADD CONSTRAINT `ProductTier_tierRankId_fkey` FOREIGN KEY (`tierRankId`) REFERENCES `TierRank`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupportProduct` ADD CONSTRAINT `SupportProduct_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupportProduct` ADD CONSTRAINT `SupportProduct_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupportProduct` ADD CONSTRAINT `SupportProduct_tierId_fkey` FOREIGN KEY (`tierId`) REFERENCES `ProductTier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupportProduct` ADD CONSTRAINT `SupportProduct_deliveryStatusId_fkey` FOREIGN KEY (`deliveryStatusId`) REFERENCES `deliveryStatus`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WebProfit` ADD CONSTRAINT `WebProfit_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
