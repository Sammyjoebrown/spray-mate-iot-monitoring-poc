'use client'

import { useState, useEffect } from 'react'
import { WeatherIntelligence } from '@/lib/services/weather-intelligence'
import { Cloud, Droplets, Thermometer, Wind, AlertTriangle, TrendingUp, Calendar, Activity } from 'lucide-react'

export default function WeatherIntelligencePage() {
  const [currentConditions, setCurrentConditions] = useState({
    temperature: 22.5,
    humidity: 65,
    windSpeed: 12,
    windDirection: 180,
    pressure: 1013,
    cloudCover: 40,
    dewPoint: 14.2,
    deltaT: 4.5,
    solarRadiation: 650,
  })

  const [forecast, setForecast] = useState<any[]>([])
  const [sprayWindows, setSprayWindows] = useState<any[]>([])
  const [diseaseRisk, setDiseaseRisk] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => {
    // Calculate Delta T
    const deltaT = WeatherIntelligence.calculateDeltaT(
      currentConditions.temperature,
      currentConditions.temperature - 2
    )

    // Calculate ET0
    const et0 = WeatherIntelligence.calculateET0(
      currentConditions.solarRadiation,
      currentConditions.windSpeed,
      currentConditions.temperature,
      currentConditions.humidity,
      100
    )

    // Calculate disease pressure
    const fungalPressure = WeatherIntelligence.calculateDiseasePressure(
      currentConditions.temperature,
      currentConditions.humidity,
      6,
      'fungal'
    )

    // Generate mock forecast
    const mockForecast = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      tempC: 20 + Math.sin(i / 3) * 5,
      windKph: 10 + Math.random() * 10,
      windDirDeg: 180 + Math.random() * 30 - 15,
      rhPct: 60 + Math.random() * 20,
      precipProb: Math.max(0, Math.random() * 100 - 70),
    }))
    setForecast(mockForecast)

    // Find spray windows
    const windows = WeatherIntelligence.findOptimalSprayWindows(
      mockForecast,
      'herbicide',
      [],
      1
    )
    setSprayWindows(windows.slice(0, 3))

    // Generate weather alerts
    const weatherAlerts = WeatherIntelligence.generateWeatherAlerts(
      currentConditions,
      mockForecast,
      []
    )
    setAlerts(weatherAlerts)

    // Mock disease risk
    setDiseaseRisk([
      { disease: 'Stripe Rust', risk: fungalPressure, trend: 'increasing' },
      { disease: 'Powdery Mildew', risk: fungalPressure * 0.8, trend: 'stable' },
      { disease: 'Septoria', risk: fungalPressure * 0.6, trend: 'decreasing' },
    ])
  }, [currentConditions])

  const getRiskColor = (risk: number) => {
    if (risk < 30) return 'text-green-500'
    if (risk < 60) return 'text-yellow-500'
    if (risk < 80) return 'text-orange-500'
    return 'text-red-500'
  }

  const getDeltaTStatus = (deltaT: number) => {
    if (deltaT < 2) return { text: 'Strong Inversion', color: 'text-red-500' }
    if (deltaT < 4) return { text: 'Marginal', color: 'text-yellow-500' }
    if (deltaT <= 8) return { text: 'Ideal', color: 'text-green-500' }
    return { text: 'Unstable', color: 'text-orange-500' }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Weather Intelligence</h1>
        <p className="text-[var(--muted-foreground)]">
          Advanced microclimate monitoring and spray window prediction
        </p>
      </div>

      {/* Weather Alerts */}
      {alerts.length > 0 && (
        <div className="mb-8 space-y-4">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border ${
                alert.severity === 'critical'
                  ? 'bg-red-900/20 border-red-500'
                  : alert.severity === 'warning'
                  ? 'bg-yellow-900/20 border-yellow-500'
                  : 'bg-blue-900/20 border-blue-500'
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold">{alert.type.replace(/_/g, ' ')}</h3>
                  <p className="text-sm mt-1">{alert.message}</p>
                  {alert.recommendations.length > 0 && (
                    <ul className="text-sm mt-2 space-y-1">
                      {alert.recommendations.map((rec, j) => (
                        <li key={j}>• {rec}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current Conditions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
          <div className="flex items-center gap-3 mb-4">
            <Thermometer className="w-6 h-6 text-orange-500" />
            <span className="text-lg font-semibold">Temperature</span>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold">{currentConditions.temperature}°C</p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Dew Point: {currentConditions.dewPoint}°C
            </p>
            <div className="text-sm">
              <span className="text-[var(--muted-foreground)]">Delta T: </span>
              <span className={getDeltaTStatus(currentConditions.deltaT).color}>
                {currentConditions.deltaT.toFixed(1)} ({getDeltaTStatus(currentConditions.deltaT).text})
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
          <div className="flex items-center gap-3 mb-4">
            <Wind className="w-6 h-6 text-blue-500" />
            <span className="text-lg font-semibold">Wind</span>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold">{currentConditions.windSpeed} km/h</p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Direction: {WeatherIntelligence.getWindDirectionName(currentConditions.windDirection)}
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Gusts: {(currentConditions.windSpeed * 1.3).toFixed(0)} km/h
            </p>
          </div>
        </div>

        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
          <div className="flex items-center gap-3 mb-4">
            <Droplets className="w-6 h-6 text-cyan-500" />
            <span className="text-lg font-semibold">Moisture</span>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold">{currentConditions.humidity}%</p>
            <p className="text-sm text-[var(--muted-foreground)]">
              ET₀: {WeatherIntelligence.calculateET0(
                currentConditions.solarRadiation,
                currentConditions.windSpeed,
                currentConditions.temperature,
                currentConditions.humidity,
                100
              ).toFixed(1)} mm/day
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Leaf Wetness: 2.5 hours
            </p>
          </div>
        </div>

        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
          <div className="flex items-center gap-3 mb-4">
            <Cloud className="w-6 h-6 text-gray-500" />
            <span className="text-lg font-semibold">Conditions</span>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold">{currentConditions.pressure} hPa</p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Cloud: {currentConditions.cloudCover}%
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Solar: {currentConditions.solarRadiation} W/m²
            </p>
          </div>
        </div>
      </div>

      {/* Optimal Spray Windows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Optimal Spray Windows
          </h2>
          {sprayWindows.length > 0 ? (
            <div className="space-y-3">
              {sprayWindows.map((window, i) => (
                <div key={i} className="p-3 bg-[var(--secondary)] rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">
                        {new Date(window.startTime).toLocaleTimeString()} -
                        {new Date(window.endTime).toLocaleTimeString()}
                      </p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Confidence: {window.confidence}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        Wind: {window.conditions.avgWindSpeed.toFixed(0)} km/h
                      </p>
                      <p className="text-sm">
                        Temp: {window.conditions.temperature.toFixed(1)}°C
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {Object.entries(window.suitability).map(([type, score]) => (
                      <div key={type} className="text-center">
                        <p className="text-xs text-[var(--muted-foreground)] capitalize">
                          {type}
                        </p>
                        <p className={`text-sm font-semibold ${getRiskColor(100 - score as number)}`}>
                          {score}%
                        </p>
                      </div>
                    ))}
                  </div>
                  {window.limitations.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[var(--border)]">
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Limitations: {window.limitations.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--muted-foreground)]">
              No optimal windows in the next 3 hours
            </p>
          )}
        </div>

        {/* Disease Risk */}
        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Disease Pressure Index
          </h2>
          <div className="space-y-4">
            {diseaseRisk.map((disease, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{disease.disease}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${getRiskColor(disease.risk)}`}>
                      {disease.risk}%
                    </span>
                    {disease.trend === 'increasing' && (
                      <TrendingUp className="w-4 h-4 text-red-500" />
                    )}
                    {disease.trend === 'decreasing' && (
                      <TrendingUp className="w-4 h-4 text-green-500 rotate-180" />
                    )}
                  </div>
                </div>
                <div className="w-full bg-[var(--secondary)] rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      disease.risk < 30
                        ? 'bg-green-500'
                        : disease.risk < 60
                        ? 'bg-yellow-500'
                        : disease.risk < 80
                        ? 'bg-orange-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${disease.risk}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-3 bg-[var(--secondary)] rounded-lg">
            <p className="text-sm font-medium mb-2">Contributing Factors:</p>
            <ul className="text-sm text-[var(--muted-foreground)] space-y-1">
              <li>• High humidity ({currentConditions.humidity}%) favours fungal growth</li>
              <li>• Moderate temperatures optimal for disease</li>
              <li>• Extended leaf wetness periods detected</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 24-Hour Forecast */}
      <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
        <h2 className="text-xl font-semibold mb-4">24-Hour Forecast</h2>
        <div className="overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {forecast.slice(0, 24).map((hour, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-20 p-3 bg-[var(--secondary)] rounded-lg text-center"
              >
                <p className="text-xs text-[var(--muted-foreground)]">
                  {i === 0 ? 'Now' : `+${i}h`}
                </p>
                <p className="text-lg font-semibold my-1">
                  {hour.tempC.toFixed(0)}°
                </p>
                <p className="text-xs">{hour.windKph.toFixed(0)} km/h</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {hour.rhPct}% RH
                </p>
                {hour.precipProb > 30 && (
                  <p className="text-xs text-blue-400 mt-1">
                    {hour.precipProb.toFixed(0)}% rain
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}