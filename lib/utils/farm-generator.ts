import { GeoJsonPolygon } from '@/lib/types'

class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next(): number {
    // LCG algorithm
    this.seed = (this.seed * 1664525 + 1013904223) % 2147483647
    return this.seed / 2147483647
  }

  nextFloat(min: number, max: number): number {
    return min + this.next() * (max - min)
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.nextFloat(min, max + 1))
  }

  choice<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)]
  }

  shuffle<T>(array: T[]): T[] {
    const result = [...array]
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i)
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }
}

interface FarmBounds {
  north: number
  south: number
  east: number
  west: number
  centerLat: number
  centerLng: number
}

export interface GeneratedBlock {
  name: string
  areaHa: number
  polygon: GeoJsonPolygon
}

export interface GeneratedFarm {
  name: string
  bounds: FarmBounds
  blocks: GeneratedBlock[]
}

export class FarmGenerator {
  private rng: SeededRandom

  constructor(seed: number = 42) {
    this.rng = new SeededRandom(seed)
  }

  generateFarm(
    centerLat: number = -35.2809,
    centerLng: number = 149.1300,
    blockCount: number = 15
  ): GeneratedFarm {
    // Australian farm in ACT region
    const farmNames = [
      'Willowbrook Farm',
      'Greenfield Estate',
      'Riverside Holdings',
      'Sunvalley Agricultural',
      'Blacksoil Plains',
    ]

    const farmName = this.rng.choice(farmNames)

    // Generate farm boundary (roughly 500-800 hectares total)
    const bounds = this.generateFarmBounds(centerLat, centerLng)

    // Generate blocks within the farm
    const blocks = this.generateBlocks(bounds, blockCount)

    return {
      name: farmName,
      bounds,
      blocks,
    }
  }

  private generateFarmBounds(centerLat: number, centerLng: number): FarmBounds {
    // Approximately 2-3km x 2-3km farm
    const latSpan = this.rng.nextFloat(0.018, 0.027) // ~2-3km in latitude
    const lngSpan = this.rng.nextFloat(0.022, 0.033) // ~2-3km in longitude

    return {
      north: centerLat + latSpan / 2,
      south: centerLat - latSpan / 2,
      east: centerLng + lngSpan / 2,
      west: centerLng - lngSpan / 2,
      centerLat,
      centerLng,
    }
  }

  private generateBlocks(bounds: FarmBounds, count: number): GeneratedBlock[] {
    const blocks: GeneratedBlock[] = []
    const blockNames = this.generateBlockNames(count)

    // Create a grid-based layout with some randomness
    const cols = Math.ceil(Math.sqrt(count))
    const rows = Math.ceil(count / cols)

    const latStep = (bounds.north - bounds.south) / rows
    const lngStep = (bounds.east - bounds.west) / cols

    let blockIndex = 0

    for (let row = 0; row < rows && blockIndex < count; row++) {
      for (let col = 0; col < cols && blockIndex < count; col++) {
        const baseLat = bounds.south + row * latStep
        const baseLng = bounds.west + col * lngStep

        // Add some randomness to block size and position
        const jitterLat = this.rng.nextFloat(-0.001, 0.001)
        const jitterLng = this.rng.nextFloat(-0.001, 0.001)

        const blockLat = baseLat + jitterLat
        const blockLng = baseLng + jitterLng

        // Generate block polygon
        const polygon = this.generateBlockPolygon(
          blockLat,
          blockLng,
          latStep * 0.8, // Leave some space between blocks
          lngStep * 0.8
        )

        // Calculate area (20-60 hectares per block)
        const areaHa = this.rng.nextFloat(20, 60)

        blocks.push({
          name: blockNames[blockIndex],
          areaHa: Math.round(areaHa * 100) / 100,
          polygon,
        })

        blockIndex++
      }
    }

    return blocks
  }

  private generateBlockPolygon(
    centerLat: number,
    centerLng: number,
    latSize: number,
    lngSize: number
  ): GeoJsonPolygon {
    // Create an irregular quadrilateral
    const corners: number[][] = []

    // Add some irregularity to each corner
    const irregularity = 0.15

    // Top-left
    corners.push([
      centerLng - lngSize / 2 + this.rng.nextFloat(-irregularity, irregularity) * lngSize,
      centerLat + latSize / 2 + this.rng.nextFloat(-irregularity, irregularity) * latSize,
    ])

    // Top-right
    corners.push([
      centerLng + lngSize / 2 + this.rng.nextFloat(-irregularity, irregularity) * lngSize,
      centerLat + latSize / 2 + this.rng.nextFloat(-irregularity, irregularity) * latSize,
    ])

    // Bottom-right
    corners.push([
      centerLng + lngSize / 2 + this.rng.nextFloat(-irregularity, irregularity) * lngSize,
      centerLat - latSize / 2 + this.rng.nextFloat(-irregularity, irregularity) * latSize,
    ])

    // Bottom-left
    corners.push([
      centerLng - lngSize / 2 + this.rng.nextFloat(-irregularity, irregularity) * lngSize,
      centerLat - latSize / 2 + this.rng.nextFloat(-irregularity, irregularity) * latSize,
    ])

    // Close the polygon
    corners.push(corners[0])

    return {
      type: 'Polygon',
      coordinates: [corners],
    }
  }

