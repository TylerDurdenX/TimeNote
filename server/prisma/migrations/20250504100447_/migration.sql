/*
  Warnings:

  - You are about to drop the column `ProjectTeam` on the `AutoReports` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,ReportName,ReportDuration]` on the table `AutoReports` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "AutoReports_userId_ReportName_ProjectTeam_key";

-- AlterTable
ALTER TABLE "AutoReports" DROP COLUMN "ProjectTeam",
ADD COLUMN     "allUsersFlag" BOOLEAN,
ADD COLUMN     "team" TEXT,
ADD COLUMN     "userEmail" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AutoReports_userId_ReportName_ReportDuration_key" ON "AutoReports"("userId", "ReportName", "ReportDuration");
