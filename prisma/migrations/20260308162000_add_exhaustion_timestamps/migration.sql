-- AddColumn creditsExhaustedAt to User
ALTER TABLE "User" ADD COLUMN "creditsExhaustedAt" TIMESTAMP(3);

-- AddColumn tokensExhaustedAt to Organization
ALTER TABLE "Organization" ADD COLUMN "tokensExhaustedAt" TIMESTAMP(3);
