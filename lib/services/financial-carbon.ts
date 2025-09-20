import { Decimal } from 'decimal.js'

export interface CostBreakdown {
  id: string
  jobId: string
  date: Date
  blockId: string
  areaHa: number
  costs: {
    chemical: {
      products: Array<{
        name: string
        quantity: number
        unit: string
        unitCost: number
        totalCost: number
      }>
      total: number
    }
    labour: {
      operator: string
      hours: number
      hourlyRate: number
      total: number
    }
    machinery: {
      equipment: string
      hours: number
      fuelL: number
      fuelCostPerL: number
      depreciation: number
      maintenance: number
      total: number
    }
    other: {
      items: Array<{
        description: string
        cost: number
      }>
      total: number
    }
  }
  totalCost: number
  costPerHa: number
}

export interface ROIAnalysis {
  id: string
  treatment: string
  blockId: string
  investment: {
    chemicalCost: number
    applicationCost: number
    totalCost: number
  }
  returns: {
    yieldIncrease: number // kg/ha
    qualityPremium: number // $/kg
    lossPrevented: number // $/ha
    grossReturn: number
  }
  metrics: {
    netReturn: number
    roi: number // percentage
    paybackPeriod: number // days
    breakEvenYield: number // kg/ha
    profitMargin: number // percentage
  }
  sensitivity: {
    priceScenarios: Array<{
      cropPrice: number
      netReturn: number
      roi: number
    }>
    yieldScenarios: Array<{
      yieldIncrease: number
      netReturn: number
      roi: number
    }>
  }
}

export interface CarbonFootprint {
  id: string
  period: 'job' | 'season' | 'year'
  startDate: Date
  endDate: Date
  emissions: {
    fuel: {
      diesel: number // L
      petrol: number // L
      co2e: number // kg CO2e
    }
    chemicals: {
      manufacturing: number // kg CO2e
      transport: number // kg CO2e
      total: number // kg CO2e
    }
    fertilizer: {
      n2o: number // kg CO2e from N application
      manufacturing: number // kg CO2e
      total: number // kg CO2e
    }
    machinery: {
      manufacturing: number // kg CO2e (amortized)
      total: number // kg CO2e
    }
  }
  sequestration: {
    soilCarbon: number // kg CO2e
    biomass: number // kg CO2e
    total: number // kg CO2e
  }
  netEmissions: number // kg CO2e
  intensity: number // kg CO2e per kg product
  offsets: Array<{
    type: string
    amount: number // kg CO2e
    verified: boolean
  }>
}

export interface ContractSprayingJob {
  id: string
  clientName: string
  clientFarm: string
  blocks: string[]
  totalArea: number
  service: {
    type: string
    products: string[]
    ratePerHa: number
  }
  pricing: {
    model: 'fixed' | 'hourly' | 'performance'
    baseRate: number
    unit: string
    discounts: Array<{
      reason: string
      amount: number
    }>
    surcharges: Array<{
      reason: string
      amount: number
    }>
    estimatedTotal: number
  }
  terms: {
    paymentDue: number // days
    deposit: number // percentage
    penalties: string[]
    guarantees: string[]
  }
  insurance: {
    liability: number
    excess: number
    covered: boolean
  }
}

export interface SupplierPricing {
  supplierId: string
  supplierName: string
  products: Array<{
    productId: string
    productName: string
    unit: string
    pricing: Array<{
      minQuantity: number
      maxQuantity: number
      unitPrice: number
      validFrom: Date
      validTo: Date
    }>
    discounts: {
      volumeDiscount: number // percentage
      earlyOrderDiscount: number
      cashDiscount: number
    }
    deliveryTerms: {
      minOrder: number
      leadTime: number // days
      freeDeliveryThreshold: number
    }
  }>
  contractTerms: {
    annualCommitment: number
    rebate: number // percentage
    paymentTerms: number // days
  }
}

export interface InsuranceClaimData {
  id: string
  claimType: 'drift' | 'crop_damage' | 'weather' | 'equipment'
  incidentDate: Date
  reportedDate: Date
  description: string
  affectedArea: number
  estimatedLoss: number
  documentation: Array<{
    type: string
    fileName: string
    uploadDate: Date
  }>
  sprayRecords: Array<{
    jobId: string
    date: Date
    products: string[]
    conditions: any
  }>
  status: 'pending' | 'approved' | 'rejected' | 'settled'
  settlementAmount?: number
}

