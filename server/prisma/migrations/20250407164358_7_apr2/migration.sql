/*
  Warnings:

  - You are about to drop the `GeoLocation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GeoLocation" DROP CONSTRAINT "GeoLocation_userId_fkey";

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "geoLocation" TEXT;

-- DropTable
DROP TABLE "GeoLocation";
