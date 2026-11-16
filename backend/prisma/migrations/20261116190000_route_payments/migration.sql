ALTER TABLE "EligibilityCase" ADD COLUMN "routeAccountId" TEXT;
CREATE TABLE "RoutePayment" (
    "id" TEXT PRIMARY KEY,
    "giverId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "caseId" TEXT NOT NULL REFERENCES "EligibilityCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "recipientAccount" TEXT NOT NULL,
    "amountPaise" INTEGER NOT NULL CHECK ("amountPaise" > 0),
    "providerOrderId" TEXT UNIQUE,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "receivedPaise" INTEGER NOT NULL DEFAULT 0 CHECK ("receivedPaise" >= 0 AND "receivedPaise" <= "amountPaise"),
    "receivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "RoutePayment_giverId_createdAt_idx" ON "RoutePayment"("giverId", "createdAt");
CREATE INDEX "RoutePayment_caseId_receivedAt_idx" ON "RoutePayment"("caseId", "receivedAt");
ALTER TABLE "RoutePayment" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "RoutePayment" FROM PUBLIC, anon, authenticated;
