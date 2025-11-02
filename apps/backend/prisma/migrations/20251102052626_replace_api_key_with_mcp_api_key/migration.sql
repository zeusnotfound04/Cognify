/*
  Warnings:

  - You are about to drop the `ApiKey` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ApiKey" DROP CONSTRAINT "ApiKey_userId_fkey";

-- DropTable
DROP TABLE "public"."ApiKey";

-- CreateTable
CREATE TABLE "McpApiKey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "keyName" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "McpApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "McpApiKey_apiKey_key" ON "McpApiKey"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "McpApiKey_userId_keyName_key" ON "McpApiKey"("userId", "keyName");

-- AddForeignKey
ALTER TABLE "McpApiKey" ADD CONSTRAINT "McpApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
