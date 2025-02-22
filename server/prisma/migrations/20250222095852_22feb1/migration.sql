-- CreateTable
CREATE TABLE "ProjectAttachments" (
    "id" SERIAL NOT NULL,
    "fileBase64" TEXT NOT NULL,
    "fileName" TEXT,
    "projectId" INTEGER,
    "uploadedById" INTEGER NOT NULL,

    CONSTRAINT "ProjectAttachments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProjectAttachments" ADD CONSTRAINT "ProjectAttachments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAttachments" ADD CONSTRAINT "ProjectAttachments_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
