/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `McpApiKey` table. All the data in the column will be lost.
  - You are about to drop the column `keyName` on the `McpApiKey` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `McpApiKey` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."McpApiKey_userId_keyName_key";

-- AlterTable
ALTER TABLE "McpApiKey" DROP COLUMN "expiresAt",
DROP COLUMN "keyName";

-- CreateIndex
CREATE UNIQUE INDEX "McpApiKey_userId_key" ON "McpApiKey"("userId");
