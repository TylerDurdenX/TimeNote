-- CreateTable
CREATE TABLE "Leaves" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "leaveType" TEXT,
    "description" TEXT,
    "date" TIMESTAMP(3),
    "year" TEXT,
    "approvalStatus" TEXT,

    CONSTRAINT "Leaves_pkey" PRIMARY KEY ("id")
);
