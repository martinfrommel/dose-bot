-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Dose" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'G',
    "substanceId" TEXT NOT NULL,
    CONSTRAINT "Dose_substanceId_fkey" FOREIGN KEY ("substanceId") REFERENCES "Substance" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Dose" ("amount", "createdAt", "id", "substanceId", "unit", "updatedAt") SELECT "amount", "createdAt", "id", "substanceId", "unit", "updatedAt" FROM "Dose";
DROP TABLE "Dose";
ALTER TABLE "new_Dose" RENAME TO "Dose";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
