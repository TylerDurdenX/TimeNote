/*
  Warnings:

  - You are about to drop the column `breakTimeInMinutes` on the `Attendance` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "breakTimeInMinutes";

-- AlterTable
ALTER TABLE "Breaks" ADD COLUMN     "breakTimeInMinutes" TEXT;
