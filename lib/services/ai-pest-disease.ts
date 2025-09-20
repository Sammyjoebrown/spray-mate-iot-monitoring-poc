import { Decimal } from 'decimal.js'

export interface PestIdentification {
  id: string
  confidence: number
  primaryPest: {
    scientificName: string
    commonName: string
    category: 'insect' | 'mite' | 'nematode' | 'mollusk' | 'vertebrate'
    lifecycle: string
    damageType: string
  }
  secondaryPests: Array<{
    name: string
    confidence: number
  }>
  severity: 'low' | 'moderate' | 'high' | 'critical'
  infestationStage: 'early' | 'established' | 'advanced'
  estimatedPopulation: number
  economicThreshold: number
  imageAnalysis: {
    damagePattern: string
    affectedPlantParts: string[]
    colorAnomalies: string[]
    textureChanges: string[]
  }
}

export interface DiseaseIdentification {
  id: string
  confidence: number
  primaryDisease: {
    scientificName: string
    commonName: string
    pathogenType: 'fungal' | 'bacterial' | 'viral' | 'phytoplasma' | 'abiotic'
    symptoms: string[]
    vectored: boolean
    vector?: string
  }
  secondaryDiseases: Array<{
    name: string
    confidence: number
  }>
  severity: 'trace' | 'light' | 'moderate' | 'severe'
  infectionStage: 'initial' | 'spreading' | 'advanced' | 'sporulating'
  percentInfection: number
  spreadRisk: 'low' | 'medium' | 'high' | 'critical'
  environmentalFactors: {
    favorable: string[]
    unfavorable: string[]
  }
}

export interface TreatmentRecommendation {
  id: string
  targetProblem: string
  urgency: 'immediate' | 'within_24h' | 'within_week' | 'monitor'
  treatments: Array<{
    type: 'chemical' | 'biological' | 'cultural' | 'mechanical'
    products: Array<{
      name: string
      activeIngredient: string
      rate: number
      unit: string
      timing: string
      restrictions: string[]
      resistanceGroup: string
    }>
    efficacy: number
    cost: number
    environmentalImpact: 'low' | 'medium' | 'high'
    reentryInterval: number
    preHarvestInterval: number
  }>
  integratedApproach: {
    preventive: string[]
    curative: string[]
    monitoring: string[]
    resistanceManagement: string[]
  }
  economicAnalysis: {
    treatmentCost: number
    potentialLoss: number
    roi: number
    breakEvenYield: number
  }
}

export interface ResistanceProfile {
  pestOrDisease: string
  resistanceGroups: Array<{
    group: string
    mechanism: string
    level: 'none' | 'low' | 'moderate' | 'high' | 'complete'
    firstReported: Date
    affectedProducts: string[]
  }>
  crossResistance: Array<{
    fromGroup: string
    toGroup: string
    likelihood: number
  }>
  managementStrategies: string[]
  alternativeGroups: string[]
}

export class AIPestDiseaseSystem {
  // Simulate AI image analysis for pest identification
  static analyzePestImage(
    imageFeatures: {
      damageType: string
      location: string
      pattern: string
      season: string
      cropStage: string
    }
  ): PestIdentification {
    // Simulate AI confidence based on feature matching
    const pestDatabase = this.getPestDatabase()
    const matches = pestDatabase.filter(pest =>
      pest.damageTypes.includes(imageFeatures.damageType) &&
      pest.locations.includes(imageFeatures.location) &&
      pest.activeSeasons.includes(imageFeatures.season)
    )

    const primaryMatch = matches[0] || pestDatabase[0]
    const confidence = this.calculateConfidence(imageFeatures, primaryMatch)

    return {
      id: `pest-${Date.now()}`,
      confidence,
      primaryPest: {
        scientificName: primaryMatch.scientificName,
        commonName: primaryMatch.commonName,
        category: primaryMatch.category,
        lifecycle: primaryMatch.lifecycle,
        damageType: primaryMatch.primaryDamage,
      },
      secondaryPests: matches.slice(1, 3).map(p => ({
        name: p.commonName,
        confidence: this.calculateConfidence(imageFeatures, p) * 0.7,
      })),
      severity: this.assessSeverity(imageFeatures),
      infestationStage: this.determineInfestationStage(imageFeatures),
      estimatedPopulation: Math.round(Math.random() * 1000 + 100),
      economicThreshold: primaryMatch.economicThreshold,
      imageAnalysis: {
        damagePattern: imageFeatures.pattern,
        affectedPlantParts: [imageFeatures.location],
        colorAnomalies: ['Yellowing', 'Brown spots'],
        textureChanges: ['Wilting', 'Curling'],
      },
    }
  }

