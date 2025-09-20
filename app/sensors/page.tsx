'use client'

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, Thermometer, Droplets, Wind, Sun, CloudRain, Battery, Activity, MapPin, AlertTriangle, TrendingUp, Gauge } from 'lucide-react'

interface SensorData {
  id: string
  name: string
  type: 'weather' | 'soil' | 'canopy' | 'spray'
  location: {
    block: string
    lat: number
    lon: number
  }
  status: 'online' | 'offline' | 'warning'
  battery: number
  lastUpdate: Date
  signalStrength: number
  data: {
    temperature?: number
    humidity?: number
    windSpeed?: number
    windDirection?: number
    solarRadiation?: number
    rainfall?: number
    soilMoisture?: number
    soilTemp?: number
    soilEC?: number
    leafWetness?: number
    canopyTemp?: number
    ndvi?: number
    flowRate?: number
    pressure?: number
    coverage?: number
  }
  alerts: {
    type: string
    message: string
    severity: 'info' | 'warning' | 'critical'
  }[]
  history: {
    time: Date
    value: number
    metric: string
  }[]
}

interface NetworkMetrics {
  totalSensors: number
  onlineSensors: number
  avgSignalStrength: number
  dataPoints24h: number
  avgLatency: number
  packetLoss: number
}

export default function SensorsPage() {
  const [sensors, setSensors] = useState<SensorData[]>([])
  const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null)
  const [networkMetrics, setNetworkMetrics] = useState<NetworkMetrics>({
    totalSensors: 0,
    onlineSensors: 0,
    avgSignalStrength: 0,
    dataPoints24h: 0,
    avgLatency: 0,
    packetLoss: 0
  })
  const [filter, setFilter] = useState<'all' | 'weather' | 'soil' | 'canopy' | 'spray'>('all')
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h')

  useEffect(() => {
    // Generate mock sensor data
    const mockSensors: SensorData[] = [
      {
        id: 'WS001',
        name: 'North Field Weather Station',
        type: 'weather',
        location: { block: 'North Field', lat: -37.8136, lon: 144.9631 },
        status: 'online',
        battery: 85,
        lastUpdate: new Date(Date.now() - 5 * 60000),
        signalStrength: 92,
        data: {
          temperature: 22.5,
          humidity: 65,
          windSpeed: 12,
          windDirection: 180,
          solarRadiation: 650,
          rainfall: 0
        },
        alerts: [],
        history: Array.from({ length: 24 }, (_, i) => ({
          time: new Date(Date.now() - i * 3600000),
          value: 20 + Math.sin(i / 3) * 5,
          metric: 'temperature'
        }))
      },
      {
        id: 'SM001',
        name: 'East Block Soil Monitor',
        type: 'soil',
        location: { block: 'East Block', lat: -37.8140, lon: 144.9635 },
        status: 'online',
        battery: 72,
        lastUpdate: new Date(Date.now() - 10 * 60000),
        signalStrength: 88,
        data: {
          soilMoisture: 35,
          soilTemp: 18.2,
          soilEC: 2.1
        },
        alerts: [
          {
            type: 'Moisture',
            message: 'Soil moisture approaching critical level',
            severity: 'warning'
          }
        ],
        history: Array.from({ length: 24 }, (_, i) => ({
          time: new Date(Date.now() - i * 3600000),
          value: 35 + Math.random() * 10 - 5,
          metric: 'soilMoisture'
        }))
      },
      {
        id: 'CS001',
        name: 'West Paddock Canopy Sensor',
        type: 'canopy',
        location: { block: 'West Paddock', lat: -37.8145, lon: 144.9640 },
        status: 'online',
        battery: 90,
        lastUpdate: new Date(Date.now() - 2 * 60000),
        signalStrength: 95,
        data: {
          canopyTemp: 21.8,
          leafWetness: 15,
          ndvi: 0.72
        },
        alerts: [],
        history: Array.from({ length: 24 }, (_, i) => ({
          time: new Date(Date.now() - i * 3600000),
          value: 0.70 + Math.random() * 0.1,
          metric: 'ndvi'
        }))
      },
      {
        id: 'SP001',
        name: 'Sprayer 1 Flow Sensor',
        type: 'spray',
        location: { block: 'Active Job', lat: -37.8138, lon: 144.9633 },
        status: 'online',
        battery: 45,
        lastUpdate: new Date(Date.now() - 1 * 60000),
        signalStrength: 78,
        data: {
          flowRate: 180,
          pressure: 3.2,
          coverage: 92
        },
        alerts: [
          {
            type: 'Battery',
            message: 'Low battery - charge soon',
            severity: 'warning'
          }
        ],
        history: Array.from({ length: 24 }, (_, i) => ({
          time: new Date(Date.now() - i * 3600000),
          value: 175 + Math.random() * 20,
          metric: 'flowRate'
        }))
      },
      {
        id: 'WS002',
        name: 'South Field Weather Station',
        type: 'weather',
        location: { block: 'South Field', lat: -37.8142, lon: 144.9628 },
        status: 'warning',
        battery: 25,
        lastUpdate: new Date(Date.now() - 30 * 60000),
        signalStrength: 65,
        data: {
          temperature: 23.1,
          humidity: 62,
          windSpeed: 15,
          windDirection: 190,
          solarRadiation: 680,
          rainfall: 0.2
        },
        alerts: [
          {
            type: 'Battery',
            message: 'Critical battery level',
            severity: 'critical'
          },
          {
            type: 'Connection',
            message: 'Intermittent connectivity issues',
            severity: 'warning'
          }
        ],
        history: Array.from({ length: 24 }, (_, i) => ({
          time: new Date(Date.now() - i * 3600000),
          value: 21 + Math.sin(i / 3) * 4,
          metric: 'temperature'
        }))
      },
      {
        id: 'SM002',
        name: 'River Block Soil Monitor',
        type: 'soil',
        location: { block: 'River Block', lat: -37.8148, lon: 144.9645 },
        status: 'offline',
        battery: 0,
        lastUpdate: new Date(Date.now() - 120 * 60000),
        signalStrength: 0,
        data: {
          soilMoisture: 42,
          soilTemp: 17.5,
          soilEC: 1.8
        },
        alerts: [
          {
            type: 'Connection',
            message: 'Sensor offline for 2 hours',
            severity: 'critical'
          }
        ],
        history: []
      }
    ]

    setSensors(mockSensors)
    setSelectedSensor(mockSensors[0])

    // Calculate network metrics
    const online = mockSensors.filter(s => s.status === 'online').length
    const avgSignal = mockSensors
      .filter(s => s.status === 'online')
      .reduce((sum, s) => sum + s.signalStrength, 0) / online || 0

    setNetworkMetrics({
      totalSensors: mockSensors.length,
      onlineSensors: online,
      avgSignalStrength: avgSignal,
      dataPoints24h: online * 24 * 12, // Every 5 minutes
      avgLatency: 45,
      packetLoss: 0.8
    })

    // Simulate real-time updates
    const interval = setInterval(() => {
      setSensors(prev => prev.map(sensor => {
        if (sensor.status !== 'online') return sensor

        const updated = { ...sensor }
        updated.lastUpdate = new Date()

        // Update weather data
        if (sensor.type === 'weather' && sensor.data.temperature) {
          updated.data.temperature += (Math.random() - 0.5) * 0.5
          updated.data.windSpeed = Math.max(0, (sensor.data.windSpeed || 0) + (Math.random() - 0.5) * 2)
        }

        // Update soil moisture
        if (sensor.type === 'soil' && sensor.data.soilMoisture) {
          updated.data.soilMoisture = Math.max(20, Math.min(50,
            sensor.data.soilMoisture + (Math.random() - 0.5) * 2))
        }

        return updated
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const filteredSensors = sensors.filter(sensor => {
    if (filter === 'all') return true
    return sensor.type === filter
  })

  const getSensorIcon = (type: SensorData['type']) => {
    switch (type) {
      case 'weather': return <Wind className="w-5 h-5" />
      case 'soil': return <Droplets className="w-5 h-5" />
      case 'canopy': return <Sun className="w-5 h-5" />
      case 'spray': return <Activity className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: SensorData['status']) => {
    switch (status) {
      case 'online': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'offline': return 'text-red-500'
    }
  }

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'text-green-500'
    if (level > 30) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getSignalIcon = (strength: number) => {
    if (strength > 75) return <Wifi className="w-4 h-4 text-green-500" />
    if (strength > 50) return <Wifi className="w-4 h-4 text-yellow-500" />
    if (strength > 25) return <Wifi className="w-4 h-4 text-orange-500" />
    return <WifiOff className="w-4 h-4 text-red-500" />
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sensor Network</h1>
        <p className="text-[var(--muted-foreground)]">
          Real-time monitoring of field sensors and IoT devices
        </p>
      </div>

      {/* Network Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-[var(--card)] rounded-lg p-4 border border-[var(--border)]">
          <div className="text-2xl font-bold">{networkMetrics.onlineSensors}/{networkMetrics.totalSensors}</div>
          <p className="text-sm text-[var(--muted-foreground)]">Online</p>
        </div>
        <div className="bg-[var(--card)] rounded-lg p-4 border border-[var(--border)]">
          <div className="text-2xl font-bold">{networkMetrics.avgSignalStrength.toFixed(0)}%</div>
          <p className="text-sm text-[var(--muted-foreground)]">Avg Signal</p>
        </div>
        <div className="bg-[var(--card)] rounded-lg p-4 border border-[var(--border)]">
          <div className="text-2xl font-bold">{networkMetrics.dataPoints24h}</div>
          <p className="text-sm text-[var(--muted-foreground)]">Data Points/24h</p>
        </div>
        <div className="bg-[var(--card)] rounded-lg p-4 border border-[var(--border)]">
          <div className="text-2xl font-bold">{networkMetrics.avgLatency}ms</div>
          <p className="text-sm text-[var(--muted-foreground)]">Avg Latency</p>
        </div>
        <div className="bg-[var(--card)] rounded-lg p-4 border border-[var(--border)]">
          <div className="text-2xl font-bold">{networkMetrics.packetLoss}%</div>
          <p className="text-sm text-[var(--muted-foreground)]">Packet Loss</p>
        </div>
        <div className="bg-[var(--card)] rounded-lg p-4 border border-[var(--border)]">
          <div className="text-2xl font-bold text-green-500">Active</div>
          <p className="text-sm text-[var(--muted-foreground)]">Network Status</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'weather', 'soil', 'canopy', 'spray'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg transition-colors capitalize ${
              filter === f
                ? 'bg-blue-500 text-white'
                : 'bg-[var(--secondary)] hover:bg-[var(--muted)]'
            }`}
          >
            {f === 'all' ? 'All Sensors' : f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sensor List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Active Sensors</h2>
          {filteredSensors.map(sensor => (
            <div
              key={sensor.id}
              className={`bg-[var(--card)] rounded-lg p-4 border cursor-pointer transition-colors ${
                selectedSensor?.id === sensor.id
                  ? 'border-blue-500'
                  : 'border-[var(--border)] hover:border-gray-500'
              }`}
              onClick={() => setSelectedSensor(sensor)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    sensor.type === 'weather' ? 'bg-blue-500/10' :
                    sensor.type === 'soil' ? 'bg-brown-500/10' :
                    sensor.type === 'canopy' ? 'bg-green-500/10' :
                    'bg-purple-500/10'
                  }`}>
                    {getSensorIcon(sensor.type)}
                  </div>
                  <div>
                    <p className="font-semibold">{sensor.name}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">{sensor.id}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      {sensor.location.block}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs font-medium ${getStatusColor(sensor.status)}`}>
                    {sensor.status.toUpperCase()}
                  </span>
                  {getSignalIcon(sensor.signalStrength)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Battery className={`w-4 h-4 ${getBatteryColor(sensor.battery)}`} />
                  <span>{sensor.battery}%</span>
                </div>
                <div className="text-right text-xs text-[var(--muted-foreground)]">
                  {Math.floor((Date.now() - sensor.lastUpdate.getTime()) / 60000)}m ago
                </div>
              </div>

              {sensor.alerts.length > 0 && (
                <div className="mt-3 p-2 bg-yellow-900/20 border border-yellow-500 rounded">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs">{sensor.alerts[0].message}</span>
                  </div>
                </div>
              )}

              {/* Quick metrics */}
              {sensor.status === 'online' && (
                <div className="mt-3 pt-3 border-t border-[var(--border)]">
                  {sensor.type === 'weather' && (
                    <div className="flex justify-between text-xs">
                      <span>{sensor.data.temperature?.toFixed(1)}°C</span>
                      <span>{sensor.data.humidity}% RH</span>
                      <span>{sensor.data.windSpeed} km/h</span>
                    </div>
                  )}
                  {sensor.type === 'soil' && (
                    <div className="flex justify-between text-xs">
                      <span>{sensor.data.soilMoisture}% VWC</span>
                      <span>{sensor.data.soilTemp?.toFixed(1)}°C</span>
                      <span>{sensor.data.soilEC} mS/cm</span>
                    </div>
                  )}
                  {sensor.type === 'canopy' && (
                    <div className="flex justify-between text-xs">
                      <span>NDVI: {sensor.data.ndvi?.toFixed(2)}</span>
                      <span>LW: {sensor.data.leafWetness}%</span>
                    </div>
                  )}
                  {sensor.type === 'spray' && (
                    <div className="flex justify-between text-xs">
                      <span>{sensor.data.flowRate} L/min</span>
                      <span>{sensor.data.pressure} bar</span>
                      <span>{sensor.data.coverage}%</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sensor Details */}
        {selectedSensor && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-semibold">{selectedSensor.name}</h2>
                  <p className="text-[var(--muted-foreground)]">
                    {selectedSensor.id} • {selectedSensor.type} sensor
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${getStatusColor(selectedSensor.status)}`}>
                    {selectedSensor.status.toUpperCase()}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Last update: {selectedSensor.lastUpdate.toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Real-time Data Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {selectedSensor.type === 'weather' && (
                  <>
                    <div className="bg-[var(--secondary)] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Thermometer className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-[var(--muted-foreground)]">Temperature</span>
                      </div>
                      <p className="text-2xl font-bold">{selectedSensor.data.temperature?.toFixed(1)}°C</p>
                    </div>
                    <div className="bg-[var(--secondary)] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Droplets className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-[var(--muted-foreground)]">Humidity</span>
                      </div>
                      <p className="text-2xl font-bold">{selectedSensor.data.humidity}%</p>
                    </div>
                    <div className="bg-[var(--secondary)] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Wind className="w-4 h-4 text-cyan-500" />
                        <span className="text-sm text-[var(--muted-foreground)]">Wind</span>
                      </div>
                      <p className="text-2xl font-bold">{selectedSensor.data.windSpeed} km/h</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{selectedSensor.data.windDirection}°</p>
                    </div>
                    <div className="bg-[var(--secondary)] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sun className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-[var(--muted-foreground)]">Solar</span>
                      </div>
                      <p className="text-2xl font-bold">{selectedSensor.data.solarRadiation} W/m²</p>
                    </div>
                    <div className="bg-[var(--secondary)] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CloudRain className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-[var(--muted-foreground)]">Rainfall</span>
                      </div>
                      <p className="text-2xl font-bold">{selectedSensor.data.rainfall} mm</p>
                    </div>
                  </>
                )}

                {selectedSensor.type === 'soil' && (
                  <>
                    <div className="bg-[var(--secondary)] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Droplets className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-[var(--muted-foreground)]">Moisture</span>
                      </div>
                      <p className="text-2xl font-bold">{selectedSensor.data.soilMoisture}%</p>
                      <p className="text-xs text-[var(--muted-foreground)]">VWC</p>
                    </div>
                    <div className="bg-[var(--secondary)] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Thermometer className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-[var(--muted-foreground)]">Temperature</span>
                      </div>
                      <p className="text-2xl font-bold">{selectedSensor.data.soilTemp?.toFixed(1)}°C</p>
                    </div>
                    <div className="bg-[var(--secondary)] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--muted-foreground)]">EC</span>
                      </div>
                      <p className="text-2xl font-bold">{selectedSensor.data.soilEC} mS/cm</p>
                    </div>
                  </>
                )}

                {selectedSensor.type === 'canopy' && (
                  <>
                    <div className="bg-[var(--secondary)] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sun className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--muted-foreground)]">NDVI</span>
                      </div>
                      <p className="text-2xl font-bold">{selectedSensor.data.ndvi?.toFixed(2)}</p>
                    </div>
                    <div className="bg-[var(--secondary)] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Thermometer className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-[var(--muted-foreground)]">Canopy Temp</span>
                      </div>
                      <p className="text-2xl font-bold">{selectedSensor.data.canopyTemp?.toFixed(1)}°C</p>
                    </div>
                    <div className="bg-[var(--secondary)] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Droplets className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-[var(--muted-foreground)]">Leaf Wetness</span>
                      </div>
                      <p className="text-2xl font-bold">{selectedSensor.data.leafWetness}%</p>
                    </div>
                  </>
                )}

                {selectedSensor.type === 'spray' && (
                  <>
                    <div className="bg-[var(--secondary)] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-[var(--muted-foreground)]">Flow Rate</span>
                      </div>
                      <p className="text-2xl font-bold">{selectedSensor.data.flowRate} L/min</p>
                    </div>
                    <div className="bg-[var(--secondary)] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Gauge className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-[var(--muted-foreground)]">Pressure</span>
                      </div>
                      <p className="text-2xl font-bold">{selectedSensor.data.pressure} bar</p>
                    </div>
                    <div className="bg-[var(--secondary)] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[var(--muted-foreground)]">Coverage</span>
                      </div>
                      <p className="text-2xl font-bold">{selectedSensor.data.coverage}%</p>
                    </div>
                  </>
                )}
              </div>

              {/* Time Range Selector */}
              <div className="flex gap-2 mb-4">
                {(['1h', '24h', '7d', '30d'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      timeRange === range
                        ? 'bg-blue-500 text-white'
                        : 'bg-[var(--secondary)] hover:bg-[var(--muted)]'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>

              {/* Historical Chart Placeholder */}
              <div className="bg-[var(--secondary)] rounded-lg p-8 mb-6">
                <div className="flex items-center justify-center h-48">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 text-[var(--muted-foreground)]" />
                    <p className="text-[var(--muted-foreground)]">
                      Historical data chart for {timeRange}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)] mt-2">
                      {selectedSensor.history.length} data points available
                    </p>
                  </div>
                </div>
              </div>

              {/* Device Information */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[var(--secondary)] rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Device Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">Location</span>
                      <span>{selectedSensor.location.block}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">Coordinates</span>
                      <span className="text-xs">
                        {selectedSensor.location.lat.toFixed(4)}, {selectedSensor.location.lon.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">Signal</span>
                      <span>{selectedSensor.signalStrength}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">Battery</span>
                      <span className={getBatteryColor(selectedSensor.battery)}>
                        {selectedSensor.battery}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--secondary)] rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Alerts & Notifications</h3>
                  {selectedSensor.alerts.length > 0 ? (
                    <div className="space-y-2">
                      {selectedSensor.alerts.map((alert, i) => (
                        <div
                          key={i}
                          className={`p-2 rounded border ${
                            alert.severity === 'critical'
                              ? 'bg-red-900/20 border-red-500'
                              : alert.severity === 'warning'
                              ? 'bg-yellow-900/20 border-yellow-500'
                              : 'bg-blue-900/20 border-blue-500'
                          }`}
                        >
                          <p className="text-xs font-medium">{alert.type}</p>
                          <p className="text-xs">{alert.message}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--muted-foreground)]">
                      No active alerts
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}