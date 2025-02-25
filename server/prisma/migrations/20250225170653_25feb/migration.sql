-- CreateTable
CREATE TABLE "Timesheet" (
    "id" SERIAL NOT NULL,
    "task" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "username" TEXT,

    CONSTRAINT "Timesheet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Timesheet" ADD CONSTRAINT "Timesheet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
