import { Decimal } from 'decimal.js'

export interface Jurisdiction {
  id: string
  name: string
  country: string
  state: string
  regulations: {
    pesticideLicensing: {
      required: boolean
      renewalPeriod: number // months
      trainingHours: number
      categories: string[]
    }
    recordKeeping: {
      retentionPeriod: number // years
      requiredFields: string[]
      digitalAccepted: boolean
      auditFrequency: number // months
    }
    bufferZones: {
      waterways: number // meters
      sensitiveAreas: number
      organic: number
      residential: number
      schools: number
    }
    notification: {
      neighbors: boolean
      advanceNotice: number // hours
      publicRegister: boolean
      signage: boolean
    }
    restrictions: {
      bannedProducts: string[]
      restrictedUseProducts: string[]
      seasonalRestrictions: Array<{
        product: string
        startDate: string
        endDate: string
      }>
    }
  }
  exportMarkets: Array<{
    country: string
    mrlDatabase: string // URL
    certificationRequired: boolean
    additionalTesting: string[]
  }>
}

export interface ComplianceAudit {
  id: string
  date: Date
  auditor: string
  type: 'internal' | 'external' | 'regulatory'
  scope: string[]
  findings: Array<{
    category: string
    severity: 'minor' | 'major' | 'critical'
    description: string
    evidence: string
    correctiveAction: string
    dueDate: Date
    status: 'open' | 'in_progress' | 'closed'
  }>
  score: number
  certification: {
    standard: string
    status: 'passed' | 'failed' | 'conditional'
    validUntil?: Date
  }
}

export interface ExportCompliance {
  marketCountry: string
  crop: string
  harvestDate: Date
  appliedProducts: Array<{
    productName: string
    activeIngredient: string
    lastApplicationDate: Date
    daysBeforeHarvest: number
    appliedRate: number
    mrlLimit: number
    mrlUnit: string
    residueRisk: 'low' | 'medium' | 'high'
  }>
  testingRequired: {
    preHarvest: boolean
    atHarvest: boolean
    compounds: string[]
    laboratory: string
    turnaround: number // days
  }
  compliance: {
    status: 'compliant' | 'non_compliant' | 'testing_required'
    issues: string[]
    recommendations: string[]
  }
}

export interface ChainOfCustody {
  id: string
  productId: string
  batchNumber: string
  events: Array<{
    timestamp: Date
    type: 'received' | 'stored' | 'mixed' | 'applied' | 'disposed'
    location: string
    quantity: number
    unit: string
    handler: string
    verification: string
    notes?: string
  }>
  storage: {
    facility: string
    conditions: {
      temperature: number[]
      humidity: number[]
      segregation: boolean
      locked: boolean
    }
    inspections: Array<{
      date: Date
      inspector: string
      issues: string[]
      actions: string[]
    }>
  }
  disposal: {
    method: 'triple_rinse' | 'drum_muster' | 'chemical_waste' | 'incineration'
    date?: Date
    contractor?: string
    certificate?: string
  }
}

export interface WorkerSafety {
  workerId: string
  name: string
  certifications: Array<{
    type: string
    issueDate: Date
    expiryDate: Date
    trainingProvider: string
    competencies: string[]
  }>
  medicalClearances: Array<{
    type: string
    date: Date
    restrictions: string[]
    nextReview: Date
  }>
  exposureHistory: Array<{
    date: Date
    productName: string
    activeIngredient: string
    exposureDuration: number // minutes
    ppe: string[]
    biomonitoring?: {
      test: string
      result: number
      unit: string
      reference: string
    }
  }>
  training: Array<{
    course: string
    date: Date
    provider: string
    score?: number
    certificate?: string
  }>
  incidents: Array<{
    date: Date
    type: string
    description: string
    investigation: string
    outcome: string
  }>
}

export interface NeighborNotification {
  id: string
  jobId: string
  notificationDate: Date
  method: 'letter' | 'email' | 'sms' | 'door_knock'
  recipients: Array<{
    name: string
    property: string
    distance: number // meters
    contact: string
    acknowledged: boolean
    concerns?: string
  }>
  details: {
    sprayDate: Date
    products: string[]
    blocks: string[]
    bufferZones: number
    windDirection: string
    precautions: string[]
  }
  responses: Array<{
    from: string
    date: Date
    concern: string
    resolution: string
  }>
}