  // Simulate AI image analysis for disease identification
  static analyzeDiseaseImage(
    imageFeatures: {
      symptoms: string[]
      plantPart: string
      pattern: string
      season: string
      humidity: number
      temperature: number
    }
  ): DiseaseIdentification {
    const diseaseDatabase = this.getDiseaseDatabase()

    // Score each disease based on symptom matching
    const scores = diseaseDatabase.map(disease => ({
      disease,
      score: this.calculateDiseaseScore(imageFeatures, disease),
    })).sort((a, b) => b.score - a.score)

    const primaryMatch = scores[0].disease
    const confidence = scores[0].score

    return {
      id: `disease-${Date.now()}`,
      confidence,
      primaryDisease: {
        scientificName: primaryMatch.scientificName,
        commonName: primaryMatch.commonName,
        pathogenType: primaryMatch.type,
        symptoms: primaryMatch.symptoms,
        vectored: primaryMatch.vectored,
        vector: primaryMatch.vector,
      },
      secondaryDiseases: scores.slice(1, 3).map(s => ({
        name: s.disease.commonName,
        confidence: s.score,
      })),
      severity: this.assessDiseaseSeverity(imageFeatures),
      infectionStage: this.determineInfectionStage(imageFeatures),
      percentInfection: Math.round(Math.random() * 60 + 5),
      spreadRisk: this.assessSpreadRisk(imageFeatures.humidity, imageFeatures.temperature),
      environmentalFactors: {
        favorable: this.getFavorableFactors(imageFeatures),
        unfavorable: this.getUnfavorableFactors(imageFeatures),
      },
    }
  }

  // Generate treatment recommendations based on identification
  static generateTreatmentPlan(
    identification: PestIdentification | DiseaseIdentification,
    cropStage: string,
    previousApplications: any[],
    marketRequirements: any
  ): TreatmentRecommendation {
    const isPest = 'primaryPest' in identification
    const target = isPest ?
      (identification as PestIdentification).primaryPest.commonName :
      (identification as DiseaseIdentification).primaryDisease.commonName

    const treatments = this.selectTreatments(
      target,
      identification.severity,
      cropStage,
      previousApplications,
      marketRequirements
    )

    const urgency = this.determineUrgency(identification.severity, identification.confidence)
    const economicAnalysis = this.performEconomicAnalysis(treatments[0], identification)

    return {
      id: `treatment-${Date.now()}`,
      targetProblem: target,
      urgency,
      treatments,
      integratedApproach: {
        preventive: this.getPreventiveMeasures(target),
        curative: this.getCurativeMeasures(target),
        monitoring: this.getMonitoringStrategies(target),
        resistanceManagement: this.getResistanceStrategies(previousApplications),
      },
      economicAnalysis,
    }
  }

  // Resistance management system
  static analyzeResistanceRisk(
    pestOrDisease: string,
    applicationHistory: Array<{
      product: string
      activeIngredient: string
      modeOfAction: string
      date: Date
      efficacy: number
    }>,
    regionData: any
  ): ResistanceProfile {
    // Group applications by mode of action
    const moaGroups = new Map<string, number>()
    applicationHistory.forEach(app => {
      moaGroups.set(app.modeOfAction, (moaGroups.get(app.modeOfAction) || 0) + 1)
    })

    // Check for repeated use patterns
    const resistanceGroups = Array.from(moaGroups.entries()).map(([group, count]) => {
      const level = this.calculateResistanceLevel(count, applicationHistory)
      return {
        group,
        mechanism: this.getResistanceMechanism(group),
        level,
        firstReported: new Date(Date.now() - Math.random() * 31536000000), // Random date in past year
        affectedProducts: applicationHistory
          .filter(a => a.modeOfAction === group)
          .map(a => a.product),
      }
    })

    return {
      pestOrDisease,
      resistanceGroups,
      crossResistance: this.identifyCrossResistance(resistanceGroups),
      managementStrategies: this.generateResistanceStrategies(resistanceGroups),
      alternativeGroups: this.findAlternativeMOAs(resistanceGroups),
    }
  }

  // Predictive disease modeling
  static predictDiseaseOutbreak(
    historicalData: any[],
    currentConditions: any,
    forecast: any[],
    cropStage: string
  ): {
    disease: string
    probability: number
    peakRiskDate: Date
    riskFactors: string[]
    preventiveActions: string[]
  }[] {
    const predictions = []
    const diseases = this.getDiseaseDatabase()

    for (const disease of diseases) {
      const riskScore = this.calculateOutbreakRisk(
        disease,
        historicalData,
        currentConditions,
        forecast,
        cropStage
      )

      if (riskScore > 30) {
        predictions.push({
          disease: disease.commonName,
          probability: riskScore,
          peakRiskDate: this.findPeakRiskDate(forecast, disease),
          riskFactors: this.identifyRiskFactors(disease, currentConditions),
          preventiveActions: this.suggestPreventiveActions(disease, riskScore),
        })
      }
    }

    return predictions.sort((a, b) => b.probability - a.probability)
  }

