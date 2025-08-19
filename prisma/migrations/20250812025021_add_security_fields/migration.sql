-- DropIndex
DROP INDEX "InviteLink_link_key";

-- AlterTable
ALTER TABLE "InviteLink" ADD COLUMN "details" TEXT;
