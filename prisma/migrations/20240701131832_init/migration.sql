/*
  Warnings:

  - Made the column `summaryDetail` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Product` MODIFY `story` MEDIUMTEXT NULL,
    MODIFY `summaryDetail` VARCHAR(191) NOT NULL;
