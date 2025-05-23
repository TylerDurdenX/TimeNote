/*
  Warnings:

  - Added the required column `userId` to the `AlertsConfigurations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AlertsConfigurations" ADD COLUMN     "userId" INTEGER NOT NULL;
