-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('UAH', 'USD', 'EUR');

-- CreateTable
CREATE TABLE "ShopSettings" (
  "id" TEXT NOT NULL DEFAULT 'global',
  "storeName" TEXT NOT NULL DEFAULT 'SashaShop',
  "supportEmail" TEXT NOT NULL DEFAULT 'support@sashashop.com',
  "supportPhone" TEXT NOT NULL DEFAULT '+380 (99) 111-22-33',
  "managerTelegram" TEXT NOT NULL DEFAULT '@sashashop_manager',
  "seoDescription" TEXT NOT NULL DEFAULT 'Магазин преміальних моторних олив та фільтрів.',
  "currency" "Currency" NOT NULL DEFAULT 'UAH',
  "timezone" TEXT NOT NULL DEFAULT 'Europe/Kyiv',
  "orderPrefix" TEXT NOT NULL DEFAULT 'SS',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ShopSettings_pkey" PRIMARY KEY ("id")
);
