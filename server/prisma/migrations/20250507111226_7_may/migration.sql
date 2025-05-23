-- CreateTable
CREATE TABLE "AlertsConfigurations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT,
    "time" TEXT,

    CONSTRAINT "AlertsConfigurations_pkey" PRIMARY KEY ("id")
);
