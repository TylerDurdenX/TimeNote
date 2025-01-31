/*
  Warnings:

  - You are about to drop the column `field1` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `field2` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `field3` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `field4` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "field1",
DROP COLUMN "field2",
DROP COLUMN "field3",
DROP COLUMN "field4",
ADD COLUMN     "ProjectManager" TEXT,
ADD COLUMN     "endDate" TEXT,
ADD COLUMN     "startDate" TEXT,
ADD COLUMN     "status" TEXT;
