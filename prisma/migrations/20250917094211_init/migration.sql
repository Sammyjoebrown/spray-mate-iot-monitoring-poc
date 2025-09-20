-- CreateTable
CREATE TABLE "Farm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Block" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "farmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "areaHa" DECIMAL NOT NULL,
    "polygon" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Block_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChemicalProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "formulation" TEXT NOT NULL,
    "concentrationPct" DECIMAL NOT NULL,
    "unit" TEXT NOT NULL,
    "densityKgPerL" DECIMAL,
    "label" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InventoryLot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "batch" TEXT NOT NULL,
    "openingQty" DECIMAL NOT NULL,
    "qtyUnit" TEXT NOT NULL,
    "receivedQty" DECIMAL NOT NULL DEFAULT 0,
    "adjustments" DECIMAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InventoryLot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ChemicalProduct" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TankMix" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "lines" TEXT NOT NULL,
    "waterRatePerHaL" DECIMAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SprayJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blockId" TEXT NOT NULL,
    "tankMixId" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "plannedStart" DATETIME NOT NULL,
    "plannedWindKph" DECIMAL NOT NULL,
    "plannedWindDirDeg" INTEGER NOT NULL,
    "plannedTempC" DECIMAL NOT NULL,
    "plannedRH" INTEGER NOT NULL,
    "plannedBoomWidthM" DECIMAL NOT NULL,
    "plannedSpeedKph" DECIMAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SprayJob_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SprayJob_tankMixId_fkey" FOREIGN KEY ("tankMixId") REFERENCES "TankMix" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SprayApplicationEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "actualStart" DATETIME NOT NULL,
    "actualEnd" DATETIME NOT NULL,
    "actualWindKph" DECIMAL NOT NULL,
    "actualWindDirDeg" INTEGER NOT NULL,
    "actualTempC" DECIMAL NOT NULL,
    "actualRH" INTEGER NOT NULL,
    "areaTreatedHa" DECIMAL NOT NULL,
    "nozzleClass" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SprayApplicationEvent_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "SprayJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SensorDevice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blockId" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "pose" TEXT NOT NULL,
    "deployedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SensorDevice_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SensorReading" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deviceId" TEXT NOT NULL,
    "ts" DATETIME NOT NULL,
    "payload" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SensorReading_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "SensorDevice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeatherSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "farmId" TEXT NOT NULL,
    "ts" DATETIME NOT NULL,
    "windKph" DECIMAL NOT NULL,
    "windDirDeg" INTEGER NOT NULL,
    "tempC" DECIMAL NOT NULL,
    "rhPct" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WeatherSnapshot_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StockTake" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "atEndOfDayDate" DATETIME NOT NULL,
    "computedLines" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SeasonalActiveIngredient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blockId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "aiGrams" DECIMAL NOT NULL,
    "season" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ChemicalProduct_name_key" ON "ChemicalProduct"("name");

-- CreateIndex
CREATE INDEX "InventoryLot_productId_idx" ON "InventoryLot"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "TankMix_name_key" ON "TankMix"("name");

-- CreateIndex
CREATE INDEX "SprayJob_blockId_idx" ON "SprayJob"("blockId");

-- CreateIndex
CREATE INDEX "SprayJob_tankMixId_idx" ON "SprayJob"("tankMixId");

-- CreateIndex
CREATE INDEX "SprayApplicationEvent_jobId_idx" ON "SprayApplicationEvent"("jobId");

-- CreateIndex
CREATE INDEX "SensorDevice_blockId_idx" ON "SensorDevice"("blockId");

-- CreateIndex
CREATE INDEX "SensorReading_deviceId_idx" ON "SensorReading"("deviceId");

-- CreateIndex
CREATE INDEX "SensorReading_ts_idx" ON "SensorReading"("ts");

-- CreateIndex
CREATE INDEX "WeatherSnapshot_farmId_idx" ON "WeatherSnapshot"("farmId");

-- CreateIndex
CREATE INDEX "WeatherSnapshot_ts_idx" ON "WeatherSnapshot"("ts");

-- CreateIndex
CREATE UNIQUE INDEX "StockTake_atEndOfDayDate_key" ON "StockTake"("atEndOfDayDate");

-- CreateIndex
CREATE INDEX "SeasonalActiveIngredient_blockId_idx" ON "SeasonalActiveIngredient"("blockId");

-- CreateIndex
CREATE UNIQUE INDEX "SeasonalActiveIngredient_blockId_productId_season_key" ON "SeasonalActiveIngredient"("blockId", "productId", "season");
