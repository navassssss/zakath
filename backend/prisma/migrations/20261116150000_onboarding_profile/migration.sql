CREATE TABLE "OnboardingProfile" (
    "userId" TEXT NOT NULL PRIMARY KEY REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "locality" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "householdSize" INTEGER NOT NULL CHECK ("householdSize" > 0),
    "monthlyIncomePaise" INTEGER NOT NULL CHECK ("monthlyIncomePaise" >= 0),
    "monthlyExpensesPaise" INTEGER NOT NULL CHECK ("monthlyExpensesPaise" >= 0),
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE "OnboardingProfile" ENABLE ROW LEVEL SECURITY;
