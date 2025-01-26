-- CreateTable
CREATE TABLE "Screenshots" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "base64" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Screenshots_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Screenshots" ADD CONSTRAINT "Screenshots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
