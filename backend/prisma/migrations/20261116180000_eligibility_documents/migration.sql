CREATE TABLE "EligibilityDocument" (
    "caseId" TEXT PRIMARY KEY REFERENCES "EligibilityCase"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "contentType" TEXT NOT NULL,
    "content" BYTEA NOT NULL CHECK (octet_length("content") BETWEEN 1 AND 2097152)
);
ALTER TABLE "EligibilityDocument" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "EligibilityDocument" FROM PUBLIC, anon, authenticated;