export class FinancialCarbonSystem {
  // Calculate comprehensive cost breakdown for a spray job
  static calculateJobCosts(
    job: any,
    products: any[],
    labour: { operator: string; hourlyRate: number },
    equipment: { type: string; fuelConsumption: number; depreciationRate: number },
    fuelPrice: number
  ): CostBreakdown {
    const areaHa = new Decimal(job.block.areaHa).toNumber()
    const sprayTime = areaHa / (job.plannedSpeedKph * job.plannedBoomWidthM / 10) // hours

    // Chemical costs
    const chemicalCosts = products.map(p => {
      const quantity = new Decimal(p.ratePerHa).mul(areaHa).toNumber()
      const unitCost = this.getProductPrice(p.productId)
      return {
        name: p.name,
        quantity,
        unit: p.unit,
        unitCost,
        totalCost: quantity * unitCost,
      }
    })

    const chemicalTotal = chemicalCosts.reduce((sum, c) => sum + c.totalCost, 0)

    // Labour costs
    const labourCost = {
      operator: labour.operator,
      hours: sprayTime + 0.5, // Add setup time
      hourlyRate: labour.hourlyRate,
      total: (sprayTime + 0.5) * labour.hourlyRate,
    }

    // Machinery costs
    const fuelUsed = sprayTime * equipment.fuelConsumption
    const machineryCost = {
      equipment: equipment.type,
      hours: sprayTime,
      fuelL: fuelUsed,
      fuelCostPerL: fuelPrice,
      depreciation: sprayTime * equipment.depreciationRate,
      maintenance: sprayTime * 15, // $15/hour maintenance
      total: fuelUsed * fuelPrice + sprayTime * (equipment.depreciationRate + 15),
    }

    // Other costs
    const otherCosts = {
      items: [
        { description: 'PPE and safety equipment', cost: 10 },
        { description: 'Water and adjuvants', cost: areaHa * 2 },
      ],
      total: 10 + areaHa * 2,
    }

    const totalCost = chemicalTotal + labourCost.total + machineryCost.total + otherCosts.total

    return {
      id: `cost-${Date.now()}`,
      jobId: job.id,
      date: new Date(),
      blockId: job.blockId,
      areaHa,
      costs: {
        chemical: {
          products: chemicalCosts,
          total: chemicalTotal,
        },
        labour: labourCost,
        machinery: machineryCost,
        other: otherCosts,
      },
      totalCost,
      costPerHa: totalCost / areaHa,
    }
  }

  // Perform ROI analysis for treatment
  static analyzeROI(
    treatment: {
      type: string
      cost: number
      areaHa: number
    },
    yieldData: {
      untreatedYield: number
      treatedYield: number
      cropPrice: number
      qualityImprovement: number
    },
    marketScenarios?: { cropPrice: number }[]
  ): ROIAnalysis {
    const investment = {
      chemicalCost: treatment.cost * 0.7,
      applicationCost: treatment.cost * 0.3,
      totalCost: treatment.cost,
    }

    const yieldIncrease = yieldData.treatedYield - yieldData.untreatedYield
    const qualityPremium = yieldData.qualityImprovement * yieldData.cropPrice
    const lossPrevented = yieldData.untreatedYield * 0.1 * yieldData.cropPrice // 10% loss prevention

    const grossReturn = (yieldIncrease * yieldData.cropPrice) +
                       (yieldData.treatedYield * qualityPremium) +
                       lossPrevented

    const netReturn = grossReturn - investment.totalCost
    const roi = (netReturn / investment.totalCost) * 100
    const breakEvenYield = investment.totalCost / yieldData.cropPrice

    // Sensitivity analysis
    const priceScenarios = (marketScenarios || [
      { cropPrice: yieldData.cropPrice * 0.8 },
      { cropPrice: yieldData.cropPrice },
      { cropPrice: yieldData.cropPrice * 1.2 },
    ]).map(scenario => {
      const scenarioReturn = (yieldIncrease * scenario.cropPrice) +
                            (yieldData.treatedYield * qualityPremium) +
                            lossPrevented
      const scenarioNet = scenarioReturn - investment.totalCost
      return {
        cropPrice: scenario.cropPrice,
        netReturn: scenarioNet,
        roi: (scenarioNet / investment.totalCost) * 100,
      }
    })

    const yieldScenarios = [0.5, 1.0, 1.5].map(multiplier => {
      const scenarioYield = yieldIncrease * multiplier
      const scenarioReturn = (scenarioYield * yieldData.cropPrice) +
                            (yieldData.treatedYield * qualityPremium) +
                            lossPrevented
      const scenarioNet = scenarioReturn - investment.totalCost
      return {
        yieldIncrease: scenarioYield,
        netReturn: scenarioNet,
        roi: (scenarioNet / investment.totalCost) * 100,
      }
    })

    return {
      id: `roi-${Date.now()}`,
      treatment: treatment.type,
      blockId: '',
      investment,
      returns: {
        yieldIncrease,
        qualityPremium,
        lossPrevented,
        grossReturn,
      },
      metrics: {
        netReturn,
        roi,
        paybackPeriod: Math.ceil(investment.totalCost / (netReturn / 365)),
        breakEvenYield,
        profitMargin: (netReturn / grossReturn) * 100,
      },
      sensitivity: {
        priceScenarios,
        yieldScenarios,
      },
    }
  }

