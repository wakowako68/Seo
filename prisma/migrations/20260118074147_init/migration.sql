-- CreateTable
CREATE TABLE "AuditReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "authorityScore" INTEGER NOT NULL,
    "verdict" TEXT NOT NULL,
    "executiveSummary" TEXT NOT NULL,
    "fullAnalysis" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
