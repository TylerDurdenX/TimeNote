/*
  Warnings:

  - A unique constraint covering the columns `[userId,ReportName,ProjectTeam]` on the table `AutoReports` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "AutoReports_userId_ReportName_key";

-- CreateIndex
CREATE UNIQUE INDEX "AutoReports_userId_ReportName_ProjectTeam_key" ON "AutoReports"("userId", "ReportName", "ProjectTeam");