  // Calculate carbon footprint
  static calculateCarbonFootprint(
    activities: Array<{
      type: string
      fuel?: { diesel: number; petrol: number }
      chemicals?: { products: Array<{ name: string; quantity: number }> }
      fertilizer?: { nitrogen: number; phosphorus: number }
      area: number
    }>,
    period: { start: Date; end: Date },
    sequestrationData?: { soilCarbon: number; biomass: number }
  ): CarbonFootprint {
    // Emission factors (kg CO2e per unit)
    const emissionFactors = {
      dieselPerL: 2.68,
      petrolPerL: 2.31,
      nPerKg: 4.5, // N2O emissions from N application
      chemicalManufacturing: 5.5, // per kg active ingredient
      fertilizerManufacturing: 1.5, // per kg product
      machineryPerHour: 10, // amortized manufacturing emissions
    }

    let fuelEmissions = { diesel: 0, petrol: 0, co2e: 0 }
    let chemicalEmissions = { manufacturing: 0, transport: 0, total: 0 }
    let fertilizerEmissions = { n2o: 0, manufacturing: 0, total: 0 }
    let machineryEmissions = { manufacturing: 0, total: 0 }

    // Calculate emissions from activities
    for (const activity of activities) {
      if (activity.fuel) {
        fuelEmissions.diesel += activity.fuel.diesel || 0
        fuelEmissions.petrol += activity.fuel.petrol || 0
      }

      if (activity.chemicals) {
        for (const product of activity.chemicals.products) {
          chemicalEmissions.manufacturing += product.quantity * emissionFactors.chemicalManufacturing
          chemicalEmissions.transport += product.quantity * 0.5 // Transport emissions
        }
      }

      if (activity.fertilizer) {
        fertilizerEmissions.n2o += activity.fertilizer.nitrogen * emissionFactors.nPerKg
        fertilizerEmissions.manufacturing +=
          (activity.fertilizer.nitrogen + activity.fertilizer.phosphorus) *
          emissionFactors.fertilizerManufacturing
      }

      // Estimate machinery emissions based on area
      machineryEmissions.manufacturing += activity.area * 2 // 2 kg CO2e per ha
    }

    // Calculate totals
    fuelEmissions.co2e = fuelEmissions.diesel * emissionFactors.dieselPerL +
                        fuelEmissions.petrol * emissionFactors.petrolPerL
    chemicalEmissions.total = chemicalEmissions.manufacturing + chemicalEmissions.transport
    fertilizerEmissions.total = fertilizerEmissions.n2o + fertilizerEmissions.manufacturing
    machineryEmissions.total = machineryEmissions.manufacturing

    const totalEmissions = fuelEmissions.co2e + chemicalEmissions.total +
                          fertilizerEmissions.total + machineryEmissions.total

    // Sequestration (negative emissions)
    const sequestration = sequestrationData || { soilCarbon: 0, biomass: 0 }
    const totalSequestration = sequestration.soilCarbon + sequestration.biomass

    const netEmissions = totalEmissions - totalSequestration

    // Calculate intensity (assuming average yield of 5 t/ha)
    const totalArea = activities.reduce((sum, a) => sum + a.area, 0)
    const estimatedProduction = totalArea * 5000 // kg
    const intensity = estimatedProduction > 0 ? netEmissions / estimatedProduction : 0

    return {
      id: `carbon-${Date.now()}`,
      period: 'job',
      startDate: period.start,
      endDate: period.end,
      emissions: {
        fuel: fuelEmissions,
        chemicals: chemicalEmissions,
        fertilizer: fertilizerEmissions,
        machinery: machineryEmissions,
      },
      sequestration: {
        soilCarbon: sequestration.soilCarbon,
        biomass: sequestration.biomass,
        total: totalSequestration,
      },
      netEmissions,
      intensity,
      offsets: [],
    }
  }

