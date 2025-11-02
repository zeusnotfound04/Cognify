/*
  Warnings:

  - You are about to drop the `McpApiKey` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."McpApiKey" DROP CONSTRAINT "McpApiKey_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mcpApiKey" TEXT;

-- DropTable
DROP TABLE "public"."McpApiKey";

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "keyType" TEXT NOT NULL,
    "keyValue" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_userId_provider_keyType_key" ON "ApiKey"("userId", "provider", "keyType");

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