  // Private helper methods
  private static getPestDatabase() {
    return [
      {
        scientificName: 'Helicoverpa armigera',
        commonName: 'Cotton Bollworm',
        category: 'insect' as const,
        lifecycle: 'Complete metamorphosis: egg-larva-pupa-adult',
        primaryDamage: 'Fruit boring and feeding',
        damageTypes: ['holes', 'boring', 'chewing'],
        locations: ['fruit', 'flower', 'terminal'],
        activeSeasons: ['spring', 'summer'],
        economicThreshold: 2,
      },
      {
        scientificName: 'Bemisia tabaci',
        commonName: 'Silverleaf Whitefly',
        category: 'insect' as const,
        lifecycle: 'Incomplete metamorphosis: egg-nymph-adult',
        primaryDamage: 'Sap sucking and virus transmission',
        damageTypes: ['yellowing', 'stunting', 'honeydew'],
        locations: ['leaf', 'underside'],
        activeSeasons: ['summer', 'autumn'],
        economicThreshold: 3,
      },
      {
        scientificName: 'Tetranychus urticae',
        commonName: 'Two-spotted Mite',
        category: 'mite' as const,
        lifecycle: 'Egg-larva-nymph-adult',
        primaryDamage: 'Cell content feeding',
        damageTypes: ['stippling', 'bronzing', 'webbing'],
        locations: ['leaf', 'underside'],
        activeSeasons: ['summer', 'autumn'],
        economicThreshold: 5,
      },
    ]
  }

  private static getDiseaseDatabase() {
    return [
      {
        scientificName: 'Puccinia striiformis',
        commonName: 'Stripe Rust',
        type: 'fungal' as const,
        symptoms: ['Yellow stripes', 'Pustules', 'Leaf yellowing'],
        optimalTemp: [10, 20],
        optimalHumidity: [80, 100],
        vectored: false,
        vector: null,
      },
      {
        scientificName: 'Phytophthora infestans',
        commonName: 'Late Blight',
        type: 'fungal' as const,
        symptoms: ['Water-soaked lesions', 'White sporulation', 'Stem lesions'],
        optimalTemp: [15, 25],
        optimalHumidity: [85, 100],
        vectored: false,
        vector: null,
      },
      {
        scientificName: 'Xanthomonas campestris',
        commonName: 'Black Rot',
        type: 'bacterial' as const,
        symptoms: ['V-shaped lesions', 'Vein blackening', 'Yellowing'],
        optimalTemp: [25, 30],
        optimalHumidity: [80, 95],
        vectored: false,
        vector: null,
      },
    ]
  }

  private static calculateConfidence(features: any, pest: any): number {
    let score = 60 // Base confidence

    if (pest.damageTypes.includes(features.damageType)) score += 15
    if (pest.locations.includes(features.location)) score += 10
    if (pest.activeSeasons.includes(features.season)) score += 10

    // Add randomness to simulate AI uncertainty
    score += Math.random() * 10 - 5

    return Math.min(95, Math.max(30, score))
  }

  private static calculateDiseaseScore(features: any, disease: any): number {
    let score = 50

    // Symptom matching
    const matchedSymptoms = disease.symptoms.filter((s: string) =>
      features.symptoms.some((fs: string) => fs.toLowerCase().includes(s.toLowerCase()))
    )
    score += matchedSymptoms.length * 15

    // Environmental suitability
    if (features.temperature >= disease.optimalTemp[0] &&
        features.temperature <= disease.optimalTemp[1]) {
      score += 10
    }
    if (features.humidity >= disease.optimalHumidity[0] &&
        features.humidity <= disease.optimalHumidity[1]) {
      score += 10
    }

    return Math.min(95, Math.max(20, score))
  }

  private static assessSeverity(features: any): 'low' | 'moderate' | 'high' | 'critical' {
    const random = Math.random()
    if (random < 0.3) return 'low'
    if (random < 0.6) return 'moderate'
    if (random < 0.85) return 'high'
    return 'critical'
  }

