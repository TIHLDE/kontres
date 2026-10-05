-- CreateTable
CREATE TABLE "PhotonSession" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhotonSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PhotonSession_updatedAt_idx" ON "PhotonSession"("updatedAt");
