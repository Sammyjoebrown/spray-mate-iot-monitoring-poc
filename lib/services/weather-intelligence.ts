import { Decimal } from 'decimal.js'

export interface MicroclimateData {
  id: string
  blockId: string
  timestamp: Date
  airTemp: number
  soilTemp: number
  leafWetness: number
  solarRadiation: number
  evapotranspiration: number
  dewPoint: number
  deltaT: number // Temperature inversion indicator
  cumulativeGDD: number // Growing Degree Days
  chillHours: number
}

export interface WeatherAlert {
  id: string
  severity: 'info' | 'warning' | 'critical'
  type: string
  message: string
  startTime: Date
  endTime: Date
  affectedBlocks: string[]
  recommendations: string[]
}

export interface SprayWeatherWindow {
  id: string
  blockId: string
  startTime: Date
  endTime: Date
  confidence: number
  conditions: {
    avgWindSpeed: number
    maxWindGust: number
    temperature: number
    humidity: number
    deltaT: number
    precipitationRisk: number
  }
  suitability: {
    herbicide: number
    insecticide: number
    fungicide: number
    fertilizer: number
  }
  limitations: string[]
}

export class WeatherIntelligence {
  // Delta T calculation for temperature inversion risk
  static calculateDeltaT(dryBulb: number, wetBulb: number): number {
    return new Decimal(dryBulb).minus(wetBulb).toNumber()
  }

  // Growing Degree Days calculation
  static calculateGDD(
    maxTemp: number,
    minTemp: number,
    baseTemp: number = 10,
    upperThreshold: number = 30
  ): number {
    const max = Math.min(maxTemp, upperThreshold)
    const min = Math.max(minTemp, baseTemp)
    const avg = (max + min) / 2
    return Math.max(0, avg - baseTemp)
  }

  // Evapotranspiration using Penman-Monteith equation (simplified)
  static calculateET0(
    solarRadiation: number,
    windSpeed: number,
    temperature: number,
    humidity: number,
    elevation: number = 100
  ): number {
    // Simplified ET0 calculation
    const P = 101.3 * Math.pow((293 - 0.0065 * elevation) / 293, 5.26)
    const gamma = 0.000665 * P
    const delta = 4098 * (0.6108 * Math.exp(17.27 * temperature / (temperature + 237.3))) /
                  Math.pow(temperature + 237.3, 2)
    const es = 0.6108 * Math.exp(17.27 * temperature / (temperature + 237.3))
    const ea = es * (humidity / 100)
    const netRadiation = solarRadiation * 0.77 // Approximate net radiation

    const ET0 = (0.408 * delta * netRadiation + gamma * (900 / (temperature + 273)) *
                windSpeed * (es - ea)) / (delta + gamma * (1 + 0.34 * windSpeed))

    return Math.max(0, ET0)
  }

  // Disease pressure index based on weather conditions
  static calculateDiseasePressure(
    temperature: number,
    humidity: number,
    leafWetnessDuration: number,
    pathogenType: 'fungal' | 'bacterial' | 'viral'
  ): number {
    let pressure = 0

    switch (pathogenType) {
      case 'fungal':
        // Optimal conditions: 15-25°C, >85% RH, >6h leaf wetness
        if (temperature >= 15 && temperature <= 25) pressure += 40
        else if (temperature >= 10 && temperature <= 30) pressure += 20

        if (humidity >= 85) pressure += 30
        else if (humidity >= 70) pressure += 15

        if (leafWetnessDuration >= 6) pressure += 30
        else if (leafWetnessDuration >= 3) pressure += 15
        break

      case 'bacterial':
        // Optimal: 25-30°C, >80% RH, wounds/rain
        if (temperature >= 25 && temperature <= 30) pressure += 40
        else if (temperature >= 20 && temperature <= 35) pressure += 20

        if (humidity >= 80) pressure += 30
        else if (humidity >= 65) pressure += 15

        if (leafWetnessDuration >= 4) pressure += 30
        else if (leafWetnessDuration >= 2) pressure += 15
        break

      case 'viral':
        // Vector activity based
        if (temperature >= 20 && temperature <= 30) pressure += 50
        else if (temperature >= 15 && temperature <= 35) pressure += 25

        if (humidity <= 60) pressure += 25 // Dry conditions favor aphids
        if (windSpeed < 10) pressure += 25 // Calm conditions for vectors
        break
    }

    return Math.min(100, pressure)
  }

  // Precipitation probability based on atmospheric conditions
  static calculatePrecipitationProbability(
    pressure: number,
    pressureTrend: number,
    humidity: number,
    cloudCover: number,
    temperature: number,
    dewPoint: number
  ): number {
    let probability = 0

    // Pressure factors
    if (pressure < 1010) probability += 20
    if (pressureTrend < -2) probability += 20 // Falling rapidly

    // Humidity factors
    if (humidity > 80) probability += 20
    if (humidity > 90) probability += 15

    // Cloud cover
    probability += cloudCover * 0.3

    // Temperature-dewpoint spread
    const spread = temperature - dewPoint
    if (spread < 3) probability += 20
    if (spread < 1) probability += 15

    return Math.min(100, probability)
  }

