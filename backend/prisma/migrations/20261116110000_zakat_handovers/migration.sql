CREATE TABLE "ZakatHandover" (
    "id" TEXT NOT NULL,
    "giverId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "amountPaise" INTEGER NOT NULL CHECK ("amountPaise" > 0),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    CONSTRAINT "ZakatHandover_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ZakatHandover_giverId_fkey" FOREIGN KEY ("giverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ZakatHandover_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "EligibilityCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "ZakatHandover_giverId_createdAt_idx" ON "ZakatHandover"("giverId", "createdAt");
CREATE INDEX "ZakatHandover_caseId_confirmedAt_idx" ON "ZakatHandover"("caseId", "confirmedAt");
ALTER TABLE "ZakatHandover" ENABLE ROW LEVEL SECURITY;
