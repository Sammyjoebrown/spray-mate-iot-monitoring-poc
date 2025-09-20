import Decimal from 'decimal.js'

export type AreaUnit = 'ha' | 'm2'
export type VolumeUnit = 'L' | 'mL' | 'gal'
export type MassUnit = 'kg' | 'g' | 'lb' | 'oz'
export type ConcentrationUnit = 'g/L' | 'kg/L' | '%' | 'g ai/L' | 'g ai/kg'
export type ApplicationRateUnit = 'L/ha' | 'mL/ha' | 'kg/ha' | 'g/ha' | 'g ai/ha'
export type ProductUnit = 'L' | 'kg'

interface ConversionFactors {
  [key: string]: {
    [key: string]: number
  }
}

const CONVERSION_FACTORS: ConversionFactors = {
  area: {
    ha: 1,
    m2: 10000,
  },
  volume: {
    L: 1,
    mL: 1000,
    gal: 0.264172,
  },
  mass: {
    kg: 1,
    g: 1000,
    lb: 2.20462,
    oz: 35.274,
  },
}

export class UnitConverter {
  private static toDecimal(value: number | string | Decimal): Decimal {
    return new Decimal(value)
  }

  static convertArea(value: number | Decimal, from: AreaUnit, to: AreaUnit): Decimal {
    const val = this.toDecimal(value)
    const fromFactor = CONVERSION_FACTORS.area[from]
    const toFactor = CONVERSION_FACTORS.area[to]
    return val.mul(toFactor).div(fromFactor)
  }

  static convertVolume(value: number | Decimal, from: VolumeUnit, to: VolumeUnit): Decimal {
    const val = this.toDecimal(value)
    const fromFactor = CONVERSION_FACTORS.volume[from]
    const toFactor = CONVERSION_FACTORS.volume[to]
    return val.mul(toFactor).div(fromFactor)
  }

  static convertMass(value: number | Decimal, from: MassUnit, to: MassUnit): Decimal {
    const val = this.toDecimal(value)
    const fromFactor = CONVERSION_FACTORS.mass[from]
    const toFactor = CONVERSION_FACTORS.mass[to]
    return val.mul(toFactor).div(fromFactor)
  }

  static hectaresToSquareMetres(ha: number | Decimal): Decimal {
    return this.convertArea(ha, 'ha', 'm2')
  }

  static squareMetresToHectares(m2: number | Decimal): Decimal {
    return this.convertArea(m2, 'm2', 'ha')
  }

  static litresToMillilitres(L: number | Decimal): Decimal {
    return this.convertVolume(L, 'L', 'mL')
  }

  static millilitresToLitres(mL: number | Decimal): Decimal {
    return this.convertVolume(mL, 'mL', 'L')
  }

  static kilogramsToGrams(kg: number | Decimal): Decimal {
    return this.convertMass(kg, 'kg', 'g')
  }

  static gramsToKilograms(g: number | Decimal): Decimal {
    return this.convertMass(g, 'g', 'kg')
  }

  static percentToDecimal(percent: number | Decimal): Decimal {
    return this.toDecimal(percent).div(100)
  }

  static decimalToPercent(decimal: number | Decimal): Decimal {
    return this.toDecimal(decimal).mul(100)
  }

  static roundTo(value: number | Decimal, decimalPlaces: number = 3): Decimal {
    const val = this.toDecimal(value)
    return val.toDecimalPlaces(decimalPlaces, Decimal.ROUND_HALF_UP)
  }
}

export interface ActiveIngredientCalculation {
  productQuantity: Decimal
  productUnit: ProductUnit
  concentrationPercent: Decimal
  aiGrams: Decimal
}

export class ActiveIngredientCalculator {
  static calculateAIFromProduct(
    productQuantity: number | Decimal,
    productUnit: ProductUnit,
    concentrationPercent: number | Decimal,
    densityKgPerL?: number | Decimal | null
  ): Decimal {
    const qty = new Decimal(productQuantity)
    const concentration = new Decimal(concentrationPercent).div(100)

    let productKg: Decimal

    if (productUnit === 'kg') {
      productKg = qty
    } else {
      // L to kg conversion using density
      const density = densityKgPerL ? new Decimal(densityKgPerL) : new Decimal(1)
      productKg = qty.mul(density)
    }

    // Convert kg to g and multiply by concentration
    return productKg.mul(1000).mul(concentration)
  }

