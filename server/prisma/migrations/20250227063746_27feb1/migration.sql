/*
  Warnings:

  - You are about to drop the column `taskCode` on the `Timesheet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Timesheet" DROP COLUMN "taskCode",
ADD COLUMN     "taskId" INTEGER;
