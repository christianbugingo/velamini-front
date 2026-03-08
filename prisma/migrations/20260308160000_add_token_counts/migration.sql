-- Add token tracking columns to Organization
ALTER TABLE "Organization" ADD COLUMN "monthlyTokenLimit" INTEGER NOT NULL DEFAULT 200000;
ALTER TABLE "Organization" ADD COLUMN "monthlyTokenCount" INTEGER NOT NULL DEFAULT 0;

-- Add token tracking columns to User
ALTER TABLE "User" ADD COLUMN "personalMonthlyTokenCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "personalMonthlyTokenLimit" INTEGER NOT NULL DEFAULT 400000;
