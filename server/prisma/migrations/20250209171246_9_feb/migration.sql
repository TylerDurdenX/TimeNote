/*
  Warnings:

  - You are about to drop the column `fileURL` on the `Attachment` table. All the data in the column will be lost.
  - Added the required column `fileBase64` to the `Attachment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attachment" DROP COLUMN "fileURL",
ADD COLUMN     "fileBase64" TEXT NOT NULL;