  private static assessDiseaseSeverity(features: any): 'trace' | 'light' | 'moderate' | 'severe' {
    const symptomCount = features.symptoms.length
    if (symptomCount <= 1) return 'trace'
    if (symptomCount <= 2) return 'light'
    if (symptomCount <= 3) return 'moderate'
    return 'severe'
  }

  private static determineInfestationStage(features: any): 'early' | 'established' | 'advanced' {
    if (features.cropStage === 'seedling') return 'early'
    if (features.cropStage === 'vegetative') return 'established'
    return 'advanced'
  }

  private static determineInfectionStage(features: any): 'initial' | 'spreading' | 'advanced' | 'sporulating' {
    const stages = ['initial', 'spreading', 'advanced', 'sporulating'] as const
    return stages[Math.floor(Math.random() * stages.length)]
  }

  private static assessSpreadRisk(humidity: number, temperature: number): 'low' | 'medium' | 'high' | 'critical' {
    if (humidity > 80 && temperature > 20 && temperature < 30) return 'critical'
    if (humidity > 70 && temperature > 15 && temperature < 30) return 'high'
    if (humidity > 60) return 'medium'
    return 'low'
  }

  private static getFavorableFactors(features: any): string[] {
    const factors = []
    if (features.humidity > 70) factors.push('High humidity')
    if (features.temperature > 20 && features.temperature < 30) factors.push('Optimal temperature')
    if (features.season === 'spring' || features.season === 'summer') factors.push('Growing season')
    return factors
  }

  private static getUnfavorableFactors(features: any): string[] {
    const factors = []
    if (features.humidity < 40) factors.push('Low humidity')
    if (features.temperature < 10 || features.temperature > 35) factors.push('Extreme temperature')
    if (features.season === 'winter') factors.push('Dormant season')
    return factors
  }

  private static selectTreatments(
    target: string,
    severity: string,
    cropStage: string,
    previousApplications: any[],
    marketRequirements: any
  ): any[] {
    // Generate mock treatment options
    return [
      {
        type: 'chemical',
        products: [
          {
            name: 'Altacor',
            activeIngredient: 'Chlorantraniliprole',
            rate: 75,
            unit: 'g/ha',
            timing: 'At first sign of damage',
            restrictions: ['Not within 7 days of harvest', 'Maximum 3 applications per season'],
            resistanceGroup: '28',
          },
        ],
        efficacy: 92,
        cost: 85,
        environmentalImpact: 'low',
        reentryInterval: 4,
        preHarvestInterval: 7,
      },
      {
        type: 'biological',
        products: [
          {
            name: 'Dipel DF',
            activeIngredient: 'Bacillus thuringiensis',
            rate: 500,
            unit: 'g/ha',
            timing: 'Target small larvae',
            restrictions: ['Apply in evening'],
            resistanceGroup: '11A',
          },
        ],
        efficacy: 75,
        cost: 45,
        environmentalImpact: 'low',
        reentryInterval: 0,
        preHarvestInterval: 0,
      },
    ]
  }

  private static determineUrgency(severity: string, confidence: number): 'immediate' | 'within_24h' | 'within_week' | 'monitor' {
    if (severity === 'critical' && confidence > 80) return 'immediate'
    if (severity === 'high' || (severity === 'critical' && confidence > 60)) return 'within_24h'
    if (severity === 'moderate') return 'within_week'
    return 'monitor'
  }

  private static performEconomicAnalysis(treatment: any, identification: any): any {
    const treatmentCost = treatment.cost * 10 // $/ha
    const potentialLoss = Math.random() * 500 + 200 // $/ha
    const roi = (potentialLoss - treatmentCost) / treatmentCost
    const breakEvenYield = treatmentCost / 0.25 // Assuming $0.25/kg crop price

    return {
      treatmentCost,
      potentialLoss,
      roi,
      breakEvenYield,
    }
  }

  private static getPreventiveMeasures(target: string): string[] {
    return [
      'Crop rotation with non-host species',
      'Resistant variety selection',
      'Optimal planting date adjustment',
      'Field hygiene and volunteer control',
      'Beneficial insect habitat management',
    ]
  }

  private static getCurativeMeasures(target: string): string[] {
    return [
      'Targeted pesticide application',
      'Biological control agent release',
      'Infected plant removal',
      'Adjust irrigation to reduce humidity',
      'Apply systemic products',
    ]
  }

  private static getMonitoringStrategies(target: string): string[] {
    return [
      'Weekly field scouting',
      'Pheromone trap deployment',
      'Sticky trap monitoring',
      'Degree day tracking',
      'Sentinel plant observation',
    ]
  }

  private static getResistanceStrategies(previousApplications: any[]): string[] {
    return [
      'Rotate mode of action groups',
      'Use mixture products',
      'Apply at full label rates',
      'Include non-chemical tactics',
      'Limit applications per season',
    ]
  }

