-- AlterTable: add personal billing columns to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "personalPlanType"        TEXT NOT NULL DEFAULT 'free';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "personalMonthlyMsgCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "personalMonthlyMsgLimit" INTEGER NOT NULL DEFAULT 200;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "personalPlanRenewalDate" TIMESTAMP(3);

-- CreateTable: UserBillingRecord
CREATE TABLE IF NOT EXISTS "UserBillingRecord" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "plan"      TEXT NOT NULL,
    "amountRWF" INTEGER NOT NULL,
    "txRef"     TEXT NOT NULL,
    "flwRef"    TEXT,
    "status"    TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserBillingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "UserBillingRecord_txRef_key" ON "UserBillingRecord"("txRef");
CREATE INDEX IF NOT EXISTS "UserBillingRecord_userId_idx" ON "UserBillingRecord"("userId");
CREATE INDEX IF NOT EXISTS "UserBillingRecord_txRef_idx" ON "UserBillingRecord"("txRef");

-- AddForeignKey
ALTER TABLE "UserBillingRecord" ADD CONSTRAINT "UserBillingRecord_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
