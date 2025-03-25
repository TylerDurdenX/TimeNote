/*
  Warnings:

  - You are about to drop the column `breakType` on the `Breaks` table. All the data in the column will be lost.
  - Added the required column `breakTypeId` to the `Breaks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `breakTypeName` to the `Breaks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Breaks" DROP COLUMN "breakType",
ADD COLUMN     "breakTypeId" INTEGER NOT NULL,
ADD COLUMN     "breakTypeName" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "BreakType" (
    "id" SERIAL NOT NULL,
    "breakName" TEXT NOT NULL,
    "breakCode" TEXT NOT NULL,
    "breakDescription" TEXT NOT NULL,
    "breakTimeInMinutes" TEXT,

    CONSTRAINT "BreakType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Breaks" ADD CONSTRAINT "Breaks_breakTypeId_fkey" FOREIGN KEY ("breakTypeId") REFERENCES "BreakType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
