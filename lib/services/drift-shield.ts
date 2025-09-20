import { DriftRiskFactors, SafeWindow, SimulationResult } from '@/lib/types'
import { WeatherGenerator } from '@/lib/utils/farm-generator'

export interface DriftConditions {
  windKph: number
  windDirDeg: number
  tempC: number
  rhPct: number
  boomHeading: number // Direction the boom is facing (0-359)
  boomWidthM: number
  boomHeightM: number
  nozzleType: 'Fine' | 'Medium' | 'Coarse' | 'VeryCoarse'
  sprayPressureKpa: number
}

export interface DriftRiskResult {
  riskScore: number // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  factors: {
    windRisk: number
    crossWindRisk: number
    temperatureRisk: number
    humidityRisk: number
    nozzleRisk: number
    heightRisk: number
  }
  recommendations: string[]
}

export class DriftShield {
  private static readonly RISK_THRESHOLDS = {
    low: 30,
    medium: 50,
    high: 70,
    critical: 85,
  }

  private static readonly NOZZLE_FACTORS = {
    Fine: 1.5,
    Medium: 1.0,
    Coarse: 0.7,
    VeryCoarse: 0.5,
  }

  static calculateDriftRisk(conditions: DriftConditions): DriftRiskResult {
    const factors = this.calculateRiskFactors(conditions)

    // Weighted combination of risk factors
    const weights = {
      wind: 0.25,
      crossWind: 0.25,
      temperature: 0.15,
      humidity: 0.15,
      nozzle: 0.1,
      height: 0.1,
    }

    const riskScore = Math.min(
      100,
      Math.round(
        factors.windRisk * weights.wind +
        factors.crossWindRisk * weights.crossWind +
        factors.temperatureRisk * weights.temperature +
        factors.humidityRisk * weights.humidity +
        factors.nozzleRisk * weights.nozzle +
        factors.heightRisk * weights.height
      )
    )

    const riskLevel = this.getRiskLevel(riskScore)
    const recommendations = this.generateRecommendations(factors, conditions)

    return {
      riskScore,
      riskLevel,
      factors,
      recommendations,
    }
  }

  private static calculateRiskFactors(conditions: DriftConditions) {
    // Wind speed risk (exponential increase above 15 km/h)
    let windRisk = 0
    if (conditions.windKph < 3) {
      windRisk = 10 // Inversion risk
    } else if (conditions.windKph <= 15) {
      windRisk = (conditions.windKph / 15) * 40
    } else {
      windRisk = 40 + Math.min(60, Math.pow((conditions.windKph - 15) / 10, 2) * 60)
    }

    // Cross-wind component risk
    const crossWindAngle = Math.abs(
      Math.sin(((conditions.windDirDeg - conditions.boomHeading) * Math.PI) / 180)
    )
    const crossWindSpeed = conditions.windKph * crossWindAngle
    const crossWindRisk = Math.min(100, crossWindSpeed * 5)

    // Temperature risk (high temp = high evaporation)
    let temperatureRisk = 0
    if (conditions.tempC > 30) {
      temperatureRisk = Math.min(80, (conditions.tempC - 30) * 10)
    } else if (conditions.tempC > 25) {
      temperatureRisk = (conditions.tempC - 25) * 4
    }

    // Humidity risk (low humidity = high evaporation)
    let humidityRisk = 0
    if (conditions.rhPct < 30) {
      humidityRisk = Math.min(80, (30 - conditions.rhPct) * 3)
    } else if (conditions.rhPct < 45) {
      humidityRisk = (45 - conditions.rhPct) * 1.5
    }

    // Nozzle type risk
    const nozzleRisk = this.NOZZLE_FACTORS[conditions.nozzleType] * 40

    // Boom height risk (higher = more drift)
    const heightRisk = Math.min(60, (conditions.boomHeightM - 0.5) * 30)

    return {
      windRisk: Math.round(windRisk),
      crossWindRisk: Math.round(crossWindRisk),
      temperatureRisk: Math.round(temperatureRisk),
      humidityRisk: Math.round(humidityRisk),
      nozzleRisk: Math.round(nozzleRisk),
      heightRisk: Math.round(heightRisk),
    }
  }

