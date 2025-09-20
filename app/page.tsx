'use client'

import { useEffect, useState } from 'react'
import {
  Droplets,
  Package,
  AlertTriangle,
  CheckCircle,
  Wind,
  Thermometer,
  Cloud,
  Activity,
} from 'lucide-react'
import { DriftShield, type DriftConditions } from '@/lib/services/drift-shield'

interface DashboardStats {
  todaysJobs: number
  activeJobs: number
  lowStockItems: number
  safeWindowsNext3Hours: number
  currentConditions: {
    windKph: number
    windDirDeg: number
    tempC: number
    rhPct: number
  }
}

export default function DashboardPage() {
  const [stats] = useState<DashboardStats>({
    todaysJobs: 2,
    activeJobs: 1,
    lowStockItems: 3,
    safeWindowsNext3Hours: 2,
    currentConditions: {
      windKph: 12,
      windDirDeg: 180,
      tempC: 22,
      rhPct: 65,
    },
  })

  const [driftRisk, setDriftRisk] = useState(0)

  useEffect(() => {
    const conditions: DriftConditions = {
      ...stats.currentConditions,
      boomHeading: 90,
      boomWidthM: 24,
      boomHeightM: 0.8,
      nozzleType: 'Medium',
      sprayPressureKpa: 300,
    }

    const risk = DriftShield.calculateDriftRisk(conditions)
    setDriftRisk(risk.riskScore)
  }, [stats.currentConditions])

  const getRiskColour = (score: number) => {
    if (score < 30) return 'text-green-500'
    if (score < 50) return 'text-yellow-500'
    if (score < 70) return 'text-orange-500'
    return 'text-red-500'
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-[var(--muted-foreground)]">
          SprayMate Operations Centre
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <Droplets className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold">{stats.todaysJobs}</span>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">Today&apos;s Jobs</p>
          <p className="text-xs text-green-500 mt-1">
            {stats.activeJobs} active
          </p>
        </div>

        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <Package className="w-8 h-8 text-purple-500" />
            <span className="text-2xl font-bold">{stats.lowStockItems}</span>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">Low Stock Items</p>
          <p className="text-xs text-[var(--warning)] mt-1">
            Reorder required
          </p>
        </div>

        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <Activity className={`w-8 h-8 ${getRiskColour(driftRisk)}`} />
            <span className={`text-2xl font-bold ${getRiskColour(driftRisk)}`}>
              {driftRisk}%
            </span>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">Drift Risk</p>
          <p className="text-xs mt-1">
            {driftRisk < 30 ? 'Safe' : driftRisk < 50 ? 'Caution' : driftRisk < 70 ? 'High' : 'Critical'}
          </p>
        </div>

        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <span className="text-2xl font-bold">{stats.safeWindowsNext3Hours}</span>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">Safe Windows</p>
          <p className="text-xs text-green-500 mt-1">Next 3 hours</p>
        </div>
      </div>

      {/* Weather Conditions */}
      <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)] mb-8">
        <h2 className="text-xl font-semibold mb-4">Current Conditions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <Wind className="w-6 h-6 text-blue-400" />
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Wind</p>
              <p className="font-semibold">
                {stats.currentConditions.windKph} km/h{' '}
                {DriftShield.getWindDirectionName(stats.currentConditions.windDirDeg)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Thermometer className="w-6 h-6 text-orange-400" />
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Temperature</p>
              <p className="font-semibold">{stats.currentConditions.tempC}°C</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Cloud className="w-6 h-6 text-gray-400" />
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Humidity</p>
              <p className="font-semibold">{stats.currentConditions.rhPct}%</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Alerts</p>
              <p className="font-semibold">None</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">Job Started - Block 3</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Broadleaf Knockdown • 10 minutes ago
                </p>
              </div>
            </div>
            <span className="text-sm text-green-500">Active</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="font-medium">Stock Take Completed</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  7 products reconciled • 2 hours ago
                </p>
              </div>
            </div>
            <span className="text-sm">Completed</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="font-medium">Low Stock Alert</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  GlyphoMax 540 below minimum • 3 hours ago
                </p>
              </div>
            </div>
            <span className="text-sm text-[var(--warning)]">Warning</span>
          </div>
        </div>
      </div>
    </div>
  )
}