  // Generate contract spraying quote
  static generateContractQuote(
    client: { name: string; farm: string },
    service: { type: string; area: number; products: string[] },
    pricing: { baseRate: number; unit: string }
  ): ContractSprayingJob {
    const area = new Decimal(service.area)
    const baseTotal = area.mul(pricing.baseRate).toNumber()

    // Apply discounts and surcharges
    const discounts = []
    const surcharges = []

    if (area.gt(100)) {
      discounts.push({ reason: 'Volume discount (>100 ha)', amount: baseTotal * 0.05 })
    }

    if (service.type === 'emergency') {
      surcharges.push({ reason: 'Emergency call-out', amount: 150 })
    }

    const totalDiscount = discounts.reduce((sum, d) => sum + d.amount, 0)
    const totalSurcharge = surcharges.reduce((sum, s) => sum + s.amount, 0)
    const estimatedTotal = baseTotal - totalDiscount + totalSurcharge

    return {
      id: `contract-${Date.now()}`,
      clientName: client.name,
      clientFarm: client.farm,
      blocks: [],
      totalArea: area.toNumber(),
      service: {
        type: service.type,
        products: service.products,
        ratePerHa: pricing.baseRate,
      },
      pricing: {
        model: 'fixed',
        baseRate: pricing.baseRate,
        unit: pricing.unit,
        discounts,
        surcharges,
        estimatedTotal,
      },
      terms: {
        paymentDue: 30,
        deposit: 25,
        penalties: ['2% per month on overdue amounts'],
        guarantees: ['Weather delays excluded', 'Re-spray if ineffective within 14 days'],
      },
      insurance: {
        liability: 20000000,
        excess: 5000,
        covered: true,
      },
    }
  }

  // Compare supplier pricing
  static compareSuppliers(
    product: string,
    quantity: number,
    suppliers: SupplierPricing[]
  ): Array<{
    supplier: string
    unitPrice: number
    totalPrice: number
    savings: number
    deliveryDays: number
    recommendation: string
  }> {
    const comparisons = suppliers.map(supplier => {
      const productPricing = supplier.products.find(p => p.productName === product)
      if (!productPricing) return null

      // Find applicable pricing tier
      const tier = productPricing.pricing.find(p =>
        quantity >= p.minQuantity && quantity <= p.maxQuantity &&
        new Date() >= p.validFrom && new Date() <= p.validTo
      )

      if (!tier) return null

      let unitPrice = tier.unitPrice

      // Apply discounts
      if (quantity >= productPricing.deliveryTerms.minOrder * 5) {
        unitPrice *= (1 - productPricing.discounts.volumeDiscount / 100)
      }

      const totalPrice = unitPrice * quantity

      return {
        supplier: supplier.supplierName,
        unitPrice,
        totalPrice,
        savings: 0, // Will calculate relative to cheapest
        deliveryDays: productPricing.deliveryTerms.leadTime,
        recommendation: '',
      }
    }).filter(c => c !== null) as any[]

    // Find cheapest and calculate savings
    const cheapest = comparisons.reduce((min, c) => c.totalPrice < min.totalPrice ? c : min)

    comparisons.forEach(c => {
      c.savings = c.totalPrice - cheapest.totalPrice
      if (c === cheapest) {
        c.recommendation = 'Best price'
      } else if (c.deliveryDays < cheapest.deliveryDays) {
        c.recommendation = 'Faster delivery'
      } else {
        c.recommendation = 'Consider only if preferred supplier'
      }
    })

    return comparisons.sort((a, b) => a.totalPrice - b.totalPrice)
  }

