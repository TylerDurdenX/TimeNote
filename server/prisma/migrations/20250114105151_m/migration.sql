/*
  Warnings:

  - Added the required column `designation` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "designation" TEXT NOT NULL,
ADD COLUMN     "phoneNumber" TEXT NOT NULL;
