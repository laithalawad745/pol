-- CreateTable
CREATE TABLE "SuperAdmin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdminLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "adminId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AccessLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "details" TEXT,
    "subscriberId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AccessLog_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "Subscriber" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AccessLog" ("action", "createdAt", "details", "id", "subscriberId", "telegramId") SELECT "action", "createdAt", "details", "id", "subscriberId", "telegramId" FROM "AccessLog";
DROP TABLE "AccessLog";
ALTER TABLE "new_AccessLog" RENAME TO "AccessLog";
CREATE TABLE "new_Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT,
    "channelId" TEXT,
    "channelName" TEXT,
    "botToken" TEXT,
    "botUsername" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "planType" TEXT DEFAULT 'basic',
    "planExpiry" DATETIME,
    "maxSubscribers" INTEGER NOT NULL DEFAULT 100,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Admin" ("botToken", "channelId", "createdAt", "id", "password", "updatedAt", "username") SELECT "botToken", "channelId", "createdAt", "id", "password", "updatedAt", "username" FROM "Admin";
DROP TABLE "Admin";
ALTER TABLE "new_Admin" RENAME TO "Admin";
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");
CREATE UNIQUE INDEX "Admin_channelId_key" ON "Admin"("channelId");
CREATE TABLE "new_InviteLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "link" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" DATETIME,
    "expiresAt" DATETIME NOT NULL,
    "details" TEXT,
    "subscriberId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InviteLink_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "Subscriber" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_InviteLink" ("createdAt", "details", "expiresAt", "id", "isUsed", "link", "subscriberId", "token", "usedAt") SELECT "createdAt", "details", "expiresAt", "id", "isUsed", "link", "subscriberId", "token", "usedAt" FROM "InviteLink";
DROP TABLE "InviteLink";
ALTER TABLE "new_InviteLink" RENAME TO "InviteLink";
CREATE UNIQUE INDEX "InviteLink_token_key" ON "InviteLink"("token");
CREATE TABLE "new_Subscriber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "telegramId" TEXT NOT NULL,
    "telegramUsername" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "phoneNumber" TEXT,
    "subscriptionStart" DATETIME NOT NULL,
    "subscriptionEnd" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "amount" REAL DEFAULT 0,
    "paymentMethod" TEXT,
    "notes" TEXT,
    "adminId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscriber_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Subscriber" ("adminId", "createdAt", "firstName", "id", "isActive", "lastName", "subscriptionEnd", "subscriptionStart", "telegramId", "telegramUsername", "updatedAt") SELECT "adminId", "createdAt", "firstName", "id", "isActive", "lastName", "subscriptionEnd", "subscriptionStart", "telegramId", "telegramUsername", "updatedAt" FROM "Subscriber";
DROP TABLE "Subscriber";
ALTER TABLE "new_Subscriber" RENAME TO "Subscriber";
CREATE UNIQUE INDEX "Subscriber_telegramId_adminId_key" ON "Subscriber"("telegramId", "adminId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "SuperAdmin_username_key" ON "SuperAdmin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "SuperAdmin_email_key" ON "SuperAdmin"("email");
