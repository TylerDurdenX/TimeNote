/*
  Warnings:

  - Added the required column `breakDuration` to the `Break` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Break" ADD COLUMN     "breakDuration" TEXT NOT NULL;