export class ComplianceRegulatorySystem {
  // Check compliance against jurisdiction rules
  static checkJurisdictionCompliance(
    jurisdiction: Jurisdiction,
    operation: {
      operator: { licensed: boolean; licenseExpiry: Date; trainingHours: number }
      products: Array<{ name: string; restricted: boolean }>
      buffers: { waterway: number; residential: number; school: number }
      notification: { completed: boolean; advanceHours: number }
      records: { digital: boolean; retention: number }
    }
  ): {
    compliant: boolean
    violations: Array<{
      regulation: string
      requirement: string
      actual: string
      severity: 'minor' | 'major' | 'critical'
      remediation: string
    }>
    warnings: string[]
  } {
    const violations = []
    const warnings = []

    // Check operator licensing
    if (jurisdiction.regulations.pesticideLicensing.required) {
      if (!operation.operator.licensed) {
        violations.push({
          regulation: 'Operator Licensing',
          requirement: 'Valid pesticide license required',
          actual: 'No license',
          severity: 'critical' as const,
          remediation: 'Operator must obtain license before spraying',
        })
      } else if (new Date(operation.operator.licenseExpiry) < new Date()) {
        violations.push({
          regulation: 'Operator Licensing',
          requirement: 'Current license',
          actual: 'Expired license',
          severity: 'critical' as const,
          remediation: 'Renew license immediately',
        })
      }

      if (operation.operator.trainingHours < jurisdiction.regulations.pesticideLicensing.trainingHours) {
        warnings.push(`Additional ${jurisdiction.regulations.pesticideLicensing.trainingHours - operation.operator.trainingHours} training hours required`)
      }
    }

    // Check buffer zones
    if (operation.buffers.waterway < jurisdiction.regulations.bufferZones.waterways) {
      violations.push({
        regulation: 'Buffer Zones',
        requirement: `${jurisdiction.regulations.bufferZones.waterways}m from waterways`,
        actual: `${operation.buffers.waterway}m`,
        severity: 'major' as const,
        remediation: 'Increase buffer distance or use drift-reducing technology',
      })
    }

    // Check product restrictions
    for (const product of operation.products) {
      if (jurisdiction.regulations.restrictions.bannedProducts.includes(product.name)) {
        violations.push({
          regulation: 'Product Restrictions',
          requirement: 'Product not banned',
          actual: `${product.name} is banned`,
          severity: 'critical' as const,
          remediation: 'Use alternative product',
        })
      }

      if (product.restricted && !operation.operator.licensed) {
        violations.push({
          regulation: 'Restricted Use Products',
          requirement: 'Licensed operator for restricted products',
          actual: 'Unlicensed operator',
          severity: 'critical' as const,
          remediation: 'Only licensed operators can apply restricted products',
        })
      }
    }

    // Check notification requirements
    if (jurisdiction.regulations.notification.neighbors) {
      if (!operation.notification.completed) {
        violations.push({
          regulation: 'Neighbor Notification',
          requirement: 'Notify neighbors before spraying',
          actual: 'No notification',
          severity: 'major' as const,
          remediation: `Notify neighbors ${jurisdiction.regulations.notification.advanceNotice} hours in advance`,
        })
      } else if (operation.notification.advanceHours < jurisdiction.regulations.notification.advanceNotice) {
        warnings.push('Insufficient advance notice provided')
      }
    }

    // Check record keeping
    if (!operation.records.digital && !jurisdiction.regulations.recordKeeping.digitalAccepted) {
      warnings.push('Digital records may not be accepted for audit')
    }

    if (operation.records.retention < jurisdiction.regulations.recordKeeping.retentionPeriod) {
      violations.push({
        regulation: 'Record Keeping',
        requirement: `${jurisdiction.regulations.recordKeeping.retentionPeriod} years retention`,
        actual: `${operation.records.retention} years`,
        severity: 'minor' as const,
        remediation: 'Update record retention policy',
      })
    }

    return {
      compliant: violations.length === 0,
      violations,
      warnings,
    }
  }

  // Check export market MRL compliance
  static checkExportCompliance(
    targetMarket: string,
    crop: string,
    applications: Array<{
      productName: string
      activeIngredient: string
      rate: number
      applicationDate: Date
      phi: number
    }>,
    harvestDate: Date
  ): ExportCompliance {
    // Mock MRL database
    const mrlLimits = this.getMRLLimits(targetMarket, crop)

    const appliedProducts = applications.map(app => {
      const daysBeforeHarvest = Math.floor(
        (harvestDate.getTime() - app.applicationDate.getTime()) / 86400000
      )

      const mrl = mrlLimits[app.activeIngredient] || 0.01 // Default MRL
      const estimatedResidue = this.estimateResidue(
        app.rate,
        daysBeforeHarvest,
        app.activeIngredient
      )

      const residueRisk = estimatedResidue > mrl * 0.8 ? 'high' :
                         estimatedResidue > mrl * 0.5 ? 'medium' : 'low'

      return {
        productName: app.productName,
        activeIngredient: app.activeIngredient,
        lastApplicationDate: app.applicationDate,
        daysBeforeHarvest,
        appliedRate: app.rate,
        mrlLimit: mrl,
        mrlUnit: 'mg/kg',
        residueRisk,
      }
    })

    const issues = []
    const recommendations = []

    // Check for violations
    for (const product of appliedProducts) {
      if (product.daysBeforeHarvest < 0) {
        issues.push(`${product.productName} PHI not met`)
        recommendations.push(`Delay harvest by ${Math.abs(product.daysBeforeHarvest)} days`)
      }

      if (product.residueRisk === 'high') {
        issues.push(`High residue risk for ${product.activeIngredient}`)
        recommendations.push(`Test for ${product.activeIngredient} before export`)
      }
    }

    const requiresTesting = appliedProducts.some(p => p.residueRisk !== 'low')

    return {
      marketCountry: targetMarket,
      crop,
      harvestDate,
      appliedProducts,
      testingRequired: {
        preHarvest: requiresTesting,
        atHarvest: requiresTesting,
        compounds: appliedProducts
          .filter(p => p.residueRisk !== 'low')
          .map(p => p.activeIngredient),
        laboratory: 'Approved Export Testing Lab',
        turnaround: 5,
      },
      compliance: {
        status: issues.length === 0 ? 'compliant' :
                requiresTesting ? 'testing_required' : 'non_compliant',
        issues,
        recommendations,
      },
    }
  }

