-- CreateTable
CREATE TABLE "AutoReports" (
    "id" SERIAL NOT NULL,
    "ReportName" TEXT NOT NULL,
    "ReportTime" TEXT NOT NULL,
    "ReportDuration" TEXT NOT NULL,
    "ProjectTeam" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "AutoReports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AutoReports" ADD CONSTRAINT "AutoReports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
