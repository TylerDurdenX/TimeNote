-- AlterTable
ALTER TABLE "TaskHistory" ADD COLUMN     "time" TEXT,
ALTER COLUMN "sprint" DROP NOT NULL;