  // Conduct compliance audit
  static conductAudit(
    scope: string[],
    records: any[],
    operations: any[]
  ): ComplianceAudit {
    const findings = []
    const auditor = 'Internal Compliance System'

    // Check record completeness
    if (scope.includes('records')) {
      const incompleteRecords = records.filter(r => !r.complete).length
      if (incompleteRecords > 0) {
        findings.push({
          category: 'Record Keeping',
          severity: 'minor' as const,
          description: `${incompleteRecords} incomplete spray records found`,
          evidence: 'Database query',
          correctiveAction: 'Complete all missing fields in spray records',
          dueDate: new Date(Date.now() + 7 * 86400000),
          status: 'open' as const,
        })
      }
    }

    // Check PPE compliance
    if (scope.includes('safety')) {
      const noPPE = operations.filter(op => !op.ppeUsed).length
      if (noPPE > 0) {
        findings.push({
          category: 'Worker Safety',
          severity: 'major' as const,
          description: `PPE not recorded for ${noPPE} operations`,
          evidence: 'Safety records',
          correctiveAction: 'Implement PPE checklist for all operations',
          dueDate: new Date(Date.now() + 14 * 86400000),
          status: 'open' as const,
        })
      }
    }

    // Check chemical storage
    if (scope.includes('storage')) {
      const storageIssues = this.auditChemicalStorage()
      findings.push(...storageIssues)
    }

    // Calculate compliance score
    const criticalCount = findings.filter(f => f.severity === 'critical').length
    const majorCount = findings.filter(f => f.severity === 'major').length
    const minorCount = findings.filter(f => f.severity === 'minor').length

    const score = Math.max(0, 100 - criticalCount * 30 - majorCount * 10 - minorCount * 3)

    const status = criticalCount > 0 ? 'failed' :
                  majorCount > 2 ? 'conditional' : 'passed'

    return {
      id: `audit-${Date.now()}`,
      date: new Date(),
      auditor,
      type: 'internal',
      scope,
      findings,
      score,
      certification: {
        standard: 'ISO 14001',
        status,
        validUntil: status === 'passed' ? new Date(Date.now() + 365 * 86400000) : undefined,
      },
    }
  }

  // Track chain of custody for chemicals
  static trackChainOfCustody(
    productId: string,
    batchNumber: string,
    events: any[]
  ): ChainOfCustody {
    const storageConditions = {
      temperature: events
        .filter(e => e.temperature)
        .map(e => e.temperature),
      humidity: events
        .filter(e => e.humidity)
        .map(e => e.humidity),
      segregation: true,
      locked: true,
    }

    const inspections = [
      {
        date: new Date(Date.now() - 30 * 86400000),
        inspector: 'Safety Officer',
        issues: [],
        actions: [],
      },
    ]

    const disposal = events.find(e => e.type === 'disposed')

    return {
      id: `chain-${Date.now()}`,
      productId,
      batchNumber,
      events: events.map(e => ({
        timestamp: e.timestamp,
        type: e.type,
        location: e.location,
        quantity: e.quantity,
        unit: e.unit,
        handler: e.handler,
        verification: e.signature || 'Digital signature',
        notes: e.notes,
      })),
      storage: {
        facility: 'Main Chemical Store',
        conditions: storageConditions,
        inspections,
      },
      disposal: disposal ? {
        method: 'triple_rinse',
        date: disposal.timestamp,
        contractor: 'Approved Waste Contractor',
        certificate: `CERT-${Date.now()}`,
      } : {
        method: 'triple_rinse',
      },
    }
  }

