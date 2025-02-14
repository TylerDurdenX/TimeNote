/*
  Warnings:

  - A unique constraint covering the columns `[userId,ReportName]` on the table `AutoReports` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AutoReports_userId_ReportName_key" ON "AutoReports"("userId", "ReportName");
