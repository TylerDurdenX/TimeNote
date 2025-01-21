/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Authority` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Authority_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Authority_code_key" ON "Authority"("code");
