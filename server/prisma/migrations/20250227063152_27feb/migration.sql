/*
  Warnings:

  - Added the required column `ApprovedFlag` to the `Timesheet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `consumedHours` to the `Timesheet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Timesheet" ADD COLUMN     "ApprovedFlag" TEXT NOT NULL,
ADD COLUMN     "completionPercentage" TEXT,
ADD COLUMN     "consumedHours" TEXT NOT NULL,
ADD COLUMN     "projectId" INTEGER,
ADD COLUMN     "taskCode" TEXT;
