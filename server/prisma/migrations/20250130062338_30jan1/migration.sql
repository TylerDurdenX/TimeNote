/*
  Warnings:

  - You are about to drop the column `ProjectManager` on the `Project` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[projectManager]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `projectManager` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "ProjectManager",
ADD COLUMN     "projectManager" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Project_projectManager_key" ON "Project"("projectManager");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_projectManager_fkey" FOREIGN KEY ("projectManager") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
