'use client'

import { useState, useEffect } from 'react'
import {
  Briefcase, Plus, Play, Pause, CheckCircle, AlertTriangle,
  DollarSign, Leaf, BarChart3, Map, Clock, Shield, FileText,
  Users, Thermometer, Wind, Droplets
} from 'lucide-react'
import { DriftShield } from '@/lib/services/drift-shield'
import { LabelGuard } from '@/lib/services/label-guard'
import { FinancialCarbonSystem } from '@/lib/services/financial-carbon'
import { VariableRateApplication } from '@/lib/services/variable-rate-application'

interface Job {
  id: string
  blockName: string
  tankMix: string
  operator: string
  status: 'planned' | 'ready' | 'in_progress' | 'completed' | 'cancelled'
  plannedStart: Date
  areaHa: number
  conditions: {
    windKph: number
    windDirDeg: number
    tempC: number
    rhPct: number
  }
  driftRisk?: number
  ruleViolations?: any[]
  prescriptionMap?: boolean
  contractJob?: boolean
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: 'job-1',
      blockName: 'North Field',
      tankMix: 'Broadleaf Knockdown',
      operator: 'John Smith',
      status: 'in_progress',
      plannedStart: new Date(),
      areaHa: 45.5,
      conditions: { windKph: 12, windDirDeg: 180, tempC: 22, rhPct: 65 },
      prescriptionMap: true,
    },
    {
      id: 'job-2',
      blockName: 'East Paddock',
      tankMix: 'Pre-emergent Mix',
      operator: 'Sarah Johnson',
      status: 'ready',
      plannedStart: new Date(Date.now() + 3600000),
      areaHa: 32.8,
      conditions: { windKph: 8, windDirDeg: 270, tempC: 20, rhPct: 70 },
      contractJob: true,
    },
    {
      id: 'job-3',
      blockName: 'South Block',
      tankMix: 'Foliar Nutrition',
      operator: 'Mike Davis',
      status: 'planned',
      plannedStart: new Date(Date.now() + 7200000),
      areaHa: 28.2,
      conditions: { windKph: 15, windDirDeg: 90, tempC: 25, rhPct: 55 },
    },
  ])

  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeView, setActiveView] = useState<'list' | 'calendar' | 'map'>('list')

  useEffect(() => {
    // Calculate drift risk for each job
    const updatedJobs = jobs.map(job => {
      const driftConditions = {
        ...job.conditions,
        boomHeading: 90,
        boomWidthM: 24,
        boomHeightM: 0.8,
        nozzleType: 'Medium' as const,
        sprayPressureKpa: 300,
      }
      const risk = DriftShield.calculateDriftRisk(driftConditions)
      return { ...job, driftRisk: risk.riskScore }
    })
    setJobs(updatedJobs)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500'
      case 'in_progress': return 'text-blue-500'
      case 'ready': return 'text-yellow-500'
      case 'planned': return 'text-gray-500'
      case 'cancelled': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getRiskColor = (risk: number) => {
    if (risk < 30) return 'text-green-500'
    if (risk < 50) return 'text-yellow-500'
    if (risk < 70) return 'text-orange-500'
    return 'text-red-500'
  }

  const handleStartJob = (job: Job) => {
    // Simulate pre-flight checks
    const violations = []

    if (job.conditions.windKph > 20) {
      violations.push({
        code: 'WIND_SPEED',
        severity: 'block',
        message: 'Wind speed exceeds safe limits',
        remediation: 'Wait for calmer conditions',
      })
    }

    if (job.driftRisk! > 70) {
      violations.push({
        code: 'DRIFT_RISK',
        severity: 'warn',
        message: 'High drift risk detected',
        remediation: 'Consider drift-reducing nozzles',
      })
    }

    if (violations.length > 0) {
      alert('Pre-flight checks failed! See violations.')
      setSelectedJob({ ...job, ruleViolations: violations })
    } else {
      setJobs(jobs.map(j => j.id === job.id ? { ...j, status: 'in_progress' } : j))
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Spray Jobs</h1>
          <p className="text-[var(--muted-foreground)]">
            Comprehensive job management with advanced features
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Job
        </button>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveView('list')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeView === 'list'
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
              : 'bg-[var(--secondary)] hover:bg-[var(--accent)]'
          }`}
        >
          List View
        </button>
        <button
          onClick={() => setActiveView('calendar')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeView === 'calendar'
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
              : 'bg-[var(--secondary)] hover:bg-[var(--accent)]'
          }`}
        >
          Calendar
        </button>
        <button
          onClick={() => setActiveView('map')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeView === 'map'
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
              : 'bg-[var(--secondary)] hover:bg-[var(--accent)]'
          }`}
        >
          Map View
        </button>
      </div>

      {/* Jobs List */}
      {activeView === 'list' && (
        <div className="space-y-4">
          {jobs.map(job => (
            <div
              key={job.id}
              className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)] hover:border-[var(--primary)] transition-colors cursor-pointer"
              onClick={() => setSelectedJob(job)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{job.blockName}</h3>
                    <span className={`text-sm font-medium ${getStatusColor(job.status)}`}>
                      {job.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {job.prescriptionMap && (
                      <span className="text-xs px-2 py-1 bg-purple-900/20 text-purple-400 rounded-full">
                        VRA
                      </span>
                    )}
                    {job.contractJob && (
                      <span className="text-xs px-2 py-1 bg-blue-900/20 text-blue-400 rounded-full">
                        CONTRACT
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-[var(--muted-foreground)]">Tank Mix</p>
                      <p className="font-medium">{job.tankMix}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--muted-foreground)]">Operator</p>
                      <p className="font-medium">{job.operator}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--muted-foreground)]">Area</p>
                      <p className="font-medium">{job.areaHa} ha</p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--muted-foreground)]">Scheduled</p>
                      <p className="font-medium">
                        {job.plannedStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-blue-400" />
                      <span>{job.conditions.windKph} km/h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-orange-400" />
                      <span>{job.conditions.tempC}°C</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-cyan-400" />
                      <span>{job.conditions.rhPct}%</span>
                    </div>
                    {job.driftRisk !== undefined && (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 ${getRiskColor(job.driftRisk)}`} />
                        <span className={getRiskColor(job.driftRisk)}>
                          Drift Risk: {job.driftRisk}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {job.status === 'ready' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStartJob(job)
                      }}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Start
                    </button>
                  )}
                  {job.status === 'in_progress' && (
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Pause className="w-4 h-4" />
                      Pause
                    </button>
                  )}
                  <button
                    className="px-3 py-1 bg-[var(--secondary)] rounded-lg hover:bg-[var(--accent)] transition-colors"
                  >
                    Details
                  </button>
                </div>
              </div>

              {job.ruleViolations && job.ruleViolations.length > 0 && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-500 rounded-lg">
                  <p className="text-sm font-medium mb-2">Pre-flight Check Violations:</p>
                  {job.ruleViolations.map((violation: any, i: number) => (
                    <div key={i} className="text-sm">
                      <span className={violation.severity === 'block' ? 'text-red-400' : 'text-yellow-400'}>
                        • {violation.message}
                      </span>
                      {violation.remediation && (
                        <span className="text-[var(--muted-foreground)] ml-2">
                          ({violation.remediation})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Job Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="w-5 h-5 text-blue-500" />
            <span className="text-lg font-semibold">Today's Jobs</span>
          </div>
          <p className="text-2xl font-bold">{jobs.length}</p>
          <p className="text-sm text-[var(--muted-foreground)]">
            {jobs.filter(j => j.status === 'in_progress').length} in progress
          </p>
        </div>

        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
          <div className="flex items-center gap-3 mb-2">
            <Map className="w-5 h-5 text-green-500" />
            <span className="text-lg font-semibold">Total Area</span>
          </div>
          <p className="text-2xl font-bold">
            {jobs.reduce((sum, j) => sum + j.areaHa, 0).toFixed(1)} ha
          </p>
          <p className="text-sm text-[var(--muted-foreground)]">
            Avg: {(jobs.reduce((sum, j) => sum + j.areaHa, 0) / jobs.length).toFixed(1)} ha
          </p>
        </div>

        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-yellow-500" />
            <span className="text-lg font-semibold">Est. Cost</span>
          </div>
          <p className="text-2xl font-bold">
            ${(jobs.reduce((sum, j) => sum + j.areaHa * 45, 0)).toFixed(0)}
          </p>
          <p className="text-sm text-[var(--muted-foreground)]">
            $45 avg per ha
          </p>
        </div>

        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
          <div className="flex items-center gap-3 mb-2">
            <Leaf className="w-5 h-5 text-green-500" />
            <span className="text-lg font-semibold">Carbon Impact</span>
          </div>
          <p className="text-2xl font-bold">
            {(jobs.reduce((sum, j) => sum + j.areaHa * 2.5, 0)).toFixed(0)} kg
          </p>
          <p className="text-sm text-[var(--muted-foreground)]">
            CO₂e emissions
          </p>
        </div>
      </div>

      {/* Advanced Features Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Compliance Status
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Buffer Zones</span>
              <span className="text-sm text-green-500">✓ Compliant</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Operator License</span>
              <span className="text-sm text-green-500">✓ Valid</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Record Keeping</span>
              <span className="text-sm text-green-500">✓ Complete</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Notification</span>
              <span className="text-sm text-yellow-500">⚠ 2 pending</span>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance Metrics
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Efficiency</span>
              <span className="text-sm">92%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Chemical Saved</span>
              <span className="text-sm">12.5 L</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Coverage Rate</span>
              <span className="text-sm">18.5 ha/hr</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Downtime</span>
              <span className="text-sm">0.5 hrs</span>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Status
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">John Smith</span>
              <span className="text-sm text-blue-500">Spraying</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Sarah Johnson</span>
              <span className="text-sm text-yellow-500">Preparing</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Mike Davis</span>
              <span className="text-sm text-gray-500">Standby</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Equipment</span>
              <span className="text-sm text-green-500">3 available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}