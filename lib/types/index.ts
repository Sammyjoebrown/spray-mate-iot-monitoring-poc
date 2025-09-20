import { Decimal } from 'decimal.js'

export interface LabelRuleSet {
  maxWindKph?: number
  disallowedWindDirDeg?: number[]
  bufferZones?: Array<{
    type: 'water' | 'sensitive' | 'organic'
    minDistanceM: number
  }>
  reentryHours?: number
  preHarvestDays?: number
  maxSeasonalGaiPerHa?: number
  maxApplicationsPerSeason?: number
  minRainfreePeriodHours?: number
  temperatureRange?: {
    minC?: number
    maxC?: number
  }
  relativeHumidityRange?: {
    minPct?: number
    maxPct?: number
  }
}

export interface TankMixLine {
  productId: string
  ratePerHa: number
  rateUnit: string
  isActiveIngredientRate: boolean
}

export interface StockTakeLine {
  productId: string
  productName: string
  openingQty: number
  receipts: number
  usage: number
  wastage: number
  adjustments: number
  closingQty: number
  unit: string
}

export interface SensorPayload {
  windKph?: number
  windDirDeg?: number
  tempC?: number
  rhPct?: number
  driftRisk?: number
  nozzlePressure?: number
  flowRate?: number
}

export interface DriftRiskFactors {
  windSpeed: number
  crossWindComponent: number
  temperature: number
  relativeHumidity: number
  nozzleType: string
  boomHeight: number
}

export interface RuleViolation {
  code: string
  severity: 'block' | 'warn' | 'info'
  message: string
  remediation?: string
  value?: any
  limit?: any
}

export interface RuleCheckResult {
  passes: boolean
  violations: RuleViolation[]
}

export interface SafeWindow {
  startTime: Date
  endTime: Date
  riskScore: number
  conditions: {
    windKph: number
    windDirDeg: number
    tempC: number
    rhPct: number
  }
}

export interface SimulationResult {
  blockId: string
  tankMixId: string
  timestamp: Date
  gridPoints: Array<{
    lat: number
    lng: number
    riskScore: number
  }>
  safeWindows: SafeWindow[]
  averageRisk: number
  maxRisk: number
}

export interface Position {
  lat: number
  lng: number
}

export interface GeoJsonPolygon {
  type: 'Polygon'
  coordinates: number[][][]
}

export interface BlockColourCode {
  status: 'clear' | 'rei_active' | 'phi_warning' | 'buffer_conflict'
  colour: string
  message: string
  daysSinceSpray?: number
  daysUntilHarvest?: number
}

export interface MixingInstruction {
  step: number
  action: string
  product?: string
  amount?: number
  unit?: string
  safety?: string[]
}

export interface PPERequirement {
  item: string
  required: boolean
  when: string[]
}