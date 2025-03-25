-- DropForeignKey
ALTER TABLE "Breaks" DROP CONSTRAINT "Breaks_breakTypeId_fkey";

-- AlterTable
ALTER TABLE "Breaks" ALTER COLUMN "breakTypeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Breaks" ADD CONSTRAINT "Breaks_breakTypeId_fkey" FOREIGN KEY ("breakTypeId") REFERENCES "BreakType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
