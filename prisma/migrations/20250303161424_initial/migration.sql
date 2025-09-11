-- CreateEnum
CREATE TYPE "ReservationState" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "BookableItem" (
    "itemId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "allowsAlcohol" BOOLEAN NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "BookableItem_pkey" PRIMARY KEY ("itemId")
);

-- CreateTable
CREATE TABLE "Group" (
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("groupId")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "reservationId" SERIAL NOT NULL,
    "authorId" TEXT NOT NULL,
    "bookableItemId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "ReservationState" NOT NULL DEFAULT 'PENDING',
    "description" TEXT NOT NULL,
    "acceptedRules" BOOLEAN NOT NULL,
    "groupId" TEXT NOT NULL,
    "servesAlcohol" BOOLEAN NOT NULL,
    "soberWatch" TEXT,
    "approvedById" TEXT,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("reservationId")
);

-- CreateTable
CREATE TABLE "FAQ" (
    "questionId" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "group" TEXT,
    "author" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "FAQ_pkey" PRIMARY KEY ("questionId")
);

-- CreateTable
CREATE TABLE "_BookableItemToFAQ" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "BookableItem_name_idx" ON "BookableItem"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_BookableItemToFAQ_AB_unique" ON "_BookableItemToFAQ"("A", "B");

-- CreateIndex
CREATE INDEX "_BookableItemToFAQ_B_index" ON "_BookableItemToFAQ"("B");

-- AddForeignKey
ALTER TABLE "BookableItem" ADD CONSTRAINT "BookableItem_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("groupId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_bookableItemId_fkey" FOREIGN KEY ("bookableItemId") REFERENCES "BookableItem"("itemId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookableItemToFAQ" ADD CONSTRAINT "_BookableItemToFAQ_A_fkey" FOREIGN KEY ("A") REFERENCES "BookableItem"("itemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookableItemToFAQ" ADD CONSTRAINT "_BookableItemToFAQ_B_fkey" FOREIGN KEY ("B") REFERENCES "FAQ"("questionId") ON DELETE CASCADE ON UPDATE CASCADE;