  // Manage worker safety records
  static assessWorkerSafety(
    worker: WorkerSafety,
    plannedExposures: Array<{ product: string; duration: number }>
  ): {
    cleared: boolean
    restrictions: string[]
    requirements: string[]
    monitoring: string[]
  } {
    const restrictions = []
    const requirements = []
    const monitoring = []

    // Check certification currency
    const now = new Date()
    const expiredCerts = worker.certifications.filter(c => c.expiryDate < now)
    if (expiredCerts.length > 0) {
      restrictions.push('Expired certifications must be renewed')
      requirements.push(...expiredCerts.map(c => `Renew ${c.type}`))
    }

    // Check medical clearances
    const medicalDue = worker.medicalClearances.some(m => m.nextReview < now)
    if (medicalDue) {
      requirements.push('Medical review required')
    }

    // Check exposure limits
    const totalExposure = plannedExposures.reduce((sum, e) => sum + e.duration, 0)
    const recentExposure = worker.exposureHistory
      .filter(e => e.date > new Date(Date.now() - 7 * 86400000))
      .reduce((sum, e) => sum + e.exposureDuration, 0)

    if (recentExposure + totalExposure > 480) { // 8 hours in past week
      restrictions.push('Weekly exposure limit reached')
      monitoring.push('Biological monitoring recommended')
    }

    // Check for high-risk products
    const highRiskProducts = plannedExposures.filter(e =>
      e.product.includes('Paraquat') || e.product.includes('2,4-D')
    )
    if (highRiskProducts.length > 0) {
      requirements.push('Additional PPE required for high-risk products')
      monitoring.push('Cholinesterase testing required')
    }

    return {
      cleared: restrictions.length === 0,
      restrictions,
      requirements,
      monitoring,
    }
  }

  // Generate neighbor notification
  static generateNeighborNotification(
    job: any,
    neighbors: Array<{ name: string; property: string; distance: number; contact: string }>
  ): NeighborNotification {
    const notification: NeighborNotification = {
      id: `notify-${Date.now()}`,
      jobId: job.id,
      notificationDate: new Date(),
      method: 'email',
      recipients: neighbors.map(n => ({
        ...n,
        acknowledged: false,
      })),
      details: {
        sprayDate: job.plannedStart,
        products: job.mix.lines.map((l: any) => l.productName),
        blocks: [job.blockId],
        bufferZones: 20,
        windDirection: 'Away from properties',
        precautions: [
          'Close windows and doors during spraying',
          'Keep children and pets indoors',
          'Cover water tanks if applicable',
          'Wash vegetables before consumption',
        ],
      },
      responses: [],
    }

    return notification
  }

  // Helper methods
  private static getMRLLimits(market: string, crop: string): Record<string, number> {
    // Mock MRL database
    const mrls: Record<string, Record<string, number>> = {
      EU: {
        glyphosate: 0.1,
        atrazine: 0.05,
        chlorpyrifos: 0.01,
        imidacloprid: 0.5,
      },
      USA: {
        glyphosate: 0.2,
        atrazine: 0.1,
        chlorpyrifos: 0.05,
        imidacloprid: 0.7,
      },
      Japan: {
        glyphosate: 0.05,
        atrazine: 0.02,
        chlorpyrifos: 0.01,
        imidacloprid: 0.3,
      },
    }

    return mrls[market] || mrls.EU
  }

  private static estimateResidue(
    applicationRate: number,
    daysSinceApplication: number,
    activeIngredient: string
  ): number {
    // Simplified residue decay model
    const halfLife = this.getHalfLife(activeIngredient)
    const decayFactor = Math.pow(0.5, daysSinceApplication / halfLife)
    const initialResidue = applicationRate * 0.001 // Convert to mg/kg
    return initialResidue * decayFactor
  }

  private static getHalfLife(activeIngredient: string): number {
    const halfLives: Record<string, number> = {
      glyphosate: 47,
      atrazine: 60,
      chlorpyrifos: 30,
      imidacloprid: 120,
    }
    return halfLives[activeIngredient.toLowerCase()] || 30
  }

  private static auditChemicalStorage(): any[] {
    const findings = []

    // Simulate storage audit findings
    if (Math.random() > 0.7) {
      findings.push({
        category: 'Chemical Storage',
        severity: 'minor',
        description: 'Spill kit not fully stocked',
        evidence: 'Visual inspection',
        correctiveAction: 'Restock spill kit materials',
        dueDate: new Date(Date.now() + 3 * 86400000),
        status: 'open',
      })
    }

    if (Math.random() > 0.8) {
      findings.push({
        category: 'Chemical Storage',
        severity: 'major',
        description: 'Incompatible products stored together',
        evidence: 'Storage audit',
        correctiveAction: 'Segregate oxidizers from flammables',
        dueDate: new Date(Date.now() + 1 * 86400000),
        status: 'open',
      })
    }

    return findings
  }
}