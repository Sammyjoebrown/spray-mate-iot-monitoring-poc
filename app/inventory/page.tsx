'use client'

import { useState, useEffect } from 'react'
import { Package, AlertTriangle, TrendingDown, TrendingUp, Calendar, BarChart3, Shield, Truck, History, DollarSign } from 'lucide-react'

interface InventoryItem {
  id: string
  productName: string
  productCode: string
  manufacturer: string
  activeIngredient: string
  concentration: number
  currentStock: number
  unit: string
  minStock: number
  maxStock: number
  optimalStock: number
  batches: {
    batchNumber: string
    quantity: number
    expiryDate: Date
    purchaseDate: Date
    cost: number
    supplier: string
  }[]
  usageRate: number // units per week
  leadTimeDays: number
  lastOrderDate: Date | null
  nextOrderDate: Date | null
  status: 'adequate' | 'low' | 'critical' | 'overstocked' | 'expiring'
  compliance: {
    registrationNumber: string
    expiryDate: Date
    restrictedUse: boolean
    maxAnnualUsage: number
    currentAnnualUsage: number
  }
}

interface UsageHistory {
  date: Date
  quantity: number
  job: string
  block: string
  operator: string
}

interface PredictedUsage {
  period: string
  quantity: number
  confidence: number
  factors: string[]
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [filter, setFilter] = useState<'all' | 'low' | 'expiring' | 'overstocked'>('all')
  const [usageHistory, setUsageHistory] = useState<UsageHistory[]>([])
  const [predictions, setPredictions] = useState<PredictedUsage[]>([])

