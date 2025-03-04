/*
  Warnings:

  - A unique constraint covering the columns `[Cust_name]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Role` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "Field1" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_Cust_name_key" ON "Customer"("Cust_name");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");
