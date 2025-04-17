/*
  Warnings:

  - A unique constraint covering the columns `[userDetailsId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userDetailsId" INTEGER,
ADD COLUMN     "userStatus" TEXT;

-- CreateTable
CREATE TABLE "UserDetails" (
    "id" SERIAL NOT NULL,
    "address" TEXT,
    "joiningDate" TIMESTAMP(3),
    "department" TEXT,
    "totalLeaves" TEXT,
    "emergencyContact" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "employeeId" TEXT,
    "gender" TEXT,
    "emailAddress" TEXT,
    "employementType" TEXT,
    "workLocation" TEXT,
    "employeeGrade" TEXT,
    "employeeStatus" TEXT,
    "issuedDevices" TEXT,

    CONSTRAINT "UserDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievements" (
    "id" SERIAL NOT NULL,
    "userDetailId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3),

    CONSTRAINT "Achievements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_userDetailsId_key" ON "User"("userDetailsId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_userDetailsId_fkey" FOREIGN KEY ("userDetailsId") REFERENCES "UserDetails"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievements" ADD CONSTRAINT "Achievements_userDetailId_fkey" FOREIGN KEY ("userDetailId") REFERENCES "UserDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