  useEffect(() => {
    // Generate mock inventory data
    const mockInventory: InventoryItem[] = [
      {
        id: '1',
        productName: 'Roundup PowerMAX',
        productCode: 'RND-PM-5L',
        manufacturer: 'Bayer CropScience',
        activeIngredient: 'Glyphosate',
        concentration: 540,
        currentStock: 45,
        unit: 'L',
        minStock: 20,
        maxStock: 100,
        optimalStock: 60,
        batches: [
          {
            batchNumber: 'B2024-001',
            quantity: 25,
            expiryDate: new Date('2025-06-15'),
            purchaseDate: new Date('2024-01-15'),
            cost: 450,
            supplier: 'AgriSupply Co'
          },
          {
            batchNumber: 'B2024-002',
            quantity: 20,
            expiryDate: new Date('2025-08-20'),
            purchaseDate: new Date('2024-03-10'),
            cost: 380,
            supplier: 'FarmChem Direct'
          }
        ],
        usageRate: 15,
        leadTimeDays: 7,
        lastOrderDate: new Date('2024-03-10'),
        nextOrderDate: new Date('2025-10-01'),
        status: 'adequate',
        compliance: {
          registrationNumber: 'APVMA-65896',
          expiryDate: new Date('2026-12-31'),
          restrictedUse: false,
          maxAnnualUsage: 2000,
          currentAnnualUsage: 850
        }
      },
      {
        id: '2',
        productName: 'Prosaro 420 SC',
        productCode: 'PRO-420-1L',
        manufacturer: 'Bayer CropScience',
        activeIngredient: 'Prothioconazole + Tebuconazole',
        concentration: 420,
        currentStock: 8,
        unit: 'L',
        minStock: 10,
        maxStock: 50,
        optimalStock: 25,
        batches: [
          {
            batchNumber: 'B2024-003',
            quantity: 8,
            expiryDate: new Date('2025-03-10'),
            purchaseDate: new Date('2024-02-10'),
            cost: 320,
            supplier: 'CropProtection Plus'
          }
        ],
        usageRate: 5,
        leadTimeDays: 14,
        lastOrderDate: new Date('2024-02-10'),
        nextOrderDate: new Date('2025-09-15'),
        status: 'low',
        compliance: {
          registrationNumber: 'APVMA-53764',
          expiryDate: new Date('2025-06-30'),
          restrictedUse: true,
          maxAnnualUsage: 100,
          currentAnnualUsage: 42
        }
      },
      {
        id: '3',
        productName: 'Velocity',
        productCode: 'VEL-10-5L',
        manufacturer: 'Syngenta',
        activeIngredient: 'Cloquintocet-mexyl',
        concentration: 100,
        currentStock: 95,
        unit: 'L',
        minStock: 30,
        maxStock: 80,
        optimalStock: 55,
        batches: [
          {
            batchNumber: 'B2024-004',
            quantity: 50,
            expiryDate: new Date('2025-02-28'),
            purchaseDate: new Date('2023-12-01'),
            cost: 850,
            supplier: 'AgriSupply Co'
          },
          {
            batchNumber: 'B2024-005',
            quantity: 45,
            expiryDate: new Date('2025-04-15'),
            purchaseDate: new Date('2024-01-20'),
            cost: 810,
            supplier: 'FarmChem Direct'
          }
        ],
        usageRate: 8,
        leadTimeDays: 10,
        lastOrderDate: new Date('2024-01-20'),
        nextOrderDate: null,
        status: 'overstocked',
        compliance: {
          registrationNumber: 'APVMA-68421',
          expiryDate: new Date('2027-03-31'),
          restrictedUse: false,
          maxAnnualUsage: 500,
          currentAnnualUsage: 120
        }
      },
      {
        id: '4',
        productName: 'Uptake Spraying Oil',
        productCode: 'UPT-OIL-20L',
        manufacturer: 'Victorian Chemicals',
        activeIngredient: 'Paraffinic Oil',
        concentration: 824,
        currentStock: 35,
        unit: 'L',
        minStock: 20,
        maxStock: 60,
        optimalStock: 40,
        batches: [
          {
            batchNumber: 'B2024-006',
            quantity: 20,
            expiryDate: new Date('2025-02-01'),
            purchaseDate: new Date('2023-11-15'),
            cost: 180,
            supplier: 'Local Farm Supplies'
          },
          {
            batchNumber: 'B2024-007',
            quantity: 15,
            expiryDate: new Date('2026-01-15'),
            purchaseDate: new Date('2024-02-20'),
            cost: 150,
            supplier: 'AgriSupply Co'
          }
        ],
        usageRate: 12,
        leadTimeDays: 5,
        lastOrderDate: new Date('2024-02-20'),
        nextOrderDate: new Date('2025-10-10'),
        status: 'expiring',
        compliance: {
          registrationNumber: 'APVMA-70123',
          expiryDate: new Date('2028-12-31'),
          restrictedUse: false,
          maxAnnualUsage: 1000,
          currentAnnualUsage: 280
        }
      }
    ]

    setInventory(mockInventory)

    // Generate mock usage history
    const mockHistory: UsageHistory[] = [
      {
        date: new Date('2024-09-15'),
        quantity: 25,
        job: 'Pre-emergent herbicide',
        block: 'North Field',
        operator: 'John Smith'
      },
      {
        date: new Date('2024-09-10'),
        quantity: 15,
        job: 'Fungicide application',
        block: 'East Block',
        operator: 'Sarah Johnson'
      },
      {
        date: new Date('2024-09-08'),
        quantity: 8,
        job: 'Spot spray weeds',
        block: 'South Paddock',
        operator: 'Mike Brown'
      }
    ]
    setUsageHistory(mockHistory)

    // Generate predictions
    const mockPredictions: PredictedUsage[] = [
      {
        period: 'Next Week',
        quantity: 35,
        confidence: 85,
        factors: ['Seasonal pattern', 'Weather forecast', 'Crop stage']
      },
      {
        period: 'Next Month',
        quantity: 120,
        confidence: 70,
        factors: ['Historical usage', 'Planned applications', 'Disease pressure']
      },
      {
        period: 'Next Quarter',
        quantity: 380,
        confidence: 60,
        factors: ['Annual cycle', 'Crop rotation', 'Market conditions']
      }
    ]
    setPredictions(mockPredictions)
  }, [])

  const filteredInventory = inventory.filter(item => {
    if (filter === 'all') return true
    if (filter === 'low') return item.status === 'low' || item.status === 'critical'
    if (filter === 'expiring') return item.status === 'expiring'
    if (filter === 'overstocked') return item.status === 'overstocked'
    return true
  })

