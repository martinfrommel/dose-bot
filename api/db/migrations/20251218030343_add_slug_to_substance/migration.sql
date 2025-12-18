/*
  Warnings:

  - Added the required column `slug` to the `Substance` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Substance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL
);
INSERT INTO "new_Substance" ("createdAt", "description", "id", "name", "updatedAt") SELECT "createdAt", "description", "id", "name", "updatedAt" FROM "Substance";
DROP TABLE "Substance";
ALTER TABLE "new_Substance" RENAME TO "Substance";
CREATE UNIQUE INDEX "Substance_slug_key" ON "Substance"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