  // Find optimal spray windows using multiple factors
  static findOptimalSprayWindows(
    forecast: any[],
    productType: string,
    blockMicroclimate: MicroclimateData[],
    bufferHours: number = 1
  ): SprayWeatherWindow[] {
    const windows: SprayWeatherWindow[] = []

    for (let i = 0; i < forecast.length - bufferHours; i++) {
      const window = this.evaluateSprayWindow(
        forecast.slice(i, i + bufferHours + 1),
        productType,
        blockMicroclimate
      )

      if (window && window.confidence > 60) {
        windows.push(window)
      }
    }

    // Sort by confidence
    return windows.sort((a, b) => b.confidence - a.confidence).slice(0, 10)
  }

  private static evaluateSprayWindow(
    hourlyData: any[],
    productType: string,
    microclimate: MicroclimateData[]
  ): SprayWeatherWindow | null {
    const avgConditions = this.averageConditions(hourlyData)
    const deltaT = this.calculateDeltaT(avgConditions.temp, avgConditions.temp - 2)

    // Check for inversions
    if (deltaT < 2 || deltaT > 8) {
      return null // Poor conditions
    }

    const suitability = {
      herbicide: this.calculateHerbicideSuitability(avgConditions, deltaT),
      insecticide: this.calculateInsecticideSuitability(avgConditions, deltaT),
      fungicide: this.calculateFungicideSuitability(avgConditions, deltaT),
      fertilizer: this.calculateFertilizerSuitability(avgConditions, deltaT),
    }

    const confidence = this.calculateWindowConfidence(avgConditions, deltaT, suitability)

    return {
      id: `window-${Date.now()}`,
      blockId: '',
      startTime: new Date(hourlyData[0].time),
      endTime: new Date(hourlyData[hourlyData.length - 1].time),
      confidence,
      conditions: {
        avgWindSpeed: avgConditions.windSpeed,
        maxWindGust: Math.max(...hourlyData.map(h => h.windGust || h.windSpeed)),
        temperature: avgConditions.temp,
        humidity: avgConditions.humidity,
        deltaT,
        precipitationRisk: avgConditions.precipRisk,
      },
      suitability,
      limitations: this.identifyLimitations(avgConditions, deltaT),
    }
  }

  private static averageConditions(hourlyData: any[]) {
    const sum = hourlyData.reduce((acc, h) => ({
      windSpeed: acc.windSpeed + h.windKph,
      temp: acc.temp + h.tempC,
      humidity: acc.humidity + h.rhPct,
      precipRisk: acc.precipRisk + (h.precipProb || 0),
    }), { windSpeed: 0, temp: 0, humidity: 0, precipRisk: 0 })

    return {
      windSpeed: sum.windSpeed / hourlyData.length,
      temp: sum.temp / hourlyData.length,
      humidity: sum.humidity / hourlyData.length,
      precipRisk: sum.precipRisk / hourlyData.length,
    }
  }

  private static calculateHerbicideSuitability(conditions: any, deltaT: number): number {
    let score = 100

    // Wind (very sensitive)
    if (conditions.windSpeed > 15) score -= 40
    else if (conditions.windSpeed > 10) score -= 20
    else if (conditions.windSpeed < 3) score -= 15 // Inversion risk

    // Temperature
    if (conditions.temp < 10 || conditions.temp > 30) score -= 30
    else if (conditions.temp < 15 || conditions.temp > 28) score -= 15

    // Humidity (affects uptake)
    if (conditions.humidity < 40) score -= 20
    else if (conditions.humidity > 95) score -= 10

    // Delta T
    if (deltaT < 2 || deltaT > 8) score -= 30

    return Math.max(0, score)
  }

  private static calculateInsecticideSuitability(conditions: any, deltaT: number): number {
    let score = 100

    // Wind (moderate sensitivity)
    if (conditions.windSpeed > 20) score -= 30
    else if (conditions.windSpeed > 15) score -= 15

    // Temperature (affects insect activity)
    if (conditions.temp < 15 || conditions.temp > 35) score -= 25
    else if (conditions.temp < 18 || conditions.temp > 32) score -= 10

    // Humidity
    if (conditions.humidity < 30) score -= 15

    // Evening applications often better
    const hour = new Date().getHours()
    if (hour >= 18 || hour <= 6) score += 10

    return Math.max(0, Math.min(100, score))
  }

  private static calculateFungicideSuitability(conditions: any, deltaT: number): number {
    let score = 100

    // Wind (less sensitive)
    if (conditions.windSpeed > 25) score -= 25
    else if (conditions.windSpeed > 20) score -= 10

    // Temperature
    if (conditions.temp < 5 || conditions.temp > 35) score -= 30
    else if (conditions.temp < 10 || conditions.temp > 30) score -= 15

    // Humidity (critical for fungicides)
    if (conditions.humidity < 50) score -= 25
    else if (conditions.humidity < 60) score -= 10

    // Rain-free period needed
    if (conditions.precipRisk > 30) score -= 40

    return Math.max(0, score)
  }

