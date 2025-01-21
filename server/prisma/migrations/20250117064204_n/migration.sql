/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Role` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Role_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Role_code_key" ON "Role"("code");
