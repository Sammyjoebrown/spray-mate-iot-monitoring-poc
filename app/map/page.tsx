'use client'

import { useState, useEffect } from 'react'
import { MapPin, Droplets, Wind, AlertTriangle, Activity, Layers, Navigation, ZoomIn, ZoomOut, Maximize2, Info, Calendar, Target, Shield, Bug, Cloud, Thermometer } from 'lucide-react'

interface Block {
  id: string
  name: string
  areaHa: number
  center: { lat: number, lng: number }
  status: 'idle' | 'scheduled' | 'in-progress' | 'completed' | 'issue'
  lastSpray?: Date
  nextSpray?: Date
  crop: string
  currentRisk?: {
    pest: number
    disease: number
    drift: number
  }
}

interface Sensor {
  id: string
  type: 'weather' | 'soil' | 'canopy' | 'spray'
  location: { lat: number, lng: number }
  status: 'online' | 'offline' | 'warning'
  lastReading?: any
}

interface SprayEvent {
  blockId: string
  time: Date
  operator: string
  chemical: string
  status: 'completed' | 'in-progress' | 'planned'
}

export default function FarmMapPage() {
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null)
  const [mapView, setMapView] = useState<'satellite' | 'terrain' | 'hybrid'>('hybrid')
  const [showLayers, setShowLayers] = useState({
    blocks: true,
    sensors: true,
    weather: true,
    risks: false,
    history: false,
  })
  const [zoomLevel, setZoomLevel] = useState(14)

  // Mock farm blocks with realistic layout
  const blocks: Block[] = [
    {
      id: '1',
      name: 'North Field',
      areaHa: 45.2,
      center: { lat: -37.8136, lng: 144.9631 },
      status: 'in-progress',
      lastSpray: new Date('2024-09-10'),
      nextSpray: new Date('2024-10-15'),
      crop: 'Wheat',
      currentRisk: { pest: 35, disease: 62, drift: 28 }
    },
    {
      id: '2',
      name: 'East Block',
      areaHa: 32.8,
      center: { lat: -37.8140, lng: 144.9640 },
      status: 'completed',
      lastSpray: new Date('2024-09-14'),
      nextSpray: new Date('2024-10-20'),
      crop: 'Barley',
      currentRisk: { pest: 22, disease: 45, drift: 15 }
    },
    {
      id: '3',
      name: 'River Paddock',
      areaHa: 28.5,
      center: { lat: -37.8148, lng: 144.9635 },
      status: 'scheduled',
      lastSpray: new Date('2024-08-28'),
      nextSpray: new Date('2024-09-18'),
      crop: 'Canola',
      currentRisk: { pest: 68, disease: 72, drift: 42 }
    },
    {
      id: '4',
      name: 'South Field',
      areaHa: 56.9,
      center: { lat: -37.8155, lng: 144.9628 },
      status: 'idle',
      lastSpray: new Date('2024-09-05'),
      crop: 'Wheat',
      currentRisk: { pest: 15, disease: 28, drift: 10 }
    },
    {
      id: '5',
      name: 'West Paddock',
      areaHa: 38.2,
      center: { lat: -37.8145, lng: 144.9620 },
      status: 'issue',
      lastSpray: new Date('2024-09-12'),
      nextSpray: new Date('2024-09-17'),
      crop: 'Lentils',
      currentRisk: { pest: 85, disease: 55, drift: 65 }
    },
    {
      id: '6',
      name: 'Hill Block',
      areaHa: 42.7,
      center: { lat: -37.8132, lng: 144.9645 },
      status: 'completed',
      lastSpray: new Date('2024-09-15'),
      crop: 'Barley',
      currentRisk: { pest: 30, disease: 40, drift: 20 }
    },
    {
      id: '7',
      name: 'Creek Field',
      areaHa: 29.3,
      center: { lat: -37.8160, lng: 144.9640 },
      status: 'idle',
      lastSpray: new Date('2024-09-08'),
      crop: 'Pasture',
      currentRisk: { pest: 12, disease: 18, drift: 8 }
    },
    {
      id: '8',
      name: 'Home Paddock',
      areaHa: 22.6,
      center: { lat: -37.8142, lng: 144.9625 },
      status: 'scheduled',
      lastSpray: new Date('2024-09-11'),
      nextSpray: new Date('2024-09-19'),
      crop: 'Oats',
      currentRisk: { pest: 42, disease: 38, drift: 25 }
    }
  ]

  const sensors: Sensor[] = [
    {
      id: 'WS001',
      type: 'weather',
      location: { lat: -37.8138, lng: 144.9633 },
      status: 'online',
      lastReading: { temp: 22.5, humidity: 65, windSpeed: 12 }
    },
    {
      id: 'WS002',
      type: 'weather',
      location: { lat: -37.8150, lng: 144.9642 },
      status: 'online',
      lastReading: { temp: 23.1, humidity: 62, windSpeed: 14 }
    },
    {
      id: 'SM001',
      type: 'soil',
      location: { lat: -37.8145, lng: 144.9630 },
      status: 'online',
      lastReading: { moisture: 35, temp: 18.2 }
    },
    {
      id: 'SM002',
      type: 'soil',
      location: { lat: -37.8155, lng: 144.9635 },
      status: 'offline',
    },
    {
      id: 'CS001',
      type: 'canopy',
      location: { lat: -37.8140, lng: 144.9638 },
      status: 'warning',
      lastReading: { ndvi: 0.72, canopyTemp: 21.8 }
    },
    {
      id: 'SP001',
      type: 'spray',
      location: { lat: -37.8136, lng: 144.9631 },
      status: 'online',
      lastReading: { flowRate: 180, pressure: 3.2 }
    }
  ]

  const recentEvents: SprayEvent[] = [
    {
      blockId: '1',
      time: new Date(),
      operator: 'John Smith',
      chemical: 'Roundup PowerMAX',
      status: 'in-progress'
    },
    {
      blockId: '2',
      time: new Date('2024-09-14'),
      operator: 'Sarah Johnson',
      chemical: 'Prosaro 420 SC',
      status: 'completed'
    },
    {
      blockId: '3',
      time: new Date('2024-09-18'),
      operator: 'Mike Brown',
      chemical: 'Velocity',
      status: 'planned'
    }
  ]

  const getBlockColor = (status: Block['status']) => {
    switch (status) {
      case 'in-progress': return 'fill-blue-500 stroke-blue-600 fill-opacity-40'
      case 'completed': return 'fill-green-500 stroke-green-600 fill-opacity-30'
      case 'scheduled': return 'fill-yellow-500 stroke-yellow-600 fill-opacity-30'
      case 'issue': return 'fill-red-500 stroke-red-600 fill-opacity-40'
      default: return 'fill-gray-500 stroke-gray-600 fill-opacity-20'
    }
  }

  const getSensorIcon = (type: Sensor['type']) => {
    switch (type) {
      case 'weather': return '🌡️'
      case 'soil': return '💧'
      case 'canopy': return '🌿'
      case 'spray': return '💨'
    }
  }

  const getRiskColor = (value: number) => {
    if (value < 30) return 'text-green-500'
    if (value < 60) return 'text-yellow-500'
    if (value < 80) return 'text-orange-500'
    return 'text-red-500'
  }

  // Calculate farm center
  const farmCenter = {
    lat: -37.8145,
    lng: 144.9635
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-[var(--card)] border-b border-[var(--border)] p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Farm Visualization</h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              Riverside Farm - 296.3 hectares • 8 blocks • 6 sensors
            </p>
          </div>

          {/* Map Controls */}
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex gap-1 bg-[var(--secondary)] rounded-lg p-1">
              {(['satellite', 'terrain', 'hybrid'] as const).map(view => (
                <button
                  key={view}
                  onClick={() => setMapView(view)}
                  className={`px-3 py-1 rounded text-sm capitalize transition-colors ${
                    mapView === view
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-[var(--muted)]'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>

            {/* Zoom Controls */}
            <div className="flex gap-1">
              <button
                onClick={() => setZoomLevel(Math.min(20, zoomLevel + 1))}
                className="p-2 bg-[var(--secondary)] rounded hover:bg-[var(--muted)] transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(Math.max(10, zoomLevel - 1))}
                className="p-2 bg-[var(--secondary)] rounded hover:bg-[var(--muted)] transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button className="p-2 bg-[var(--secondary)] rounded hover:bg-[var(--muted)] transition-colors">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 bg-[var(--card)] border-r border-[var(--border)] p-4 overflow-y-auto">
          {/* Layer Controls */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Map Layers
            </h3>
            <div className="space-y-2">
              {Object.entries(showLayers).map(([layer, enabled]) => (
                <label key={layer} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setShowLayers({ ...showLayers, [layer]: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm capitalize">{layer}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Block Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded" />
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded" />
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded" />
                <span>Scheduled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded" />
                <span>Issue Detected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-500 rounded" />
                <span>Idle</span>
              </div>
            </div>
          </div>

          {/* Selected Block Info */}
          {selectedBlock && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Block Details</h3>
              <div className="bg-[var(--secondary)] rounded-lg p-3 space-y-2">
                <div>
                  <p className="text-lg font-semibold">{selectedBlock.name}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {selectedBlock.areaHa} ha • {selectedBlock.crop}
                  </p>
                </div>

                {selectedBlock.lastSpray && (
                  <div className="text-sm">
                    <p className="text-[var(--muted-foreground)]">Last Spray</p>
                    <p>{selectedBlock.lastSpray.toLocaleDateString()}</p>
                  </div>
                )}

                {selectedBlock.nextSpray && (
                  <div className="text-sm">
                    <p className="text-[var(--muted-foreground)]">Next Scheduled</p>
                    <p className="text-yellow-500">
                      {selectedBlock.nextSpray.toLocaleDateString()}
                    </p>
                  </div>
                )}

                {selectedBlock.currentRisk && (
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)] mb-1">Risk Levels</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Pest</span>
                        <span className={getRiskColor(selectedBlock.currentRisk.pest)}>
                          {selectedBlock.currentRisk.pest}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Disease</span>
                        <span className={getRiskColor(selectedBlock.currentRisk.disease)}>
                          {selectedBlock.currentRisk.disease}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Drift</span>
                        <span className={getRiskColor(selectedBlock.currentRisk.drift)}>
                          {selectedBlock.currentRisk.drift}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <button className="w-full mt-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm">
                  View Block Details
                </button>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div>
            <h3 className="font-semibold mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {recentEvents.map((event, i) => (
                <div key={i} className="bg-[var(--secondary)] rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">
                        {blocks.find(b => b.id === event.blockId)?.name}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {event.chemical}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {event.operator}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      event.status === 'in-progress' ? 'bg-blue-500' :
                      event.status === 'completed' ? 'bg-green-500' :
                      'bg-yellow-500'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          {/* Mock Map Visualization */}
          <svg
            viewBox="0 0 1000 800"
            className="absolute inset-0 w-full h-full"
            style={{ transform: `scale(${zoomLevel / 14})` }}
          >
            {/* Background terrain */}
            {mapView !== 'satellite' && (
              <>
                <rect width="1000" height="800" className="fill-green-50 dark:fill-green-950" />

                {/* River */}
                <path
                  d="M 50 400 Q 200 450 400 420 T 700 450 Q 850 480 950 460"
                  className="stroke-blue-400 dark:stroke-blue-600 fill-none"
                  strokeWidth="20"
                />

                {/* Roads */}
                <path
                  d="M 0 200 L 1000 200"
                  className="stroke-gray-400 dark:stroke-gray-600"
                  strokeWidth="3"
                  strokeDasharray="10 5"
                />
                <path
                  d="M 300 0 L 300 800"
                  className="stroke-gray-400 dark:stroke-gray-600"
                  strokeWidth="3"
                  strokeDasharray="10 5"
                />
              </>
            )}

            {/* Farm Blocks */}
            {showLayers.blocks && (
              <g>
                {/* Block polygons - simplified representations */}
                <polygon
                  points="100,50 280,80 300,180 120,150"
                  className={getBlockColor(blocks[0].status)}
                  strokeWidth="2"
                  onClick={() => setSelectedBlock(blocks[0])}
                  style={{ cursor: 'pointer' }}
                />
                <polygon
                  points="320,100 480,120 500,220 340,200"
                  className={getBlockColor(blocks[1].status)}
                  strokeWidth="2"
                  onClick={() => setSelectedBlock(blocks[1])}
                  style={{ cursor: 'pointer' }}
                />
                <polygon
                  points="520,150 680,140 700,280 540,250"
                  className={getBlockColor(blocks[2].status)}
                  strokeWidth="2"
                  onClick={() => setSelectedBlock(blocks[2])}
                  style={{ cursor: 'pointer' }}
                />
                <polygon
                  points="150,250 300,280 320,380 140,350"
                  className={getBlockColor(blocks[3].status)}
                  strokeWidth="2"
                  onClick={() => setSelectedBlock(blocks[3])}
                  style={{ cursor: 'pointer' }}
                />
                <polygon
                  points="350,300 500,320 520,420 370,400"
                  className={getBlockColor(blocks[4].status)}
                  strokeWidth="2"
                  onClick={() => setSelectedBlock(blocks[4])}
                  style={{ cursor: 'pointer' }}
                />
                <polygon
                  points="720,200 880,180 900,320 740,300"
                  className={getBlockColor(blocks[5].status)}
                  strokeWidth="2"
                  onClick={() => setSelectedBlock(blocks[5])}
                  style={{ cursor: 'pointer' }}
                />
                <polygon
                  points="100,500 250,520 270,650 120,630"
                  className={getBlockColor(blocks[6].status)}
                  strokeWidth="2"
                  onClick={() => setSelectedBlock(blocks[6])}
                  style={{ cursor: 'pointer' }}
                />
                <polygon
                  points="550,480 700,460 720,580 570,600"
                  className={getBlockColor(blocks[7].status)}
                  strokeWidth="2"
                  onClick={() => setSelectedBlock(blocks[7])}
                  style={{ cursor: 'pointer' }}
                />

                {/* Block labels */}
                {blocks.map((block, i) => {
                  const positions = [
                    { x: 190, y: 115 },
                    { x: 410, y: 160 },
                    { x: 610, y: 195 },
                    { x: 220, y: 315 },
                    { x: 435, y: 360 },
                    { x: 810, y: 250 },
                    { x: 185, y: 575 },
                    { x: 635, y: 530 }
                  ]
                  return (
                    <g key={block.id}>
                      <text
                        x={positions[i].x}
                        y={positions[i].y}
                        className="fill-black dark:fill-white font-semibold text-sm"
                        textAnchor="middle"
                      >
                        {block.name}
                      </text>
                      <text
                        x={positions[i].x}
                        y={positions[i].y + 15}
                        className="fill-gray-600 dark:fill-gray-400 text-xs"
                        textAnchor="middle"
                      >
                        {block.areaHa} ha
                      </text>
                      {block.status === 'in-progress' && (
                        <circle
                          cx={positions[i].x}
                          cy={positions[i].y - 20}
                          r="8"
                          className="fill-blue-500 animate-pulse"
                        />
                      )}
                    </g>
                  )
                })}
              </g>
            )}

            {/* Sensors */}
            {showLayers.sensors && sensors.map((sensor, i) => {
              const positions = [
                { x: 200, y: 100 },
                { x: 600, y: 400 },
                { x: 400, y: 250 },
                { x: 700, y: 550 },
                { x: 350, y: 450 },
                { x: 190, y: 115 }
              ]
              return (
                <g key={sensor.id}>
                  <circle
                    cx={positions[i].x}
                    cy={positions[i].y}
                    r="15"
                    className={`
                      ${sensor.status === 'online' ? 'fill-green-500' :
                        sensor.status === 'offline' ? 'fill-red-500' :
                        'fill-yellow-500'}
                      stroke-white dark:stroke-black
                    `}
                    strokeWidth="2"
                  />
                  <text
                    x={positions[i].x}
                    y={positions[i].y + 5}
                    className="fill-white text-xs font-bold"
                    textAnchor="middle"
                    fontSize="16"
                  >
                    {getSensorIcon(sensor.type)}
                  </text>
                </g>
              )
            })}

            {/* Weather overlay */}
            {showLayers.weather && (
              <g opacity="0.7">
                {/* Wind direction indicator */}
                <g transform="translate(900, 50)">
                  <circle r="30" className="fill-white dark:fill-gray-800 stroke-gray-400" strokeWidth="2" />
                  <line
                    x1="0" y1="0"
                    x2="0" y2="-20"
                    className="stroke-blue-600"
                    strokeWidth="3"
                    markerEnd="url(#arrowhead)"
                    transform="rotate(180)"
                  />
                  <text y="45" textAnchor="middle" className="fill-black dark:fill-white text-sm">
                    12 km/h
                  </text>
                </g>

                {/* Define arrow marker */}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="10"
                    refX="0"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3, 0 6" className="fill-blue-600" />
                  </marker>
                </defs>

                {/* Temperature gradient visualization */}
                {showLayers.risks && (
                  <defs>
                    <linearGradient id="tempGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: 'rgb(59, 130, 246)', stopOpacity: 0.3 }} />
                      <stop offset="50%" style={{ stopColor: 'rgb(34, 197, 94)', stopOpacity: 0.3 }} />
                      <stop offset="100%" style={{ stopColor: 'rgb(245, 158, 11)', stopOpacity: 0.3 }} />
                    </linearGradient>
                  </defs>
                )}
              </g>
            )}

            {/* Risk overlay */}
            {showLayers.risks && blocks.map((block, i) => {
              const positions = [
                { x: 190, y: 115 },
                { x: 410, y: 160 },
                { x: 610, y: 195 },
                { x: 220, y: 315 },
                { x: 435, y: 360 },
                { x: 810, y: 250 },
                { x: 185, y: 575 },
                { x: 635, y: 530 }
              ]
              const maxRisk = Math.max(
                block.currentRisk?.pest || 0,
                block.currentRisk?.disease || 0,
                block.currentRisk?.drift || 0
              )
              if (maxRisk > 60) {
                return (
                  <circle
                    key={`risk-${block.id}`}
                    cx={positions[i].x}
                    cy={positions[i].y}
                    r="40"
                    className={`
                      ${maxRisk > 80 ? 'fill-red-500' :
                        maxRisk > 60 ? 'fill-orange-500' :
                        'fill-yellow-500'}
                    `}
                    opacity="0.3"
                  />
                )
              }
              return null
            })}
          </svg>

          {/* Map Status Bar */}
          <div className="absolute bottom-4 left-4 right-4 bg-black/70 rounded-lg p-3 text-white">
            <div className="flex justify-between items-center text-sm">
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4" />
                  <span>22.5°C</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4" />
                  <span>65% RH</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4" />
                  <span>12 km/h S</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4" />
                  <span>Delta T: 4.5 (Ideal)</span>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-500" />
                  <span>6 Sensors Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span>Drift Risk: Low</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Spray Indicator */}
          {blocks.some(b => b.status === 'in-progress') && (
            <div className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 animate-pulse">
              <Droplets className="w-5 h-5" />
              <span className="font-semibold">Spray Job Active</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}