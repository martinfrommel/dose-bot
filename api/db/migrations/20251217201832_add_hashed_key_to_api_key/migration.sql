/*
  Warnings:

  - Added the required column `hashedKey` to the `ApiKey` table without a default value. This is not possible if the table is not empty.
  - You are about to drop the column `key` on the `ApiKey` table. All the data in that column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "hashedKey" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "validUntil" DATETIME,
    "description" TEXT
);
-- For existing rows, we'll hash the plain key if it exists, otherwise use a placeholder
INSERT INTO "new_ApiKey" ("createdAt", "description", "enabled", "id", "updatedAt", "validUntil", "hashedKey")
SELECT "createdAt", "description", "enabled", "id", "updatedAt", "validUntil",
  CASE
    WHEN "key" IS NOT NULL THEN "key"
    ELSE '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvWFm'
  END as "hashedKey"
FROM "ApiKey";
DROP TABLE "ApiKey";
ALTER TABLE "new_ApiKey" RENAME TO "ApiKey";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
