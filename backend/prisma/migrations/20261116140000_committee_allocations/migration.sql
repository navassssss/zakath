CREATE TABLE "CommitteeAllocation" (
    "id" TEXT NOT NULL,
    "mahallId" TEXT NOT NULL REFERENCES "Mahall"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "caseId" TEXT NOT NULL REFERENCES "EligibilityCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "amountPaise" INTEGER NOT NULL CHECK ("amountPaise" > 0),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    CONSTRAINT "CommitteeAllocation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CommitteeAllocation_mahallId_idx" ON "CommitteeAllocation"("mahallId");
CREATE INDEX "CommitteeAllocation_caseId_confirmedAt_idx" ON "CommitteeAllocation"("caseId", "confirmedAt");
ALTER TABLE "CommitteeAllocation" ENABLE ROW LEVEL SECURITY;
