-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "Cust_name" TEXT NOT NULL,
    "Allowed_User_Count" TEXT NOT NULL,
    "Plan" TEXT NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);