  private static calculateFertilizerSuitability(conditions: any, deltaT: number): number {
    let score = 100

    // Wind (foliar application)
    if (conditions.windSpeed > 25) score -= 20
    else if (conditions.windSpeed > 20) score -= 10

    // Temperature (affects volatilization)
    if (conditions.temp > 30) score -= 30
    else if (conditions.temp > 28) score -= 15
    else if (conditions.temp < 5) score -= 20

    // Humidity (affects foliar uptake)
    if (conditions.humidity < 50) score -= 15

    // Rain can be beneficial for soil application
    if (conditions.precipRisk > 20 && conditions.precipRisk < 50) score += 10

    return Math.max(0, Math.min(100, score))
  }

  private static calculateWindowConfidence(
    conditions: any,
    deltaT: number,
    suitability: any
  ): number {
    const maxSuit = Math.max(...Object.values(suitability) as number[])
    let confidence = maxSuit

    // Adjust for overall conditions
    if (conditions.precipRisk > 50) confidence *= 0.5
    if (deltaT < 2 || deltaT > 8) confidence *= 0.7
    if (conditions.windSpeed > 20) confidence *= 0.8

    return Math.round(confidence)
  }

  private static identifyLimitations(conditions: any, deltaT: number): string[] {
    const limitations = []

    if (conditions.windSpeed > 15) limitations.push('High wind speed')
    if (conditions.windSpeed < 3) limitations.push('Potential inversion')
    if (deltaT < 2) limitations.push('Strong inversion likely')
    if (deltaT > 8) limitations.push('Unstable conditions')
    if (conditions.humidity < 40) limitations.push('Low humidity - increased evaporation')
    if (conditions.humidity > 95) limitations.push('Very high humidity - reduced efficacy')
    if (conditions.precipRisk > 30) limitations.push('Precipitation risk')
    if (conditions.temp > 30) limitations.push('High temperature stress')
    if (conditions.temp < 10) limitations.push('Low temperature - reduced uptake')

    return limitations
  }

  // Generate weather alerts based on conditions
  static generateWeatherAlerts(
    currentConditions: any,
    forecast: any[],
    activeJobs: any[]
  ): WeatherAlert[] {
    const alerts: WeatherAlert[] = []

    // Check for immediate risks
    if (currentConditions.windKph > 25) {
      alerts.push({
        id: `alert-${Date.now()}-1`,
        severity: 'critical',
        type: 'HIGH_WIND',
        message: 'Wind speed exceeds safe spraying limits',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        affectedBlocks: ['all'],
        recommendations: [
          'Suspend all spraying operations',
          'Secure equipment and materials',
          'Monitor for drift from recent applications',
        ],
      })
    }

    // Check for inversion conditions
    const deltaT = this.calculateDeltaT(currentConditions.tempC, currentConditions.tempC - 2)
    if (deltaT < 2) {
      alerts.push({
        id: `alert-${Date.now()}-2`,
        severity: 'warning',
        type: 'TEMPERATURE_INVERSION',
        message: 'Temperature inversion detected - high drift risk',
        startTime: new Date(),
        endTime: new Date(Date.now() + 7200000),
        affectedBlocks: ['all'],
        recommendations: [
          'Avoid fine droplet applications',
          'Consider postponing herbicide applications',
          'Use drift-reducing nozzles if spraying is essential',
        ],
      })
    }

    // Check forecast for upcoming storms
    const stormRisk = forecast.some(f => f.precipProb > 70 && f.windKph > 30)
    if (stormRisk) {
      alerts.push({
        id: `alert-${Date.now()}-3`,
        severity: 'warning',
        type: 'STORM_APPROACHING',
        message: 'Severe weather expected within 6 hours',
        startTime: new Date(),
        endTime: new Date(Date.now() + 21600000),
        affectedBlocks: ['all'],
        recommendations: [
          'Complete or suspend current applications',
          'Ensure rain-free period requirements are met',
          'Secure all equipment',
        ],
      })
    }

    // Check for frost risk
    const frostRisk = forecast.some(f => f.tempC <= 2)
    if (frostRisk) {
      alerts.push({
        id: `alert-${Date.now()}-4`,
        severity: 'info',
        type: 'FROST_RISK',
        message: 'Frost possible in next 24 hours',
        startTime: new Date(Date.now() + 43200000),
        endTime: new Date(Date.now() + 86400000),
        affectedBlocks: ['all'],
        recommendations: [
          'Avoid applications of temperature-sensitive products',
          'Consider frost protection measures',
          'Monitor crop stress indicators',
        ],
      })
    }

    return alerts
  }
}