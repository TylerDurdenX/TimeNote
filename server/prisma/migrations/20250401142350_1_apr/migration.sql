/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Subtask` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Subtask" ADD COLUMN     "code" TEXT,
ADD COLUMN     "inProgressStartTime" TIMESTAMP(3),
ADD COLUMN     "inProgressTimeinMinutes" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Subtask_code_key" ON "Subtask"("code");