  private generateBlockNames(count: number): string[] {
    const prefixes = ['North', 'South', 'East', 'West', 'Upper', 'Lower', 'Middle']
    const suffixes = ['Field', 'Paddock', 'Block', 'Patch', 'Section']
    const features = ['Hill', 'Creek', 'Dam', 'Road', 'Boundary', 'Corner', 'Ridge']

    const names: string[] = []
    const usedNames = new Set<string>()

    // Generate some numbered blocks
    for (let i = 1; i <= Math.min(count / 2, 8); i++) {
      names.push(`Block ${i}`)
    }

    // Generate named blocks
    while (names.length < count) {
      let name: string

      if (this.rng.next() > 0.5) {
        // Prefix + Suffix style
        const prefix = this.rng.choice(prefixes)
        const suffix = this.rng.choice(suffixes)
        name = `${prefix} ${suffix}`
      } else {
        // Feature + Suffix style
        const feature = this.rng.choice(features)
        const suffix = this.rng.choice(suffixes)
        name = `${feature} ${suffix}`
      }

      if (!usedNames.has(name)) {
        usedNames.add(name)
        names.push(name)
      }
    }

    return this.rng.shuffle(names).slice(0, count)
  }
}

export class WeatherGenerator {
  private rng: SeededRandom

  constructor(seed: number = 42) {
    this.rng = new SeededRandom(seed)
  }

  generateCurrentConditions() {
    return {
      windKph: this.rng.nextFloat(5, 25),
      windDirDeg: this.rng.nextInt(0, 359),
      tempC: this.rng.nextFloat(10, 35),
      rhPct: this.rng.nextInt(30, 85),
    }
  }

  generateForecast(hours: number = 24) {
    const forecast = []
    const base = this.generateCurrentConditions()

    for (let h = 0; h < hours; h++) {
      // Random walk from base conditions
      const conditions = {
        hour: h,
        windKph: Math.max(
          0,
          Math.min(40, base.windKph + this.rng.nextFloat(-5, 5))
        ),
        windDirDeg: (base.windDirDeg + this.rng.nextInt(-30, 30) + 360) % 360,
        tempC: Math.max(
          5,
          Math.min(40, base.tempC + this.rng.nextFloat(-3, 3))
        ),
        rhPct: Math.max(
          20,
          Math.min(95, base.rhPct + this.rng.nextInt(-10, 10))
        ),
      }
      forecast.push(conditions)

      // Update base for next iteration
      base.windKph = conditions.windKph
      base.windDirDeg = conditions.windDirDeg
      base.tempC = conditions.tempC
      base.rhPct = conditions.rhPct
    }

    return forecast
  }
}

export class SensorSimulator {
  private rng: SeededRandom
  private baseConditions: any

  constructor(seed: number = 42) {
    this.rng = new SeededRandom(seed)
    const weatherGen = new WeatherGenerator(seed)
    this.baseConditions = weatherGen.generateCurrentConditions()
  }

  generateReading(deviceType: string) {
    const reading: any = {
      timestamp: new Date().toISOString(),
    }

    switch (deviceType) {
      case 'wind':
        reading.windKph = Math.max(
          0,
          this.baseConditions.windKph + this.rng.nextFloat(-3, 3)
        )
        reading.windDirDeg =
          (this.baseConditions.windDirDeg + this.rng.nextInt(-15, 15) + 360) % 360
        break

      case 'humidity':
        reading.rhPct = Math.max(
          20,
          Math.min(95, this.baseConditions.rhPct + this.rng.nextInt(-5, 5))
        )
        reading.tempC = Math.max(
          5,
          Math.min(40, this.baseConditions.tempC + this.rng.nextFloat(-2, 2))
        )
        break

      case 'nozzle':
        reading.nozzlePressure = this.rng.nextFloat(200, 400) // kPa
        reading.flowRate = this.rng.nextFloat(0.5, 2.0) // L/min
        reading.dropletSize = this.rng.choice(['Fine', 'Medium', 'Coarse'])
        break

      case 'driftSampler':
        // Calculate drift risk based on conditions
        const crossWind = Math.abs(Math.sin((this.baseConditions.windDirDeg * Math.PI) / 180))
        const windFactor = this.baseConditions.windKph * crossWind * 4
        const tempFactor = this.baseConditions.tempC > 30 ? 10 : 0
        const rhFactor = this.baseConditions.rhPct < 40 ? 15 : 0
        reading.driftRisk = Math.min(100, windFactor + tempFactor + rhFactor)
        reading.detectedParticles = this.rng.nextInt(0, 100)
        break
    }

    return reading
  }

  updateBaseConditions() {
    // Gradual random walk
    this.baseConditions.windKph = Math.max(
      0,
      Math.min(40, this.baseConditions.windKph + this.rng.nextFloat(-1, 1))
    )
    this.baseConditions.windDirDeg =
      (this.baseConditions.windDirDeg + this.rng.nextInt(-5, 5) + 360) % 360
    this.baseConditions.tempC = Math.max(
      5,
      Math.min(40, this.baseConditions.tempC + this.rng.nextFloat(-0.5, 0.5))
    )
    this.baseConditions.rhPct = Math.max(
      20,
      Math.min(95, this.baseConditions.rhPct + this.rng.nextInt(-2, 2))
    )
  }
}