/*
  Warnings:

  - A unique constraint covering the columns `[subTaskId,date]` on the table `Timesheet` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Timesheet_subTaskId_date_key" ON "Timesheet"("subTaskId", "date");