  const getStatusColor = (status: InventoryItem['status']) => {
    switch (status) {
      case 'adequate': return 'text-green-500'
      case 'low': return 'text-yellow-500'
      case 'critical': return 'text-red-500'
      case 'overstocked': return 'text-blue-500'
      case 'expiring': return 'text-orange-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: InventoryItem['status']) => {
    switch (status) {
      case 'adequate': return <Package className="w-5 h-5" />
      case 'low': return <TrendingDown className="w-5 h-5" />
      case 'critical': return <AlertTriangle className="w-5 h-5" />
      case 'overstocked': return <TrendingUp className="w-5 h-5" />
      case 'expiring': return <Calendar className="w-5 h-5" />
      default: return <Package className="w-5 h-5" />
    }
  }

  const calculateStockPercentage = (current: number, optimal: number) => {
    return Math.min(100, (current / optimal) * 100)
  }

  const getExpiryWarning = (date: Date) => {
    const daysUntilExpiry = Math.floor((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (daysUntilExpiry < 30) return 'text-red-500'
    if (daysUntilExpiry < 90) return 'text-orange-500'
    if (daysUntilExpiry < 180) return 'text-yellow-500'
    return 'text-green-500'
  }

  const calculateReorderPoint = (item: InventoryItem) => {
    const dailyUsage = item.usageRate / 7
    const leadTimeUsage = dailyUsage * item.leadTimeDays
    const safetyStock = item.minStock
    return leadTimeUsage + safetyStock
  }

  const calculateEOQ = (item: InventoryItem) => {
    // Economic Order Quantity formula
    const annualDemand = item.usageRate * 52
    const orderingCost = 50 // Fixed ordering cost
    const holdingCostRate = 0.15 // 15% of inventory value per year
    const unitCost = item.batches[0]?.cost / item.batches[0]?.quantity || 10
    const holdingCost = unitCost * holdingCostRate

    return Math.sqrt((2 * annualDemand * orderingCost) / holdingCost)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Chemical Inventory Management</h1>
        <p className="text-[var(--muted-foreground)]">
          Real-time stock tracking, expiry monitoring, and intelligent reordering
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
          <div className="flex items-center gap-3 mb-3">
            <Package className="w-6 h-6 text-blue-500" />
            <span className="text-lg font-semibold">Total Products</span>
          </div>
          <p className="text-3xl font-bold">{inventory.length}</p>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">
            Active SKUs in inventory
          </p>
        </div>

        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
          <div className="flex items-center gap-3 mb-3">
            <TrendingDown className="w-6 h-6 text-yellow-500" />
            <span className="text-lg font-semibold">Low Stock</span>
          </div>
          <p className="text-3xl font-bold">
            {inventory.filter(i => i.status === 'low' || i.status === 'critical').length}
          </p>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">
            Products below minimum
          </p>
        </div>

        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-6 h-6 text-orange-500" />
            <span className="text-lg font-semibold">Expiring Soon</span>
          </div>
          <p className="text-3xl font-bold">
            {inventory.filter(i => i.status === 'expiring').length}
          </p>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">
            Within 60 days
          </p>
        </div>

        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-6 h-6 text-green-500" />
            <span className="text-lg font-semibold">Total Value</span>
          </div>
          <p className="text-3xl font-bold">
            ${inventory.reduce((sum, item) =>
              sum + item.batches.reduce((batchSum, batch) => batchSum + batch.cost, 0), 0
            ).toLocaleString()}
          </p>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">
            Current inventory value
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'low', 'expiring', 'overstocked'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === f
                ? 'bg-blue-500 text-white'
                : 'bg-[var(--secondary)] hover:bg-[var(--muted)]'
            }`}
          >
            {f === 'all' ? 'All Products' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Inventory Status</h2>
          {filteredInventory.map(item => (
            <div
              key={item.id}
              className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)] cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => setSelectedItem(item)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{item.productName}</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {item.activeIngredient} ({item.concentration}g/L)
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    {item.manufacturer} • {item.productCode}
                  </p>
                </div>
                <div className={`flex items-center gap-2 ${getStatusColor(item.status)}`}>
                  {getStatusIcon(item.status)}
                  <span className="text-sm font-medium capitalize">{item.status}</span>
                </div>
              </div>

              {/* Stock Level Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>{item.currentStock} {item.unit}</span>
                  <span className="text-[var(--muted-foreground)]">
                    Optimal: {item.optimalStock} {item.unit}
                  </span>
                </div>
                <div className="relative h-4 bg-[var(--secondary)] rounded-full overflow-hidden">
                  <div
                    className={`absolute h-full transition-all ${
                      item.status === 'critical' ? 'bg-red-500' :
                      item.status === 'low' ? 'bg-yellow-500' :
                      item.status === 'overstocked' ? 'bg-blue-500' :
                      item.status === 'expiring' ? 'bg-orange-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${calculateStockPercentage(item.currentStock, item.maxStock)}%` }}
                  />
                  {/* Min/Max indicators */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-600"
                    style={{ left: `${(item.minStock / item.maxStock) * 100}%` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-green-600"
                    style={{ left: `${(item.optimalStock / item.maxStock) * 100}%` }}
                  />
                </div>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[var(--muted-foreground)]">Usage Rate</p>
                  <p className="font-medium">{item.usageRate} {item.unit}/week</p>
                </div>
                <div>
                  <p className="text-[var(--muted-foreground)]">Reorder Point</p>
                  <p className="font-medium">{calculateReorderPoint(item).toFixed(0)} {item.unit}</p>
                </div>
                <div>
                  <p className="text-[var(--muted-foreground)]">Lead Time</p>
                  <p className="font-medium">{item.leadTimeDays} days</p>
                </div>
                <div>
                  <p className="text-[var(--muted-foreground)]">EOQ</p>
                  <p className="font-medium">{calculateEOQ(item).toFixed(0)} {item.unit}</p>
                </div>
              </div>

              {/* Batch Expiry Warning */}
              {item.batches.some(b => {
                const days = Math.floor((b.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                return days < 90
              }) && (
                <div className="mt-4 p-3 bg-orange-900/20 border border-orange-500 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">
                      Batch expiring in {Math.floor((item.batches[0].expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                </div>
              )}

              {/* Compliance Warning */}
              {item.compliance.currentAnnualUsage / item.compliance.maxAnnualUsage > 0.8 && (
                <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-500 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">
                      {Math.round((item.compliance.currentAnnualUsage / item.compliance.maxAnnualUsage) * 100)}% of annual limit used
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        {selectedItem ? (
          <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
            <h2 className="text-xl font-semibold mb-4">{selectedItem.productName} Details</h2>

            {/* Batch Information */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Batch Information
              </h3>
              <div className="space-y-3">
                {selectedItem.batches.map((batch, i) => (
                  <div key={i} className="p-3 bg-[var(--secondary)] rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{batch.batchNumber}</p>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {batch.quantity} {selectedItem.unit} • ${batch.cost}
                        </p>
                      </div>
                      <span className={`text-sm ${getExpiryWarning(batch.expiryDate)}`}>
                        Exp: {batch.expiryDate.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      Purchased: {batch.purchaseDate.toLocaleDateString()} from {batch.supplier}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Usage Predictions */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Usage Predictions
              </h3>
              <div className="space-y-3">
                {predictions.map((pred, i) => (
                  <div key={i} className="p-3 bg-[var(--secondary)] rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{pred.period}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{pred.quantity} {selectedItem.unit}</span>
                        <span className={`text-xs ${
                          pred.confidence > 80 ? 'text-green-500' :
                          pred.confidence > 60 ? 'text-yellow-500' :
                          'text-orange-500'
                        }`}>
                          {pred.confidence}% confidence
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Based on: {pred.factors.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Usage */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <History className="w-5 h-5" />
                Recent Usage
              </h3>
              <div className="space-y-2">
                {usageHistory.map((usage, i) => (
                  <div key={i} className="p-3 bg-[var(--secondary)] rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">{usage.job}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {usage.block} • {usage.operator}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{usage.quantity} {selectedItem.unit}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {usage.date.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance Status */}
            <div className="p-4 bg-[var(--secondary)] rounded-lg">
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Regulatory Compliance
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Registration</span>
                  <span>{selectedItem.compliance.registrationNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Valid Until</span>
                  <span className={getExpiryWarning(selectedItem.compliance.expiryDate)}>
                    {selectedItem.compliance.expiryDate.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Annual Usage</span>
                  <span>
                    {selectedItem.compliance.currentAnnualUsage} / {selectedItem.compliance.maxAnnualUsage} {selectedItem.unit}
                  </span>
                </div>
                {selectedItem.compliance.restrictedUse && (
                  <div className="mt-2 p-2 bg-red-900/20 border border-red-500 rounded">
                    <p className="text-xs">Restricted Use Product - Special training required</p>
                  </div>
                )}
              </div>
            </div>

            {/* Reorder Suggestion */}
            {selectedItem.status === 'low' && (
              <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500 rounded-lg">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">Reorder Recommended</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Suggest ordering {calculateEOQ(selectedItem).toFixed(0)} {selectedItem.unit} within {selectedItem.leadTimeDays} days
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[var(--card)] rounded-lg p-12 border border-[var(--border)] flex items-center justify-center">
            <p className="text-[var(--muted-foreground)]">
              Select a product to view details
            </p>
          </div>
        )}
      </div>
    </div>
  )
}