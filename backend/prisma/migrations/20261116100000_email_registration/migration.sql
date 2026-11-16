ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;

CREATE TABLE "PendingEmailRegistration" (
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PendingEmailRegistration_pkey" PRIMARY KEY ("email")
);

CREATE UNIQUE INDEX "PendingEmailRegistration_tokenHash_key" ON "PendingEmailRegistration"("tokenHash");
ALTER TABLE "PendingEmailRegistration" ENABLE ROW LEVEL SECURITY;
