/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Substance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,id,slug]` on the table `Substance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `substanceName` to the `Dose` table without a default value. This is not possible if the table is not empty.
  - Added the required column `substanceSlug` to the `Dose` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Substance_slug_key";

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
    "substanceName" TEXT NOT NULL,
    "substanceSlug" TEXT NOT NULL,
    CONSTRAINT "Dose_substanceId_substanceName_substanceSlug_fkey" FOREIGN KEY ("substanceId", "substanceName", "substanceSlug") REFERENCES "Substance" ("id", "name", "slug") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Dose" ("amount", "createdAt", "id", "substanceId", "unit", "updatedAt") SELECT "amount", "createdAt", "id", "substanceId", "unit", "updatedAt" FROM "Dose";
DROP TABLE "Dose";
ALTER TABLE "new_Dose" RENAME TO "Dose";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Substance_name_key" ON "Substance"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Substance_name_id_slug_key" ON "Substance"("name", "id", "slug");