  private static calculateResistanceLevel(
    count: number,
    history: any[]
  ): 'none' | 'low' | 'moderate' | 'high' | 'complete' {
    if (count === 0) return 'none'
    if (count <= 2) return 'low'
    if (count <= 4) return 'moderate'
    if (count <= 6) return 'high'
    return 'complete'
  }

  private static getResistanceMechanism(group: string): string {
    const mechanisms: Record<string, string> = {
      '1': 'Acetylcholinesterase inhibition',
      '2': 'GABA-gated chloride channel antagonism',
      '3': 'Sodium channel modulation',
      '4': 'Nicotinic acetylcholine receptor agonism',
      '28': 'Ryanodine receptor modulation',
    }
    return mechanisms[group] || 'Unknown mechanism'
  }

  private static identifyCrossResistance(groups: any[]): any[] {
    // Simplified cross-resistance patterns
    return [
      { fromGroup: '1A', toGroup: '1B', likelihood: 80 },
      { fromGroup: '3A', toGroup: '3B', likelihood: 60 },
    ]
  }

  private static generateResistanceStrategies(groups: any[]): string[] {
    const strategies = []
    const hasHighResistance = groups.some(g => g.level === 'high' || g.level === 'complete')

    if (hasHighResistance) {
      strategies.push('Immediately rotate to different MOA group')
      strategies.push('Implement refuge areas')
      strategies.push('Increase biological control emphasis')
    }

    strategies.push('Use full label rates only')
    strategies.push('Apply tank mixtures with different MOAs')
    strategies.push('Monitor efficacy closely')

    return strategies
  }

  private static findAlternativeMOAs(usedGroups: any[]): string[] {
    const allGroups = ['1', '2', '3', '4', '5', '6', '11', '15', '22', '28']
    const used = usedGroups.map(g => g.group)
    return allGroups.filter(g => !used.includes(g))
  }

  private static calculateOutbreakRisk(
    disease: any,
    historicalData: any[],
    currentConditions: any,
    forecast: any[],
    cropStage: string
  ): number {
    let risk = 0

    // Environmental suitability
    if (currentConditions.tempC >= disease.optimalTemp[0] &&
        currentConditions.tempC <= disease.optimalTemp[1]) {
      risk += 30
    }
    if (currentConditions.rhPct >= disease.optimalHumidity[0]) {
      risk += 30
    }

    // Historical presence
    if (historicalData.some(h => h.disease === disease.commonName)) {
      risk += 20
    }

    // Forecast favorability
    const favorableDays = forecast.filter(f =>
      f.tempC >= disease.optimalTemp[0] &&
      f.tempC <= disease.optimalTemp[1] &&
      f.rhPct >= disease.optimalHumidity[0]
    ).length
    risk += favorableDays * 5

    return Math.min(100, risk)
  }

  private static findPeakRiskDate(forecast: any[], disease: any): Date {
    // Find the day with most favorable conditions
    const riskScores = forecast.map((day, index) => ({
      index,
      score: this.calculateDayRisk(day, disease),
    }))

    const peakDay = riskScores.reduce((max, current) =>
      current.score > max.score ? current : max
    )

    return new Date(Date.now() + peakDay.index * 86400000)
  }

  private static calculateDayRisk(day: any, disease: any): number {
    let score = 0
    if (day.tempC >= disease.optimalTemp[0] && day.tempC <= disease.optimalTemp[1]) {
      score += 50
    }
    if (day.rhPct >= disease.optimalHumidity[0]) {
      score += 50
    }
    return score
  }

  private static identifyRiskFactors(disease: any, conditions: any): string[] {
    const factors = []
    if (conditions.tempC >= disease.optimalTemp[0] &&
        conditions.tempC <= disease.optimalTemp[1]) {
      factors.push('Optimal temperature range')
    }
    if (conditions.rhPct >= disease.optimalHumidity[0]) {
      factors.push('High humidity')
    }
    if (conditions.leafWetness > 6) {
      factors.push('Extended leaf wetness')
    }
    return factors
  }

  private static suggestPreventiveActions(disease: any, risk: number): string[] {
    const actions = []

    if (risk > 70) {
      actions.push('Apply preventive fungicide immediately')
      actions.push('Increase scouting frequency')
    } else if (risk > 50) {
      actions.push('Prepare for potential application')
      actions.push('Monitor weather closely')
    }

    actions.push('Ensure proper plant spacing for airflow')
    actions.push('Avoid overhead irrigation')
    actions.push('Remove infected plant debris')

    return actions
  }
}