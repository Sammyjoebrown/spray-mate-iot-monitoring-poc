import { z } from 'zod'

// Job Schemas
export const createJobSchema = z.object({
  blockId: z.string(),
  tankMixId: z.string(),
  operator: z.string(),
  plannedStart: z.string().datetime(),
  plannedWindKph: z.number().min(0).max(50),
  plannedWindDirDeg: z.number().min(0).max(359),
  plannedTempC: z.number().min(-10).max(50),
  plannedRH: z.number().min(0).max(100),
  plannedBoomWidthM: z.number().min(1).max(50),
  plannedSpeedKph: z.number().min(1).max(30),
})

export const startJobSchema = z.object({
  actualWindKph: z.number().min(0).max(50),
  actualWindDirDeg: z.number().min(0).max(359),
  actualTempC: z.number().min(-10).max(50),
  actualRH: z.number().min(0).max(100),
})

export const completeJobEventSchema = z.object({
  actualEnd: z.string().datetime(),
  areaTreatedHa: z.number().positive(),
  nozzleClass: z.string(),
  outcome: z.enum(['completed', 'aborted']),
  notes: z.string().optional(),
})

// Inventory Schemas
export const receiptSchema = z.object({
  lotId: z.string(),
  quantity: z.number().positive(),
  notes: z.string().optional(),
})

export const adjustmentSchema = z.object({
  lotId: z.string(),
  quantity: z.number(),
  reason: z.string(),
})

// Tank Mix Schemas
export const tankMixLineSchema = z.object({
  productId: z.string(),
  ratePerHa: z.number().positive(),
  rateUnit: z.string(),
  isActiveIngredientRate: z.boolean(),
})

export const createTankMixSchema = z.object({
  name: z.string(),
  lines: z.array(tankMixLineSchema),
  waterRatePerHaL: z.number().positive(),
})

// Sensor Schemas
export const deploySensorSchema = z.object({
  blockId: z.string().optional(),
  type: z.enum(['wind', 'humidity', 'nozzle', 'driftSampler']),
  lat: z.number(),
  lng: z.number(),
})

export const sensorReadingSchema = z.object({
  deviceId: z.string(),
  payload: z.record(z.any()),
})

// Simulation Schemas
export const previewSimulationSchema = z.object({
  blockId: z.string(),
  mixId: z.string(),
  windKph: z.number().optional(),
  windDirDeg: z.number().optional(),
  tempC: z.number().optional(),
  rhPct: z.number().optional(),
})

// Stock Take Schemas
export const stockTakeSchema = z.object({
  date: z.string().datetime(),
})