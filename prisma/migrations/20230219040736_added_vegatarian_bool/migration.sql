-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FoodItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" INTEGER,
    "price" TEXT NOT NULL,
    "img" TEXT,
    "alt" TEXT,
    "vegetarian" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "FoodItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_FoodItem" ("active", "alt", "categoryId", "description", "id", "img", "name", "price") SELECT "active", "alt", "categoryId", "description", "id", "img", "name", "price" FROM "FoodItem";
DROP TABLE "FoodItem";
ALTER TABLE "new_FoodItem" RENAME TO "FoodItem";
CREATE UNIQUE INDEX "FoodItem_name_key" ON "FoodItem"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
