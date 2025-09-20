'use client'

import { useState } from 'react'
import { FileText, Download, Calendar, TrendingUp, DollarSign, Shield, Droplets, Bug, BarChart3, PieChart, Activity, MapPin, Users, Package, AlertTriangle, Clock, Target, Zap } from 'lucide-react'

interface ReportType {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: string
  lastGenerated?: Date
  frequency?: string
}

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string>('spray-summary')
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y' | 'custom'>('30d')
  const [generating, setGenerating] = useState(false)

  const reportTypes: ReportType[] = [
    // Operational Reports
    {
      id: 'spray-summary',
      name: 'Spray Application Summary',
      description: 'Detailed breakdown of all spray jobs by block, product, and operator',
      icon: <Droplets className="w-5 h-5" />,
      category: 'Operational',
      lastGenerated: new Date('2024-09-15'),
      frequency: 'Weekly'
    },
    {
      id: 'chemical-usage',
      name: 'Chemical Usage Report',
      description: 'Product consumption, active ingredient totals, and cost analysis',
      icon: <Package className="w-5 h-5" />,
      category: 'Operational',
      lastGenerated: new Date('2024-09-14'),
      frequency: 'Monthly'
    },
    {
      id: 'operator-performance',
      name: 'Operator Performance',
      description: 'Efficiency metrics, hours worked, and area covered by operator',
      icon: <Users className="w-5 h-5" />,
      category: 'Operational',
      lastGenerated: new Date('2024-09-10'),
      frequency: 'Monthly'
    },

    // Compliance Reports
    {
      id: 'regulatory-compliance',
      name: 'Regulatory Compliance',
      description: 'MRL adherence, withholding periods, and buffer zone compliance',
      icon: <Shield className="w-5 h-5" />,
      category: 'Compliance',
      lastGenerated: new Date('2024-09-15'),
      frequency: 'Quarterly'
    },
    {
      id: 'audit-trail',
      name: 'Audit Trail Report',
      description: 'Complete record of all applications for regulatory inspection',
      icon: <FileText className="w-5 h-5" />,
      category: 'Compliance',
      lastGenerated: new Date('2024-09-01'),
      frequency: 'On-demand'
    },
    {
      id: 'export-certification',
      name: 'Export Certification',
      description: 'Chemical residue tracking for export market compliance',
      icon: <Target className="w-5 h-5" />,
      category: 'Compliance',
      lastGenerated: new Date('2024-08-30'),
      frequency: 'Per shipment'
    },

    // Financial Reports
    {
      id: 'cost-analysis',
      name: 'Cost Analysis',
      description: 'Detailed breakdown of chemical, labor, and equipment costs',
      icon: <DollarSign className="w-5 h-5" />,
      category: 'Financial',
      lastGenerated: new Date('2024-09-14'),
      frequency: 'Monthly'
    },
    {
      id: 'roi-analysis',
      name: 'ROI Analysis',
      description: 'Return on investment for treatments and yield impact',
      icon: <TrendingUp className="w-5 h-5" />,
      category: 'Financial',
      lastGenerated: new Date('2024-09-01'),
      frequency: 'Seasonal'
    },
    {
      id: 'carbon-footprint',
      name: 'Carbon Footprint',
      description: 'Emissions tracking and sustainability metrics',
      icon: <Zap className="w-5 h-5" />,
      category: 'Financial',
      lastGenerated: new Date('2024-08-31'),
      frequency: 'Annual'
    },

    // Technical Reports
    {
      id: 'pest-disease-trends',
      name: 'Pest & Disease Trends',
      description: 'Incidence rates, treatment efficacy, and resistance patterns',
      icon: <Bug className="w-5 h-5" />,
      category: 'Technical',
      lastGenerated: new Date('2024-09-12'),
      frequency: 'Monthly'
    },
    {
      id: 'weather-analysis',
      name: 'Weather Impact Analysis',
      description: 'Spray window utilization and weather-related delays',
      icon: <Activity className="w-5 h-5" />,
      category: 'Technical',
      lastGenerated: new Date('2024-09-15'),
      frequency: 'Weekly'
    },
    {
      id: 'equipment-utilization',
      name: 'Equipment Utilization',
      description: 'Sprayer usage, maintenance schedule, and efficiency metrics',
      icon: <BarChart3 className="w-5 h-5" />,
      category: 'Technical',
      lastGenerated: new Date('2024-09-08'),
      frequency: 'Monthly'
    }
  ]

  const generateReport = () => {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      alert(`Generated ${reportTypes.find(r => r.id === selectedReport)?.name} for ${dateRange}`)
    }, 2000)
  }

  const renderReportPreview = () => {
    switch (selectedReport) {
      case 'spray-summary':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[var(--secondary)] rounded-lg p-4">
                <p className="text-sm text-[var(--muted-foreground)] mb-1">Total Jobs</p>
                <p className="text-2xl font-bold">47</p>
                <p className="text-xs text-green-500 mt-1">+12% vs last period</p>
              </div>
              <div className="bg-[var(--secondary)] rounded-lg p-4">
                <p className="text-sm text-[var(--muted-foreground)] mb-1">Area Treated</p>
                <p className="text-2xl font-bold">1,250 ha</p>
                <p className="text-xs text-green-500 mt-1">+8% vs last period</p>
              </div>
              <div className="bg-[var(--secondary)] rounded-lg p-4">
                <p className="text-sm text-[var(--muted-foreground)] mb-1">Chemical Used</p>
                <p className="text-2xl font-bold">3,450 L</p>
                <p className="text-xs text-red-500 mt-1">+15% vs last period</p>
              </div>
              <div className="bg-[var(--secondary)] rounded-lg p-4">
                <p className="text-sm text-[var(--muted-foreground)] mb-1">Avg Efficiency</p>
                <p className="text-2xl font-bold">92%</p>
                <p className="text-xs text-green-500 mt-1">+3% vs last period</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Recent Applications</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">Block</th>
                      <th className="text-left py-2">Products</th>
                      <th className="text-left py-2">Area</th>
                      <th className="text-left py-2">Operator</th>
                      <th className="text-left py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[var(--border)]">
                      <td className="py-2">Sep 15</td>
                      <td className="py-2">North Field</td>
                      <td className="py-2">Roundup PowerMAX</td>
                      <td className="py-2">45 ha</td>
                      <td className="py-2">J. Smith</td>
                      <td className="py-2"><span className="text-green-500">Complete</span></td>
                    </tr>
                    <tr className="border-b border-[var(--border)]">
                      <td className="py-2">Sep 14</td>
                      <td className="py-2">East Block</td>
                      <td className="py-2">Prosaro + Velocity</td>
                      <td className="py-2">32 ha</td>
                      <td className="py-2">S. Johnson</td>
                      <td className="py-2"><span className="text-green-500">Complete</span></td>
                    </tr>
                    <tr className="border-b border-[var(--border)]">
                      <td className="py-2">Sep 13</td>
                      <td className="py-2">River Block</td>
                      <td className="py-2">Select + Uptake</td>
                      <td className="py-2">28 ha</td>
                      <td className="py-2">M. Brown</td>
                      <td className="py-2"><span className="text-green-500">Complete</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Product Distribution</h3>
                <div className="bg-[var(--secondary)] rounded-lg p-8 flex items-center justify-center">
                  <PieChart className="w-32 h-32 text-[var(--muted-foreground)]" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Weekly Trend</h3>
                <div className="bg-[var(--secondary)] rounded-lg p-8 flex items-center justify-center">
                  <BarChart3 className="w-32 h-32 text-[var(--muted-foreground)]" />
                </div>
              </div>
            </div>
          </div>
        )

      case 'regulatory-compliance':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-green-900/20 border border-green-500 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="font-semibold">Compliance Status: COMPLIANT</span>
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">
                All applications within the reporting period meet regulatory requirements
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Withholding Period Compliance</h3>
              <div className="space-y-3">
                <div className="p-3 bg-[var(--secondary)] rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Wheat - North Field</p>
                      <p className="text-sm text-[var(--muted-foreground)]">Last spray: Sep 10</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Safe harvest date</p>
                      <p className="font-medium text-green-500">Oct 15</p>
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>

                <div className="p-3 bg-[var(--secondary)] rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Barley - East Block</p>
                      <p className="text-sm text-[var(--muted-foreground)]">Last spray: Sep 5</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Safe harvest date</p>
                      <p className="font-medium text-green-500">Oct 5</p>
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Export MRL Compliance</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left py-2">Market</th>
                      <th className="text-left py-2">Product</th>
                      <th className="text-left py-2">MRL</th>
                      <th className="text-left py-2">Projected</th>
                      <th className="text-left py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[var(--border)]">
                      <td className="py-2">EU</td>
                      <td className="py-2">Glyphosate</td>
                      <td className="py-2">0.1 ppm</td>
                      <td className="py-2">0.05 ppm</td>
                      <td className="py-2"><span className="text-green-500">✓</span></td>
                    </tr>
                    <tr className="border-b border-[var(--border)]">
                      <td className="py-2">Japan</td>
                      <td className="py-2">Tebuconazole</td>
                      <td className="py-2">2.0 ppm</td>
                      <td className="py-2">0.8 ppm</td>
                      <td className="py-2"><span className="text-green-500">✓</span></td>
                    </tr>
                    <tr className="border-b border-[var(--border)]">
                      <td className="py-2">USA</td>
                      <td className="py-2">Prothioconazole</td>
                      <td className="py-2">0.3 ppm</td>
                      <td className="py-2">0.15 ppm</td>
                      <td className="py-2"><span className="text-green-500">✓</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Buffer Zone Compliance</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[var(--secondary)] rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-500">100%</p>
                  <p className="text-sm text-[var(--muted-foreground)]">Waterway buffers</p>
                </div>
                <div className="bg-[var(--secondary)] rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-500">100%</p>
                  <p className="text-sm text-[var(--muted-foreground)]">Sensitive areas</p>
                </div>
                <div className="bg-[var(--secondary)] rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-500">95%</p>
                  <p className="text-sm text-[var(--muted-foreground)]">Residential zones</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'cost-analysis':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[var(--secondary)] rounded-lg p-4">
                <p className="text-sm text-[var(--muted-foreground)] mb-1">Total Cost</p>
                <p className="text-2xl font-bold">$45,280</p>
                <p className="text-xs text-red-500 mt-1">+8% vs budget</p>
              </div>
              <div className="bg-[var(--secondary)] rounded-lg p-4">
                <p className="text-sm text-[var(--muted-foreground)] mb-1">Cost per Ha</p>
                <p className="text-2xl font-bold">$36.22</p>
                <p className="text-xs text-green-500 mt-1">-5% vs last year</p>
              </div>
              <div className="bg-[var(--secondary)] rounded-lg p-4">
                <p className="text-sm text-[var(--muted-foreground)] mb-1">ROI</p>
                <p className="text-2xl font-bold">312%</p>
                <p className="text-xs text-green-500 mt-1">Above target</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Cost Breakdown</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[var(--secondary)] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-blue-500 rounded" />
                    <div>
                      <p className="font-medium">Chemical Products</p>
                      <p className="text-sm text-[var(--muted-foreground)]">Herbicides, fungicides, adjuvants</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">$28,450</p>
                    <p className="text-sm text-[var(--muted-foreground)]">62.8%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-[var(--secondary)] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-green-500 rounded" />
                    <div>
                      <p className="font-medium">Labor</p>
                      <p className="text-sm text-[var(--muted-foreground)]">Operator wages and training</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">$8,920</p>
                    <p className="text-sm text-[var(--muted-foreground)]">19.7%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-[var(--secondary)] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-purple-500 rounded" />
                    <div>
                      <p className="font-medium">Equipment</p>
                      <p className="text-sm text-[var(--muted-foreground)]">Fuel, maintenance, depreciation</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">$5,210</p>
                    <p className="text-sm text-[var(--muted-foreground)]">11.5%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-[var(--secondary)] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-orange-500 rounded" />
                    <div>
                      <p className="font-medium">Other</p>
                      <p className="text-sm text-[var(--muted-foreground)]">Compliance, testing, consultants</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">$2,700</p>
                    <p className="text-sm text-[var(--muted-foreground)]">6.0%</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Monthly Trend</h3>
              <div className="bg-[var(--secondary)] rounded-lg p-8 flex items-center justify-center">
                <TrendingUp className="w-32 h-32 text-[var(--muted-foreground)]" />
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-[var(--muted-foreground)]" />
              <p className="text-xl font-semibold mb-2">Select report parameters</p>
              <p className="text-[var(--muted-foreground)]">
                Choose date range and click Generate to create report
              </p>
            </div>
          </div>
        )
    }
  }

  const categories = [...new Set(reportTypes.map(r => r.category))]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
        <p className="text-[var(--muted-foreground)]">
          Generate comprehensive reports for operations, compliance, and analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Report Selection */}
        <div className="lg:col-span-1">
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)]">
            <div className="p-4">
              <h2 className="font-semibold mb-4">Available Reports</h2>

              {categories.map(category => (
                <div key={category} className="mb-4">
                  <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-2">{category}</h3>
                  <div className="space-y-1">
                    {reportTypes
                      .filter(r => r.category === category)
                      .map(report => (
                        <button
                          key={report.id}
                          onClick={() => setSelectedReport(report.id)}
                          className={`w-full flex items-start gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                            selectedReport === report.id
                              ? 'bg-blue-500 text-white'
                              : 'hover:bg-[var(--secondary)]'
                          }`}
                        >
                          {report.icon}
                          <div className="flex-1">
                            <p className="font-medium text-sm">{report.name}</p>
                            {selectedReport === report.id && (
                              <p className="text-xs opacity-90 mt-1">{report.description}</p>
                            )}
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Report Configuration and Preview */}
        <div className="lg:col-span-3 space-y-6">
          {/* Configuration */}
          <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-semibold">
                  {reportTypes.find(r => r.id === selectedReport)?.name}
                </h2>
                <p className="text-[var(--muted-foreground)] mt-1">
                  {reportTypes.find(r => r.id === selectedReport)?.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {reportTypes.find(r => r.id === selectedReport)?.lastGenerated && (
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Last: {reportTypes.find(r => r.id === selectedReport)?.lastGenerated?.toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* Date Range Selector */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[var(--muted-foreground)]" />
                <span className="text-sm font-medium">Period:</span>
              </div>
              <div className="flex gap-2">
                {(['7d', '30d', '90d', '1y', 'custom'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      dateRange === range
                        ? 'bg-blue-500 text-white'
                        : 'bg-[var(--secondary)] hover:bg-[var(--muted)]'
                    }`}
                  >
                    {range === '7d' ? 'Week' :
                     range === '30d' ? 'Month' :
                     range === '90d' ? 'Quarter' :
                     range === '1y' ? 'Year' :
                     'Custom'}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Actions */}
            <div className="flex gap-3">
              <button
                onClick={generateReport}
                disabled={generating}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Generate Report
                  </>
                )}
              </button>
              <button className="px-4 py-2 bg-[var(--secondary)] rounded-lg hover:bg-[var(--muted)] transition-colors flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Schedule
              </button>
              <button className="px-4 py-2 bg-[var(--secondary)] rounded-lg hover:bg-[var(--muted)] transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Report Preview */}
          <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
            <h3 className="text-xl font-semibold mb-4">Report Preview</h3>
            {renderReportPreview()}
          </div>
        </div>
      </div>
    </div>
  )
}