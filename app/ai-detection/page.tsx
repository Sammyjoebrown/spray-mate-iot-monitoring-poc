'use client'

import { useState } from 'react'
import { AIPestDiseaseSystem } from '@/lib/services/ai-pest-disease'
import { Camera, Upload, AlertCircle, TrendingUp, Shield, Target, Brain, Microscope } from 'lucide-react'

export default function AIDetectionPage() {
  const [activeTab, setActiveTab] = useState<'pest' | 'disease'>('pest')
  const [identification, setIdentification] = useState<any>(null)
  const [treatment, setTreatment] = useState<any>(null)
  const [resistance, setResistance] = useState<any>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const handleImageAnalysis = () => {
    setAnalyzing(true)

    setTimeout(() => {
      if (activeTab === 'pest') {
        const pestResult = AIPestDiseaseSystem.analyzePestImage({
          damageType: 'boring',
          location: 'fruit',
          pattern: 'clustered',
          season: 'summer',
          cropStage: 'reproductive',
        })
        setIdentification(pestResult)

        const treatmentPlan = AIPestDiseaseSystem.generateTreatmentPlan(
          pestResult,
          'reproductive',
          [],
          {}
        )
        setTreatment(treatmentPlan)
      } else {
        const diseaseResult = AIPestDiseaseSystem.analyzeDiseaseImage({
          symptoms: ['Yellow stripes', 'Pustules'],
          plantPart: 'leaf',
          pattern: 'systemic',
          season: 'spring',
          humidity: 75,
          temperature: 18,
        })
        setIdentification(diseaseResult)

        const treatmentPlan = AIPestDiseaseSystem.generateTreatmentPlan(
          diseaseResult,
          'vegetative',
          [],
          {}
        )
        setTreatment(treatmentPlan)
      }

      // Generate resistance profile
      const resistanceProfile = AIPestDiseaseSystem.analyzeResistanceRisk(
        activeTab === 'pest' ? 'Helicoverpa' : 'Stripe Rust',
        [
          {
            product: 'Product A',
            activeIngredient: 'Chlorantraniliprole',
            modeOfAction: '28',
            date: new Date(Date.now() - 30 * 86400000),
            efficacy: 85,
          },
          {
            product: 'Product B',
            activeIngredient: 'Chlorantraniliprole',
            modeOfAction: '28',
            date: new Date(Date.now() - 60 * 86400000),
            efficacy: 82,
          },
        ],
        {}
      )
      setResistance(resistanceProfile)

      setAnalyzing(false)
    }, 2000)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-500'
    if (confidence >= 60) return 'text-yellow-500'
    return 'text-orange-500'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
      case 'trace':
        return 'text-green-500'
      case 'moderate':
      case 'light':
        return 'text-yellow-500'
      case 'high':
      case 'severe':
        return 'text-orange-500'
      case 'critical':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate':
        return 'bg-red-900/20 border-red-500 text-red-400'
      case 'within_24h':
        return 'bg-orange-900/20 border-orange-500 text-orange-400'
      case 'within_week':
        return 'bg-yellow-900/20 border-yellow-500 text-yellow-400'
      default:
        return 'bg-green-900/20 border-green-500 text-green-400'
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Pest & Disease Detection</h1>
        <p className="text-[var(--muted-foreground)]">
          Advanced image analysis and treatment recommendations
        </p>
      </div>

      {/* Tab Selection */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('pest')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'pest'
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
              : 'bg-[var(--secondary)] hover:bg-[var(--accent)]'
          }`}
        >
          Pest Detection
        </button>
        <button
          onClick={() => setActiveTab('disease')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'disease'
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
              : 'bg-[var(--secondary)] hover:bg-[var(--accent)]'
          }`}
        >
          Disease Detection
        </button>
      </div>

      {/* Image Upload Section */}
      <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)] mb-8">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-32 h-32 bg-[var(--secondary)] rounded-lg flex items-center justify-center mb-4">
            <Camera className="w-16 h-16 text-[var(--muted-foreground)]" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Upload Field Image</h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-4 text-center max-w-md">
            Upload a clear image of the affected area for AI analysis.
            Best results with close-up shots showing damage patterns.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleImageAnalysis}
              disabled={analyzing}
              className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {analyzing ? (
                <>
                  <Brain className="w-4 h-4 animate-pulse" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Analyze Sample Image
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Identification Results */}
      {identification && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Primary Identification */}
          <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Microscope className="w-5 h-5" />
              Identification Results
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Primary {activeTab === 'pest' ? 'Pest' : 'Disease'}</p>
                <p className="text-lg font-semibold">
                  {activeTab === 'pest'
                    ? (identification as any).primaryPest.commonName
                    : (identification as any).primaryDisease.commonName}
                </p>
                <p className="text-sm text-[var(--muted-foreground)] italic">
                  {activeTab === 'pest'
                    ? (identification as any).primaryPest.scientificName
                    : (identification as any).primaryDisease.scientificName}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Confidence</p>
                  <p className={`text-lg font-semibold ${getConfidenceColor(identification.confidence)}`}>
                    {identification.confidence}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Severity</p>
                  <p className={`text-lg font-semibold ${getSeverityColor(identification.severity)}`}>
                    {identification.severity}
                  </p>
                </div>
              </div>

              {activeTab === 'pest' ? (
                <>
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">Infestation Stage</p>
                    <p className="font-medium">{(identification as any).infestationStage}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">Estimated Population</p>
                    <p className="font-medium">
                      {(identification as any).estimatedPopulation} per m²
                      {(identification as any).estimatedPopulation > (identification as any).economicThreshold && (
                        <span className="text-red-500 text-sm ml-2">
                          (Above economic threshold: {(identification as any).economicThreshold})
                        </span>
                      )}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">Infection Stage</p>
                    <p className="font-medium">{(identification as any).infectionStage}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">Infection Coverage</p>
                    <p className="font-medium">
                      {(identification as any).percentInfection}%
                      <span className={`text-sm ml-2 ${getSeverityColor((identification as any).spreadRisk)}`}>
                        ({(identification as any).spreadRisk} spread risk)
                      </span>
                    </p>
                  </div>
                </>
              )}

              {/* Secondary Identifications */}
              {(activeTab === 'pest' ? (identification as any).secondaryPests : (identification as any).secondaryDiseases).length > 0 && (
                <div>
                  <p className="text-sm text-[var(--muted-foreground)] mb-2">Also Possible:</p>
                  {(activeTab === 'pest' ? (identification as any).secondaryPests : (identification as any).secondaryDiseases).map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{item.name}</span>
                      <span className={getConfidenceColor(item.confidence)}>
                        {item.confidence.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Image Analysis Details */}
          <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
            <h3 className="text-lg font-semibold mb-4">Analysis Details</h3>

            {activeTab === 'pest' ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Damage Pattern</p>
                  <p className="font-medium">{(identification as any).imageAnalysis.damagePattern}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Affected Parts</p>
                  <p className="font-medium">
                    {(identification as any).imageAnalysis.affectedPlantParts.join(', ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Visual Indicators</p>
                  <ul className="text-sm space-y-1 mt-1">
                    {(identification as any).imageAnalysis.colorAnomalies.map((anomaly: string, i: number) => (
                      <li key={i}>• {anomaly}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Symptoms Detected</p>
                  <ul className="text-sm space-y-1 mt-1">
                    {(identification as any).primaryDisease.symptoms.map((symptom: string, i: number) => (
                      <li key={i}>• {symptom}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Environmental Factors</p>
                  <div className="mt-2">
                    <p className="text-sm text-green-500">Favourable:</p>
                    <ul className="text-sm space-y-1">
                      {(identification as any).environmentalFactors.favorable.map((factor: string, i: number) => (
                        <li key={i}>• {factor}</li>
                      ))}
                    </ul>
                  </div>
                  {(identification as any).environmentalFactors.unfavorable.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-red-500">Unfavourable:</p>
                      <ul className="text-sm space-y-1">
                        {(identification as any).environmentalFactors.unfavorable.map((factor: string, i: number) => (
                          <li key={i}>• {factor}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Treatment Recommendations */}
      {treatment && (
        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)] mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Treatment Recommendations
          </h2>

          <div className={`inline-block px-3 py-1 rounded-full text-sm mb-4 ${getUrgencyColor(treatment.urgency)}`}>
            Action Required: {treatment.urgency.replace(/_/g, ' ')}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chemical Options */}
            <div className="space-y-4">
              <h3 className="font-semibold">Treatment Options</h3>
              {treatment.treatments.map((option: any, i: number) => (
                <div key={i} className="p-4 bg-[var(--secondary)] rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium capitalize">{option.type} Control</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {option.products[0].name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Efficacy: {option.efficacy}%</p>
                      <p className="text-sm">Cost: ${option.cost}/ha</p>
                    </div>
                  </div>
                  <div className="text-sm space-y-1 mt-2">
                    <p>Rate: {option.products[0].rate} {option.products[0].unit}</p>
                    <p>Group: {option.products[0].resistanceGroup}</p>
                    <p>REI: {option.reentryInterval}h | PHI: {option.preHarvestInterval}d</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Integrated Approach */}
            <div className="space-y-4">
              <h3 className="font-semibold">Integrated Management</h3>

              <div>
                <p className="text-sm text-[var(--muted-foreground)] mb-1">Preventive Measures</p>
                <ul className="text-sm space-y-1">
                  {treatment.integratedApproach.preventive.slice(0, 3).map((measure: string, i: number) => (
                    <li key={i}>• {measure}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-sm text-[var(--muted-foreground)] mb-1">Monitoring Strategy</p>
                <ul className="text-sm space-y-1">
                  {treatment.integratedApproach.monitoring.slice(0, 3).map((strategy: string, i: number) => (
                    <li key={i}>• {strategy}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-blue-900/20 border border-blue-500 rounded-lg">
                <p className="text-sm font-medium mb-1">Economic Analysis</p>
                <div className="text-sm space-y-1">
                  <p>Treatment Cost: ${treatment.economicAnalysis.treatmentCost}/ha</p>
                  <p>Potential Loss: ${treatment.economicAnalysis.potentialLoss}/ha</p>
                  <p className="font-semibold text-green-500">
                    ROI: {(treatment.economicAnalysis.roi * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resistance Profile */}
      {resistance && (
        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Resistance Management Profile
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {resistance.resistanceGroups.map((group: any, i: number) => (
              <div key={i} className="p-4 bg-[var(--secondary)] rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium">Group {group.group}</p>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    group.level === 'none' ? 'bg-green-900/20 text-green-500' :
                    group.level === 'low' ? 'bg-yellow-900/20 text-yellow-500' :
                    group.level === 'moderate' ? 'bg-orange-900/20 text-orange-500' :
                    'bg-red-900/20 text-red-500'
                  }`}>
                    {group.level}
                  </span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mb-2">
                  {group.mechanism}
                </p>
                <p className="text-sm">
                  Products affected: {group.affectedProducts.length}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-yellow-900/20 border border-yellow-500 rounded-lg">
            <p className="font-medium mb-2">Management Strategies</p>
            <ul className="text-sm space-y-1">
              {resistance.managementStrategies.map((strategy: string, i: number) => (
                <li key={i}>• {strategy}</li>
              ))}
            </ul>
            {resistance.alternativeGroups.length > 0 && (
              <p className="text-sm mt-3">
                Alternative MOAs available: {resistance.alternativeGroups.join(', ')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}