-- CreateTable
CREATE TABLE "ResourceLink" (
    "linkId" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "ResourceLink_pkey" PRIMARY KEY ("linkId")
);

-- CreateIndex
CREATE INDEX "ResourceLink_title_idx" ON "ResourceLink"("title");
