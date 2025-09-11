/*
  Warnings:

  - You are about to drop the column `groupId` on the `BookableItem` table. All the data in the column will be lost.
  - You are about to drop the column `group` on the `FAQ` table. All the data in the column will be lost.
  - You are about to drop the column `groupId` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the `Group` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `groupSlug` to the `BookableItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `groupSlug` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BookableItem" DROP CONSTRAINT "BookableItem_groupId_fkey";

-- AlterTable
ALTER TABLE "BookableItem" DROP COLUMN "groupId",
ADD COLUMN     "groupSlug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FAQ" DROP COLUMN "group",
ADD COLUMN     "groupSlug" TEXT;

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "groupId",
ADD COLUMN     "groupSlug" TEXT NOT NULL;

-- DropTable
DROP TABLE "Group";