  private static getRiskLevel(
    score: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= this.RISK_THRESHOLDS.critical) return 'critical'
    if (score >= this.RISK_THRESHOLDS.high) return 'high'
    if (score >= this.RISK_THRESHOLDS.medium) return 'medium'
    return 'low'
  }

  private static generateRecommendations(
    factors: DriftRiskResult['factors'],
    conditions: DriftConditions
  ): string[] {
    const recommendations: string[] = []

    // Wind recommendations
    if (factors.windRisk > 60) {
      recommendations.push(`Delay spraying - wind speed ${conditions.windKph} km/h is too high`)
    } else if (factors.windRisk > 40) {
      recommendations.push('Consider delaying until calmer conditions')
    }

    // Cross-wind recommendations
    if (factors.crossWindRisk > 60) {
      const optimalHeading = (conditions.windDirDeg + 90) % 360
      recommendations.push(
        `Rotate boom to ${optimalHeading}° to minimise cross-wind component`
      )
    }

    // Temperature recommendations
    if (factors.temperatureRisk > 40) {
      recommendations.push(
        'High evaporation risk - consider spraying in cooler conditions'
      )
    }

    // Humidity recommendations
    if (factors.humidityRisk > 40) {
      recommendations.push('Low humidity increases drift risk - add drift retardant')
    }

    // Nozzle recommendations
    if (factors.nozzleRisk > 40 && conditions.nozzleType !== 'VeryCoarse') {
      recommendations.push('Switch to coarser droplet nozzles to reduce drift')
    }

    // Height recommendations
    if (factors.heightRisk > 30) {
      recommendations.push('Lower boom height to minimum safe clearance')
    }

    // Inversion risk
    if (conditions.windKph < 3 && conditions.tempC < 15) {
      recommendations.push('⚠️ Temperature inversion likely - avoid spraying')
    }

    return recommendations
  }

  static async runMicroSimulation(
    blockId: string,
    baseConditions: DriftConditions,
    durationMinutes: number = 10
  ): Promise<SimulationResult> {
    const weatherGen = new WeatherGenerator(Date.now())
    const gridPoints: SimulationResult['gridPoints'] = []
    const safeWindows: SafeWindow[] = []

    // Create a 5x5 grid across the block
    const gridSize = 5
    const latStep = 0.001
    const lngStep = 0.001

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const lat = -35.28 + i * latStep
        const lng = 149.13 + j * lngStep

        // Simulate conditions with variations
        const windVariation = Math.random() * 4 - 2
        const dirVariation = Math.random() * 20 - 10

        const conditions: DriftConditions = {
          ...baseConditions,
          windKph: Math.max(0, baseConditions.windKph + windVariation),
          windDirDeg: (baseConditions.windDirDeg + dirVariation + 360) % 360,
        }

        const risk = this.calculateDriftRisk(conditions)
        gridPoints.push({
          lat,
          lng,
          riskScore: risk.riskScore,
        })
      }
    }

    // Find safe windows in the next 3 hours
    const forecast = weatherGen.generateForecast(3)

    for (const hour of forecast) {
      const startTime = new Date()
      startTime.setHours(startTime.getHours() + hour.hour)

      const endTime = new Date(startTime)
      endTime.setMinutes(endTime.getMinutes() + 15)

      const conditions: DriftConditions = {
        ...baseConditions,
        windKph: hour.windKph,
        windDirDeg: hour.windDirDeg,
        tempC: hour.tempC,
        rhPct: hour.rhPct,
      }

      const risk = this.calculateDriftRisk(conditions)

      if (risk.riskLevel === 'low' || risk.riskLevel === 'medium') {
        safeWindows.push({
          startTime,
          endTime,
          riskScore: risk.riskScore,
          conditions: {
            windKph: hour.windKph,
            windDirDeg: hour.windDirDeg,
            tempC: hour.tempC,
            rhPct: hour.rhPct,
          },
        })
      }
    }

    // Sort safe windows by risk score
    safeWindows.sort((a, b) => a.riskScore - b.riskScore)

    // Calculate average and max risk
    const avgRisk =
      gridPoints.reduce((sum, p) => sum + p.riskScore, 0) / gridPoints.length
    const maxRisk = Math.max(...gridPoints.map(p => p.riskScore))

    return {
      blockId,
      tankMixId: '', // Will be set by caller
      timestamp: new Date(),
      gridPoints,
      safeWindows: safeWindows.slice(0, 5), // Return top 5 safe windows
      averageRisk: Math.round(avgRisk),
      maxRisk,
    }
  }

  static calculateCrossWindComponent(
    windSpeed: number,
    windDirection: number,
    boomHeading: number
  ): number {
    const angle = Math.abs(windDirection - boomHeading)
    const effectiveAngle = angle > 180 ? 360 - angle : angle
    return windSpeed * Math.sin((effectiveAngle * Math.PI) / 180)
  }

  static getWindDirectionName(degrees: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                       'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    const index = Math.round(((degrees % 360) / 22.5)) % 16
    return directions[index]
  }
}
