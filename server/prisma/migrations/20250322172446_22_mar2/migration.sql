/*
  Warnings:

  - Added the required column `breakType` to the `Breaks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Breaks" ADD COLUMN     "breakType" TEXT NOT NULL;
