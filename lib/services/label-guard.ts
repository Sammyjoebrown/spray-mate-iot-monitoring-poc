import { LabelRuleSet, RuleViolation, RuleCheckResult } from '@/lib/types'
import { Decimal } from 'decimal.js'

export interface SprayConditions {
  windKph: number
  windDirDeg: number
  tempC: number
  rhPct: number
  plannedStart: Date
  blockId: string
  nearWaterway?: boolean
  distanceToWaterwayM?: number
  nearSensitiveArea?: boolean
  distanceToSensitiveAreaM?: number
  lastSprayDate?: Date
  plannedHarvestDate?: Date
  seasonalAIApplied?: number
  applicationCount?: number
}

export interface CombinedLabelRules extends LabelRuleSet {
  products: string[]
}

export class LabelGuard {
  static combineLabelRules(
    productLabels: Array<{ productName: string; label: LabelRuleSet }>
  ): CombinedLabelRules {
    const combined: CombinedLabelRules = {
      products: productLabels.map(p => p.productName),
    }

    for (const { label } of productLabels) {
      // Take the strictest (minimum) max wind speed
      if (label.maxWindKph !== undefined) {
        combined.maxWindKph = combined.maxWindKph
          ? Math.min(combined.maxWindKph, label.maxWindKph)
          : label.maxWindKph
      }

      // Combine all disallowed wind directions
      if (label.disallowedWindDirDeg) {
        combined.disallowedWindDirDeg = [
          ...(combined.disallowedWindDirDeg || []),
          ...label.disallowedWindDirDeg,
        ]
      }

      // Take the strictest (maximum) buffer zones
      if (label.bufferZones) {
        for (const zone of label.bufferZones) {
          const existing = combined.bufferZones?.find(z => z.type === zone.type)
          if (existing) {
            existing.minDistanceM = Math.max(existing.minDistanceM, zone.minDistanceM)
          } else {
            combined.bufferZones = [...(combined.bufferZones || []), zone]
          }
        }
      }

      // Take the strictest (maximum) re-entry hours
      if (label.reentryHours !== undefined) {
        combined.reentryHours = combined.reentryHours
          ? Math.max(combined.reentryHours, label.reentryHours)
          : label.reentryHours
      }

      // Take the strictest (maximum) pre-harvest days
      if (label.preHarvestDays !== undefined) {
        combined.preHarvestDays = combined.preHarvestDays
          ? Math.max(combined.preHarvestDays, label.preHarvestDays)
          : label.preHarvestDays
      }

      // Take the strictest (minimum) max seasonal AI
      if (label.maxSeasonalGaiPerHa !== undefined) {
        combined.maxSeasonalGaiPerHa = combined.maxSeasonalGaiPerHa
          ? Math.min(combined.maxSeasonalGaiPerHa, label.maxSeasonalGaiPerHa)
          : label.maxSeasonalGaiPerHa
      }

      // Take the strictest (minimum) max applications
      if (label.maxApplicationsPerSeason !== undefined) {
        combined.maxApplicationsPerSeason = combined.maxApplicationsPerSeason
          ? Math.min(combined.maxApplicationsPerSeason, label.maxApplicationsPerSeason)
          : label.maxApplicationsPerSeason
      }

      // Take the strictest (maximum) rain-free period
      if (label.minRainfreePeriodHours !== undefined) {
        combined.minRainfreePeriodHours = combined.minRainfreePeriodHours
          ? Math.max(combined.minRainfreePeriodHours, label.minRainfreePeriodHours)
          : label.minRainfreePeriodHours
      }

      // Temperature range - take the narrowest range
      if (label.temperatureRange) {
        if (combined.temperatureRange) {
          if (label.temperatureRange.minC !== undefined) {
            combined.temperatureRange.minC = Math.max(
              combined.temperatureRange.minC || -Infinity,
              label.temperatureRange.minC
            )
          }
          if (label.temperatureRange.maxC !== undefined) {
            combined.temperatureRange.maxC = Math.min(
              combined.temperatureRange.maxC || Infinity,
              label.temperatureRange.maxC
            )
          }
        } else {
          combined.temperatureRange = { ...label.temperatureRange }
        }
      }

      // Humidity range - take the narrowest range
      if (label.relativeHumidityRange) {
        if (combined.relativeHumidityRange) {
          if (label.relativeHumidityRange.minPct !== undefined) {
            combined.relativeHumidityRange.minPct = Math.max(
              combined.relativeHumidityRange.minPct || 0,
              label.relativeHumidityRange.minPct
            )
          }
          if (label.relativeHumidityRange.maxPct !== undefined) {
            combined.relativeHumidityRange.maxPct = Math.min(
              combined.relativeHumidityRange.maxPct || 100,
              label.relativeHumidityRange.maxPct
            )
          }
        } else {
          combined.relativeHumidityRange = { ...label.relativeHumidityRange }
        }
      }
    }

    // Remove duplicate wind directions
    if (combined.disallowedWindDirDeg) {
      combined.disallowedWindDirDeg = [...new Set(combined.disallowedWindDirDeg)]
    }

    return combined
  }

