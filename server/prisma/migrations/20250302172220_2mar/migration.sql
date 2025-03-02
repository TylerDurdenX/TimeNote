-- AlterTable
ALTER TABLE "User" ADD COLUMN     "allowSignout" BOOLEAN,
ADD COLUMN     "idleTimeOut" TEXT,
ADD COLUMN     "pictureModification" BOOLEAN,
ADD COLUMN     "workingHours" TEXT;
