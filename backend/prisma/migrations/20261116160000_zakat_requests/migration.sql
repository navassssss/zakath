ALTER TABLE "EligibilityCase"
    ADD COLUMN "requestCategory" TEXT,
    ADD COLUMN "requestReason" TEXT,
    ADD COLUMN "requestedPaise" INTEGER CHECK ("requestedPaise" > 0),
    ADD COLUMN "shareIncome" BOOLEAN NOT NULL DEFAULT false;