  static checkRules(
    rules: LabelRuleSet,
    conditions: SprayConditions
  ): RuleCheckResult {
    const violations: RuleViolation[] = []

    // Check wind speed
    if (rules.maxWindKph !== undefined && conditions.windKph > rules.maxWindKph) {
      violations.push({
        code: 'WIND_SPEED_EXCEEDED',
        severity: 'block',
        message: `Wind speed ${conditions.windKph} km/h exceeds maximum ${rules.maxWindKph} km/h`,
        remediation: `Wait until wind speed drops below ${rules.maxWindKph} km/h`,
        value: conditions.windKph,
        limit: rules.maxWindKph,
      })
    }

    // Check wind direction
    if (rules.disallowedWindDirDeg && rules.disallowedWindDirDeg.length > 0) {
      const isDisallowed = rules.disallowedWindDirDeg.some(dir => {
        const diff = Math.abs(conditions.windDirDeg - dir)
        return diff < 10 || diff > 350 // Within 10 degrees
      })

      if (isDisallowed) {
        violations.push({
          code: 'WIND_DIRECTION_DISALLOWED',
          severity: 'block',
          message: `Wind direction ${conditions.windDirDeg}° is in a disallowed range`,
          remediation: 'Wait for wind direction to change or adjust boom orientation',
          value: conditions.windDirDeg,
          limit: rules.disallowedWindDirDeg,
        })
      }
    }

    // Check buffer zones
    if (rules.bufferZones) {
      for (const zone of rules.bufferZones) {
        if (zone.type === 'water' && conditions.nearWaterway) {
          const distance = conditions.distanceToWaterwayM || 0
          if (distance < zone.minDistanceM) {
            violations.push({
              code: 'BUFFER_ZONE_VIOLATION',
              severity: 'block',
              message: `Too close to waterway: ${distance}m (minimum ${zone.minDistanceM}m required)`,
              remediation: `Maintain at least ${zone.minDistanceM}m distance from waterways`,
              value: distance,
              limit: zone.minDistanceM,
            })
          }
        }

        if (zone.type === 'sensitive' && conditions.nearSensitiveArea) {
          const distance = conditions.distanceToSensitiveAreaM || 0
          if (distance < zone.minDistanceM) {
            violations.push({
              code: 'SENSITIVE_AREA_BUFFER_VIOLATION',
              severity: 'block',
              message: `Too close to sensitive area: ${distance}m (minimum ${zone.minDistanceM}m required)`,
              remediation: `Maintain at least ${zone.minDistanceM}m distance from sensitive areas`,
              value: distance,
              limit: zone.minDistanceM,
            })
          }
        }
      }
    }

    // Check temperature range
    if (rules.temperatureRange) {
      if (
        rules.temperatureRange.minC !== undefined &&
        conditions.tempC < rules.temperatureRange.minC
      ) {
        violations.push({
          code: 'TEMPERATURE_TOO_LOW',
          severity: 'warn',
          message: `Temperature ${conditions.tempC}°C is below minimum ${rules.temperatureRange.minC}°C`,
          remediation: `Wait until temperature rises above ${rules.temperatureRange.minC}°C`,
          value: conditions.tempC,
          limit: rules.temperatureRange.minC,
        })
      }

      if (
        rules.temperatureRange.maxC !== undefined &&
        conditions.tempC > rules.temperatureRange.maxC
      ) {
        violations.push({
          code: 'TEMPERATURE_TOO_HIGH',
          severity: 'block',
          message: `Temperature ${conditions.tempC}°C exceeds maximum ${rules.temperatureRange.maxC}°C`,
          remediation: `Wait until temperature drops below ${rules.temperatureRange.maxC}°C`,
          value: conditions.tempC,
          limit: rules.temperatureRange.maxC,
        })
      }
    }

    // Check humidity range
    if (rules.relativeHumidityRange) {
      if (
        rules.relativeHumidityRange.minPct !== undefined &&
        conditions.rhPct < rules.relativeHumidityRange.minPct
      ) {
        violations.push({
          code: 'HUMIDITY_TOO_LOW',
          severity: 'warn',
          message: `Humidity ${conditions.rhPct}% is below minimum ${rules.relativeHumidityRange.minPct}%`,
          remediation: `Increased evaporation risk. Consider waiting for higher humidity`,
          value: conditions.rhPct,
          limit: rules.relativeHumidityRange.minPct,
        })
      }

      if (
        rules.relativeHumidityRange.maxPct !== undefined &&
        conditions.rhPct > rules.relativeHumidityRange.maxPct
      ) {
        violations.push({
          code: 'HUMIDITY_TOO_HIGH',
          severity: 'warn',
          message: `Humidity ${conditions.rhPct}% exceeds maximum ${rules.relativeHumidityRange.maxPct}%`,
          remediation: `Reduced efficacy risk. Consider waiting for lower humidity`,
          value: conditions.rhPct,
          limit: rules.relativeHumidityRange.maxPct,
        })
      }
    }

    // Check pre-harvest interval
    if (rules.preHarvestDays && conditions.plannedHarvestDate) {
      const daysUntilHarvest = Math.floor(
        (conditions.plannedHarvestDate.getTime() - conditions.plannedStart.getTime()) /
          (1000 * 60 * 60 * 24)
      )

      if (daysUntilHarvest < rules.preHarvestDays) {
        violations.push({
          code: 'PHI_VIOLATION',
          severity: 'block',
          message: `Only ${daysUntilHarvest} days until harvest (minimum ${rules.preHarvestDays} days required)`,
          remediation: `Delay spraying or adjust harvest date`,
          value: daysUntilHarvest,
          limit: rules.preHarvestDays,
        })
      }
    }

    // Check re-entry interval
    if (rules.reentryHours && conditions.lastSprayDate) {
      const hoursSinceLastSpray =
        (conditions.plannedStart.getTime() - conditions.lastSprayDate.getTime()) /
        (1000 * 60 * 60)

      if (hoursSinceLastSpray < rules.reentryHours) {
        violations.push({
          code: 'REI_VIOLATION',
          severity: 'warn',
          message: `Only ${Math.round(
            hoursSinceLastSpray
          )} hours since last spray (minimum ${rules.reentryHours} hours required)`,
          remediation: `Wait ${Math.round(
            rules.reentryHours - hoursSinceLastSpray
          )} more hours before re-entry`,
          value: hoursSinceLastSpray,
          limit: rules.reentryHours,
        })
      }
    }

    // Check seasonal AI limit
    if (
      rules.maxSeasonalGaiPerHa &&
      conditions.seasonalAIApplied !== undefined &&
      conditions.seasonalAIApplied > rules.maxSeasonalGaiPerHa
    ) {
      violations.push({
        code: 'SEASONAL_AI_EXCEEDED',
        severity: 'block',
        message: `Seasonal AI limit exceeded: ${conditions.seasonalAIApplied} g/ha (maximum ${rules.maxSeasonalGaiPerHa} g/ha)`,
        remediation: 'Cannot apply more of this product this season',
        value: conditions.seasonalAIApplied,
        limit: rules.maxSeasonalGaiPerHa,
      })
    }

    // Check application count
    if (
      rules.maxApplicationsPerSeason &&
      conditions.applicationCount !== undefined &&
      conditions.applicationCount >= rules.maxApplicationsPerSeason
    ) {
      violations.push({
        code: 'MAX_APPLICATIONS_EXCEEDED',
        severity: 'block',
        message: `Maximum applications reached: ${conditions.applicationCount} (limit ${rules.maxApplicationsPerSeason})`,
        remediation: 'Cannot apply this product again this season',
        value: conditions.applicationCount,
        limit: rules.maxApplicationsPerSeason,
      })
    }

    // Check for temperature inversion risk
    if (
      conditions.tempC < 10 &&
      conditions.windKph < 3 &&
      (conditions.plannedStart.getHours() < 9 || conditions.plannedStart.getHours() > 16)
    ) {
      violations.push({
        code: 'INVERSION_RISK',
        severity: 'warn',
        message: 'High risk of temperature inversion',
        remediation: 'Consider spraying during warmer parts of the day with better air mixing',
      })
    }

    return {
      passes: violations.filter(v => v.severity === 'block').length === 0,
      violations,
    }
  }

  static generateRemediation(violations: RuleViolation[]): string[] {
    const remediations: string[] = []
    const blockers = violations.filter(v => v.severity === 'block')
    const warnings = violations.filter(v => v.severity === 'warn')

    if (blockers.length > 0) {
      remediations.push('⛔ Cannot proceed - critical violations:')
      blockers.forEach(v => {
        if (v.remediation) {
          remediations.push(`  • ${v.remediation}`)
        }
      })
    }

    if (warnings.length > 0) {
      remediations.push('⚠️ Warnings to consider:')
      warnings.forEach(v => {
        if (v.remediation) {
          remediations.push(`  • ${v.remediation}`)
        }
      })
    }

    return remediations
  }
}