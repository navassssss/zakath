CREATE TABLE "CommitteeContribution" (
    "id" TEXT NOT NULL,
    "giverId" TEXT NOT NULL,
    "mahallId" TEXT NOT NULL,
    "amountPaise" INTEGER NOT NULL CHECK ("amountPaise" > 0),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    CONSTRAINT "CommitteeContribution_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CommitteeContribution_giverId_fkey" FOREIGN KEY ("giverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CommitteeContribution_mahallId_fkey" FOREIGN KEY ("mahallId") REFERENCES "Mahall"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "CommitteeContribution_giverId_createdAt_idx" ON "CommitteeContribution"("giverId", "createdAt");
CREATE INDEX "CommitteeContribution_mahallId_confirmedAt_idx" ON "CommitteeContribution"("mahallId", "confirmedAt");
ALTER TABLE "CommitteeContribution" ENABLE ROW LEVEL SECURITY;
