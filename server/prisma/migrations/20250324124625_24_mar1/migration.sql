/*
  Warnings:

  - A unique constraint covering the columns `[breakCode]` on the table `BreakType` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BreakType_breakCode_key" ON "BreakType"("breakCode");
