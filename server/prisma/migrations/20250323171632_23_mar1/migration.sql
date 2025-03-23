/*
  Warnings:

  - A unique constraint covering the columns `[taskId,date]` on the table `Timesheet` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Timesheet_taskId_date_key" ON "Timesheet"("taskId", "date");