  static calculateProductFromAI(
    aiGrams: number | Decimal,
    concentrationPercent: number | Decimal,
    productUnit: ProductUnit,
    densityKgPerL?: number | Decimal | null
  ): Decimal {
    const ai = new Decimal(aiGrams)
    const concentration = new Decimal(concentrationPercent).div(100)

    // AI in grams to product in kg
    const productKg = ai.div(1000).div(concentration)

    if (productUnit === 'kg') {
      return productKg
    } else {
      // kg to L conversion using density
      const density = densityKgPerL ? new Decimal(densityKgPerL) : new Decimal(1)
      return productKg.div(density)
    }
  }

  static calculateApplicationAI(
    ratePerHa: number | Decimal,
    rateUnit: ApplicationRateUnit,
    areaHa: number | Decimal,
    concentrationPercent?: number | Decimal,
    densityKgPerL?: number | Decimal | null
  ): Decimal {
    const rate = new Decimal(ratePerHa)
    const area = new Decimal(areaHa)

    if (rateUnit === 'g ai/ha') {
      return rate.mul(area)
    }

    let productQuantity: Decimal
    let productUnit: ProductUnit

    switch (rateUnit) {
      case 'L/ha':
        productQuantity = rate.mul(area)
        productUnit = 'L'
        break
      case 'mL/ha':
        productQuantity = rate.mul(area).div(1000)
        productUnit = 'L'
        break
      case 'kg/ha':
        productQuantity = rate.mul(area)
        productUnit = 'kg'
        break
      case 'g/ha':
        productQuantity = rate.mul(area).div(1000)
        productUnit = 'kg'
        break
      default:
        throw new Error(`Unsupported rate unit: ${rateUnit}`)
    }

    if (!concentrationPercent) {
      throw new Error('Concentration required for product-based rates')
    }

    return this.calculateAIFromProduct(
      productQuantity,
      productUnit,
      concentrationPercent,
      densityKgPerL
    )
  }
}

export interface ProductUsage {
  productId: string
  productName: string
  quantityUsed: Decimal
  unit: ProductUnit
  aiGrams: Decimal
}

export class SprayCalculator {
  static calculateTankMixUsage(
    tankMix: {
      lines: Array<{
        productId: string
        ratePerHa: number
        rateUnit: ApplicationRateUnit
        isActiveIngredientRate: boolean
      }>
    },
    products: Map<string, {
      name: string
      concentrationPct: Decimal
      unit: ProductUnit
      densityKgPerL?: Decimal | null
    }>,
    areaHa: number | Decimal
  ): ProductUsage[] {
    const area = new Decimal(areaHa)
    const usage: ProductUsage[] = []

    for (const line of tankMix.lines) {
      const product = products.get(line.productId)
      if (!product) {
        throw new Error(`Product ${line.productId} not found`)
      }

      let quantityUsed: Decimal
      let aiGrams: Decimal

      if (line.isActiveIngredientRate) {
        // Rate is in g ai/ha
        aiGrams = new Decimal(line.ratePerHa).mul(area)
        quantityUsed = ActiveIngredientCalculator.calculateProductFromAI(
          aiGrams,
          product.concentrationPct,
          product.unit,
          product.densityKgPerL
        )
      } else {
        // Rate is in product units
        const rateUnit = line.rateUnit as ApplicationRateUnit

        if (rateUnit === 'L/ha' && product.unit === 'L') {
          quantityUsed = new Decimal(line.ratePerHa).mul(area)
        } else if (rateUnit === 'mL/ha' && product.unit === 'L') {
          quantityUsed = new Decimal(line.ratePerHa).mul(area).div(1000)
        } else if (rateUnit === 'kg/ha' && product.unit === 'kg') {
          quantityUsed = new Decimal(line.ratePerHa).mul(area)
        } else if (rateUnit === 'g/ha' && product.unit === 'kg') {
          quantityUsed = new Decimal(line.ratePerHa).mul(area).div(1000)
        } else {
          throw new Error(`Unit mismatch: ${rateUnit} vs ${product.unit}`)
        }

        aiGrams = ActiveIngredientCalculator.calculateAIFromProduct(
          quantityUsed,
          product.unit,
          product.concentrationPct,
          product.densityKgPerL
        )
      }

      usage.push({
        productId: line.productId,
        productName: product.name,
        quantityUsed: UnitConverter.roundTo(quantityUsed, 3),
        unit: product.unit,
        aiGrams: UnitConverter.roundTo(aiGrams, 3),
      })
    }

    return usage
  }

  static calculateWaterVolume(
    waterRatePerHaL: number | Decimal,
    areaHa: number | Decimal
  ): Decimal {
    const rate = new Decimal(waterRatePerHaL)
    const area = new Decimal(areaHa)
    return UnitConverter.roundTo(rate.mul(area), 1)
  }
}