  // Prepare insurance claim documentation
  static prepareInsuranceClaim(
    incidentType: 'drift' | 'crop_damage' | 'weather' | 'equipment',
    incident: {
      date: Date
      description: string
      affectedArea: number
      estimatedLoss: number
    },
    sprayJobs: any[],
    weatherData: any[]
  ): InsuranceClaimData {
    // Compile spray records
    const relevantJobs = sprayJobs.filter(job => {
      const jobDate = new Date(job.plannedStart)
      const daysDiff = Math.abs(jobDate.getTime() - incident.date.getTime()) / 86400000
      return daysDiff <= 7 // Jobs within 7 days of incident
    })

    const sprayRecords = relevantJobs.map(job => ({
      jobId: job.id,
      date: job.plannedStart,
      products: job.mix.lines.map((l: any) => l.productName),
      conditions: {
        wind: job.plannedWindKph,
        temp: job.plannedTempC,
        humidity: job.plannedRH,
      },
    }))

    // Generate documentation list
    const documentation = [
      {
        type: 'Incident Report',
        fileName: `incident_report_${Date.now()}.pdf`,
        uploadDate: new Date(),
      },
      {
        type: 'Weather Data',
        fileName: `weather_data_${Date.now()}.csv`,
        uploadDate: new Date(),
      },
      {
        type: 'Spray Records',
        fileName: `spray_records_${Date.now()}.xlsx`,
        uploadDate: new Date(),
      },
    ]

    if (incidentType === 'drift') {
      documentation.push({
        type: 'DriftShield Analysis',
        fileName: `drift_analysis_${Date.now()}.pdf`,
        uploadDate: new Date(),
      })
    }

    return {
      id: `claim-${Date.now()}`,
      claimType: incidentType,
      incidentDate: incident.date,
      reportedDate: new Date(),
      description: incident.description,
      affectedArea: incident.affectedArea,
      estimatedLoss: incident.estimatedLoss,
      documentation,
      sprayRecords,
      status: 'pending',
    }
  }

  // Helper method to get product price (mock)
  private static getProductPrice(productId: string): number {
    const prices: Record<string, number> = {
      'GlyphoMax 540': 8.50,
      'Atrazine 900 WG': 22.00,
      'MCPA 750': 12.50,
      'Lontrel 300': 85.00,
      'Hasten Adjuvant': 15.00,
      'Urea 46%': 0.65,
    }
    return prices[productId] || 10.00
  }

  // Calculate seasonal financial summary
  static calculateSeasonSummary(
    jobs: any[],
    yields: any[],
    prices: { crop: number; inputs: any }
  ): {
    revenue: number
    costs: {
      chemicals: number
      labour: number
      machinery: number
      other: number
      total: number
    }
    profit: number
    metrics: {
      grossMargin: number
      returnOnAssets: number
      costPerTonne: number
      profitPerHa: number
    }
  } {
    // Calculate revenue
    const totalYield = yields.reduce((sum, y) => sum + y.yield * y.area, 0)
    const revenue = totalYield * prices.crop

    // Calculate costs
    const chemicalCost = jobs.reduce((sum, job) => {
      const cost = job.mix.lines.reduce((s: number, line: any) => {
        return s + line.quantity * this.getProductPrice(line.productId)
      }, 0)
      return sum + cost
    }, 0)

    const labourCost = jobs.length * 100 * 3 // Estimate 3 hours per job at $100/hour
    const machineryCost = jobs.reduce((sum, job) => sum + job.areaHa * 25, 0) // $25/ha machinery
    const otherCost = jobs.length * 50 // $50 misc per job

    const totalCost = chemicalCost + labourCost + machineryCost + otherCost
    const profit = revenue - totalCost

    // Calculate metrics
    const totalArea = yields.reduce((sum, y) => sum + y.area, 0)
    const assetValue = 1000000 // Mock asset value

    return {
      revenue,
      costs: {
        chemicals: chemicalCost,
        labour: labourCost,
        machinery: machineryCost,
        other: otherCost,
        total: totalCost,
      },
      profit,
      metrics: {
        grossMargin: (profit / revenue) * 100,
        returnOnAssets: (profit / assetValue) * 100,
        costPerTonne: totalCost / (totalYield || 1),
        profitPerHa: profit / (totalArea || 1),
      },
    }
  }
}