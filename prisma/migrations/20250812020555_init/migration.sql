-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "botToken" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Subscriber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "telegramId" TEXT NOT NULL,
    "telegramUsername" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "subscriptionStart" DATETIME NOT NULL,
    "subscriptionEnd" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "adminId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscriber_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InviteLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "link" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" DATETIME,
    "expiresAt" DATETIME NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InviteLink_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "Subscriber" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AccessLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "details" TEXT,
    "subscriberId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AccessLog_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "Subscriber" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_channelId_key" ON "Admin"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_telegramId_key" ON "Subscriber"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "InviteLink_link_key" ON "InviteLink"("link");

-- CreateIndex
CREATE UNIQUE INDEX "InviteLink_token_key" ON "InviteLink"("token");
