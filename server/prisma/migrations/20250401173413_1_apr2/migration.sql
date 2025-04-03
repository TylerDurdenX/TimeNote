-- CreateTable
CREATE TABLE "SubTaskActivity" (
    "id" SERIAL NOT NULL,
    "subTaskId" INTEGER NOT NULL,
    "userId" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,
    "username" TEXT,
    "activity" TEXT,

    CONSTRAINT "SubTaskActivity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SubTaskActivity" ADD CONSTRAINT "SubTaskActivity_subTaskId_fkey" FOREIGN KEY ("subTaskId") REFERENCES "Subtask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
