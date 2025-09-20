'use client'

import { useState } from 'react'
import { User, Building2, Bell, Shield, Wifi, Database, Globe, Palette, Key, Download, Upload, Save, AlertTriangle, ChevronRight, Toggle, Zap, MapPin, Gauge, Calculator } from 'lucide-react'

interface SettingSection {
  id: string
  title: string
  icon: React.ReactNode
  description: string
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('farm')
  const [unsavedChanges, setUnsavedChanges] = useState(false)

  // Settings state
  const [farmSettings, setFarmSettings] = useState({
    name: 'Riverside Farm',
    location: 'Victoria, Australia',
    timezone: 'Australia/Melbourne',
    units: 'metric',
    areaUnit: 'hectares',
    sprayRateUnit: 'L/ha',
    currency: 'AUD',
    fiscalYearStart: 'July'
  })

  const [operatorSettings, setOperatorSettings] = useState({
    defaultOperator: 'John Smith',
    requireSignoff: true,
    trackHours: true,
    certificationAlerts: true,
    operators: [
      { name: 'John Smith', license: 'ACUP-12345', expiry: '2025-12-31' },
      { name: 'Sarah Johnson', license: 'ACUP-67890', expiry: '2025-06-30' },
      { name: 'Mike Brown', license: 'ACUP-11111', expiry: '2024-09-30' }
    ]
  })

  const [notificationSettings, setNotificationSettings] = useState({
    weatherAlerts: true,
    driftWarnings: true,
    inventoryLow: true,
    complianceDeadlines: true,
    sensorOffline: true,
    emailNotifications: false,
    smsNotifications: false,
    pushNotifications: true,
    alertThresholds: {
      windSpeed: 20,
      temperature: 30,
      humidity: 30,
      batteryLevel: 20
    }
  })

  const [complianceSettings, setComplianceSettings] = useState({
    jurisdiction: 'Victoria',
    exportMarkets: ['USA', 'EU', 'Japan', 'China'],
    recordRetention: 7,
    auditTrail: true,
    digitalSignatures: true,
    autoReporting: false,
    bufferZones: {
      waterways: 20,
      sensitive: 50,
      residential: 100
    }
  })

  const [integrationSettings, setIntegrationSettings] = useState({
    weatherAPI: 'BOM',
    weatherAPIKey: '••••••••••••••••',
    farmManagement: 'None',
    accountingSystem: 'None',
    telematicsProvider: 'None',
    webhookURL: '',
    dataSync: 'realtime'
  })

  const [sensorSettings, setSensorSettings] = useState({
    updateInterval: 5,
    dataRetention: 90,
    alertDelay: 10,
    calibrationReminder: 180,
    networkProtocol: 'LoRaWAN',
    gateway: '192.168.1.100',
    encryption: true
  })

  const [applicationSettings, setApplicationSettings] = useState({
    defaultNozzle: 'TeeJet AIXR 11003',
    defaultPressure: 3.0,
    defaultSpeed: 12,
    defaultHeight: 0.5,
    waterVolume: 100,
    bufferMargin: 1.2,
    driftModel: 'AGDISP',
    weatherSource: 'sensor'
  })

  const sections: SettingSection[] = [
    {
      id: 'farm',
      title: 'Farm Details',
      icon: <Building2 className="w-5 h-5" />,
      description: 'Basic farm information and preferences'
    },
    {
      id: 'operators',
      title: 'Operators',
      icon: <User className="w-5 h-5" />,
      description: 'Manage operator profiles and certifications'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      description: 'Alert preferences and thresholds'
    },
    {
      id: 'compliance',
      title: 'Compliance',
      icon: <Shield className="w-5 h-5" />,
      description: 'Regulatory settings and requirements'
    },
    {
      id: 'integrations',
      title: 'Integrations',
      icon: <Wifi className="w-5 h-5" />,
      description: 'External systems and APIs'
    },
    {
      id: 'sensors',
      title: 'Sensor Network',
      icon: <Zap className="w-5 h-5" />,
      description: 'IoT device configuration'
    },
    {
      id: 'application',
      title: 'Application Defaults',
      icon: <Gauge className="w-5 h-5" />,
      description: 'Spray application parameters'
    },
    {
      id: 'data',
      title: 'Data Management',
      icon: <Database className="w-5 h-5" />,
      description: 'Backup and data retention'
    }
  ]

  const handleSave = () => {
    // Mock save
    setUnsavedChanges(false)
    alert('Settings saved successfully!')
  }

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'farm':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Farm Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Farm Name</label>
                <input
                  type="text"
                  value={farmSettings.name}
                  onChange={(e) => {
                    setFarmSettings({ ...farmSettings, name: e.target.value })
                    setUnsavedChanges(true)
                  }}
                  className="w-full px-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  value={farmSettings.location}
                  onChange={(e) => {
                    setFarmSettings({ ...farmSettings, location: e.target.value })
                    setUnsavedChanges(true)
                  }}
                  className="w-full px-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Timezone</label>
                <select
                  value={farmSettings.timezone}
                  onChange={(e) => {
                    setFarmSettings({ ...farmSettings, timezone: e.target.value })
                    setUnsavedChanges(true)
                  }}
                  className="w-full px-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg"
                >
                  <option value="Australia/Melbourne">Australia/Melbourne</option>
                  <option value="Australia/Sydney">Australia/Sydney</option>
                  <option value="Australia/Brisbane">Australia/Brisbane</option>
                  <option value="Australia/Perth">Australia/Perth</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Unit System</label>
                <select
                  value={farmSettings.units}
                  onChange={(e) => {
                    setFarmSettings({ ...farmSettings, units: e.target.value })
                    setUnsavedChanges(true)
                  }}
                  className="w-full px-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg"
                >
                  <option value="metric">Metric</option>
                  <option value="imperial">Imperial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Area Units</label>
                <select
                  value={farmSettings.areaUnit}
                  onChange={(e) => {
                    setFarmSettings({ ...farmSettings, areaUnit: e.target.value })
                    setUnsavedChanges(true)
                  }}
                  className="w-full px-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg"
                >
                  <option value="hectares">Hectares</option>
                  <option value="acres">Acres</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Spray Rate Units</label>
                <select
                  value={farmSettings.sprayRateUnit}
                  onChange={(e) => {
                    setFarmSettings({ ...farmSettings, sprayRateUnit: e.target.value })
                    setUnsavedChanges(true)
                  }}
                  className="w-full px-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg"
                >
                  <option value="L/ha">L/ha</option>
                  <option value="gal/ac">gal/ac</option>
                  <option value="mL/m2">mL/m²</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Currency</label>
                <select
                  value={farmSettings.currency}
                  onChange={(e) => {
                    setFarmSettings({ ...farmSettings, currency: e.target.value })
                    setUnsavedChanges(true)
                  }}
                  className="w-full px-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg"
                >
                  <option value="AUD">AUD - Australian Dollar</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Fiscal Year Start</label>
                <select
                  value={farmSettings.fiscalYearStart}
                  onChange={(e) => {
                    setFarmSettings({ ...farmSettings, fiscalYearStart: e.target.value })
                    setUnsavedChanges(true)
                  }}
                  className="w-full px-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg"
                >
                  <option value="January">January</option>
                  <option value="April">April</option>
                  <option value="July">July</option>
                  <option value="October">October</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 'operators':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Operator Management</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[var(--secondary)] rounded-lg">
                <div>
                  <p className="font-medium">Require Job Sign-off</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Operators must digitally sign completed jobs
                  </p>
                </div>
                <button
                  onClick={() => {
                    setOperatorSettings({ ...operatorSettings, requireSignoff: !operatorSettings.requireSignoff })
                    setUnsavedChanges(true)
                  }}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    operatorSettings.requireSignoff ? 'bg-blue-500' : 'bg-gray-500'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    operatorSettings.requireSignoff ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[var(--secondary)] rounded-lg">
                <div>
                  <p className="font-medium">Track Operator Hours</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Record time spent on each job
                  </p>
                </div>
                <button
                  onClick={() => {
                    setOperatorSettings({ ...operatorSettings, trackHours: !operatorSettings.trackHours })
                    setUnsavedChanges(true)
                  }}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    operatorSettings.trackHours ? 'bg-blue-500' : 'bg-gray-500'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    operatorSettings.trackHours ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Registered Operators</h3>
              <div className="space-y-3">
                {operatorSettings.operators.map((op, i) => (
                  <div key={i} className="p-4 bg-[var(--secondary)] rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{op.name}</p>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          License: {op.license}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Expires: {op.expiry}</p>
                        {new Date(op.expiry) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) && (
                          <span className="text-xs text-orange-500">Expiring soon</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Notification Settings</h2>

            <div>
              <h3 className="text-lg font-medium mb-3">Alert Types</h3>
              <div className="space-y-3">
                {[
                  { key: 'weatherAlerts', label: 'Weather Alerts', desc: 'Severe weather warnings' },
                  { key: 'driftWarnings', label: 'Drift Warnings', desc: 'High drift risk conditions' },
                  { key: 'inventoryLow', label: 'Low Inventory', desc: 'Stock below minimum levels' },
                  { key: 'complianceDeadlines', label: 'Compliance Deadlines', desc: 'Upcoming regulatory requirements' },
                  { key: 'sensorOffline', label: 'Sensor Offline', desc: 'Device connectivity issues' }
                ].map(setting => (
                  <div key={setting.key} className="flex items-center justify-between p-3 bg-[var(--secondary)] rounded-lg">
                    <div>
                      <p className="font-medium">{setting.label}</p>
                      <p className="text-sm text-[var(--muted-foreground)]">{setting.desc}</p>
                    </div>
                    <button
                      onClick={() => {
                        setNotificationSettings({
                          ...notificationSettings,
                          [setting.key]: !notificationSettings[setting.key as keyof typeof notificationSettings]
                        })
                        setUnsavedChanges(true)
                      }}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        notificationSettings[setting.key as keyof typeof notificationSettings] ? 'bg-blue-500' : 'bg-gray-500'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        notificationSettings[setting.key as keyof typeof notificationSettings] ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Delivery Methods</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-[var(--secondary)] rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Push</span>
                    <button
                      onClick={() => {
                        setNotificationSettings({ ...notificationSettings, pushNotifications: !notificationSettings.pushNotifications })
                        setUnsavedChanges(true)
                      }}
                      className={`w-10 h-5 rounded-full transition-colors ${
                        notificationSettings.pushNotifications ? 'bg-blue-500' : 'bg-gray-500'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        notificationSettings.pushNotifications ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-[var(--secondary)] rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Email</span>
                    <button
                      onClick={() => {
                        setNotificationSettings({ ...notificationSettings, emailNotifications: !notificationSettings.emailNotifications })
                        setUnsavedChanges(true)
                      }}
                      className={`w-10 h-5 rounded-full transition-colors ${
                        notificationSettings.emailNotifications ? 'bg-blue-500' : 'bg-gray-500'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        notificationSettings.emailNotifications ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-[var(--secondary)] rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">SMS</span>
                    <button
                      onClick={() => {
                        setNotificationSettings({ ...notificationSettings, smsNotifications: !notificationSettings.smsNotifications })
                        setUnsavedChanges(true)
                      }}
                      className={`w-10 h-5 rounded-full transition-colors ${
                        notificationSettings.smsNotifications ? 'bg-blue-500' : 'bg-gray-500'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        notificationSettings.smsNotifications ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Alert Thresholds</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Wind Speed (km/h)</label>
                  <input
                    type="number"
                    value={notificationSettings.alertThresholds.windSpeed}
                    onChange={(e) => {
                      setNotificationSettings({
                        ...notificationSettings,
                        alertThresholds: {
                          ...notificationSettings.alertThresholds,
                          windSpeed: parseInt(e.target.value)
                        }
                      })
                      setUnsavedChanges(true)
                    }}
                    className="w-full px-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Temperature (°C)</label>
                  <input
                    type="number"
                    value={notificationSettings.alertThresholds.temperature}
                    onChange={(e) => {
                      setNotificationSettings({
                        ...notificationSettings,
                        alertThresholds: {
                          ...notificationSettings.alertThresholds,
                          temperature: parseInt(e.target.value)
                        }
                      })
                      setUnsavedChanges(true)
                    }}
                    className="w-full px-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Min Humidity (%)</label>
                  <input
                    type="number"
                    value={notificationSettings.alertThresholds.humidity}
                    onChange={(e) => {
                      setNotificationSettings({
                        ...notificationSettings,
                        alertThresholds: {
                          ...notificationSettings.alertThresholds,
                          humidity: parseInt(e.target.value)
                        }
                      })
                      setUnsavedChanges(true)
                    }}
                    className="w-full px-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Battery Level (%)</label>
                  <input
                    type="number"
                    value={notificationSettings.alertThresholds.batteryLevel}
                    onChange={(e) => {
                      setNotificationSettings({
                        ...notificationSettings,
                        alertThresholds: {
                          ...notificationSettings.alertThresholds,
                          batteryLevel: parseInt(e.target.value)
                        }
                      })
                      setUnsavedChanges(true)
                    }}
                    className="w-full px-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 'compliance':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Compliance Settings</h2>

            <div>
              <label className="block text-sm font-medium mb-2">Primary Jurisdiction</label>
              <select
                value={complianceSettings.jurisdiction}
                onChange={(e) => {
                  setComplianceSettings({ ...complianceSettings, jurisdiction: e.target.value })
                  setUnsavedChanges(true)
                }}
                className="w-full px-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg"
              >
                <option value="Victoria">Victoria, Australia</option>
                <option value="NSW">New South Wales, Australia</option>
                <option value="Queensland">Queensland, Australia</option>
                <option value="WA">Western Australia</option>
              </select>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Export Markets</h3>
              <div className="flex flex-wrap gap-2">
                {['USA', 'EU', 'Japan', 'China', 'Korea', 'India'].map(market => (
                  <button
                    key={market}
                    onClick={() => {
                      const markets = complianceSettings.exportMarkets.includes(market)
                        ? complianceSettings.exportMarkets.filter(m => m !== market)
                        : [...complianceSettings.exportMarkets, market]
                      setComplianceSettings({ ...complianceSettings, exportMarkets: markets })
                      setUnsavedChanges(true)
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      complianceSettings.exportMarkets.includes(market)
                        ? 'bg-blue-500 text-white'
                        : 'bg-[var(--secondary)]'
                    }`}
                  >
                    {market}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Buffer Zones</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Waterways (m)</label>
                  <input
                    type="number"
                    value={complianceSettings.bufferZones.waterways}
                    onChange={(e) => {
                      setComplianceSettings({
                        ...complianceSettings,
                        bufferZones: {
                          ...complianceSettings.bufferZones,
                          waterways: parseInt(e.target.value)
                        }
                      })
                      setUnsavedChanges(true)
                    }}
                    className="w-full px-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Sensitive Areas (m)</label>
                  <input
                    type="number"
                    value={complianceSettings.bufferZones.sensitive}
                    onChange={(e) => {
                      setComplianceSettings({
                        ...complianceSettings,
                        bufferZones: {
                          ...complianceSettings.bufferZones,
                          sensitive: parseInt(e.target.value)
                        }
                      })
                      setUnsavedChanges(true)
                    }}
                    className="w-full px-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Residential (m)</label>
                  <input
                    type="number"
                    value={complianceSettings.bufferZones.residential}
                    onChange={(e) => {
                      setComplianceSettings({
                        ...complianceSettings,
                        bufferZones: {
                          ...complianceSettings.bufferZones,
                          residential: parseInt(e.target.value)
                        }
                      })
                      setUnsavedChanges(true)
                    }}
                    className="w-full px-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Record Retention (years)</label>
              <input
                type="number"
                value={complianceSettings.recordRetention}
                onChange={(e) => {
                  setComplianceSettings({ ...complianceSettings, recordRetention: parseInt(e.target.value) })
                  setUnsavedChanges(true)
                }}
                className="w-full max-w-xs px-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg"
              />
            </div>
          </div>
        )

      case 'application':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Application Defaults</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Default Nozzle Type</label>
                <select
                  value={applicationSettings.defaultNozzle}
                  onChange={(e) => {
                    setApplicationSettings({ ...applicationSettings, defaultNozzle: e.target.value })
                    setUnsavedChanges(true)
                  }}
                  className="w-full px-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg"
                >
                  <option value="TeeJet AIXR 11003">TeeJet AIXR 11003 (Coarse)</option>
                  <option value="TeeJet XR 11003">TeeJet XR 11003 (Fine)</option>
                  <option value="Hypro Guardian AIR">Hypro Guardian AIR (Very Coarse)</option>
                  <option value="Lechler IDK">Lechler IDK (Medium)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Default Pressure (bar)</label>
                <input
                  type="number"
                  step="0.1"
                  value={applicationSettings.defaultPressure}
                  onChange={(e) => {
                    setApplicationSettings({ ...applicationSettings, defaultPressure: parseFloat(e.target.value) })
                    setUnsavedChanges(true)
                  }}
                  className="w-full px-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Default Speed (km/h)</label>
                <input
                  type="number"
                  value={applicationSettings.defaultSpeed}
                  onChange={(e) => {
                    setApplicationSettings({ ...applicationSettings, defaultSpeed: parseInt(e.target.value) })
                    setUnsavedChanges(true)
                  }}
                  className="w-full px-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Boom Height (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={applicationSettings.defaultHeight}
                  onChange={(e) => {
                    setApplicationSettings({ ...applicationSettings, defaultHeight: parseFloat(e.target.value) })
                    setUnsavedChanges(true)
                  }}
                  className="w-full px-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Water Volume (L/ha)</label>
                <input
                  type="number"
                  value={applicationSettings.waterVolume}
                  onChange={(e) => {
                    setApplicationSettings({ ...applicationSettings, waterVolume: parseInt(e.target.value) })
                    setUnsavedChanges(true)
                  }}
                  className="w-full px-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Safety Buffer Margin</label>
                <input
                  type="number"
                  step="0.1"
                  value={applicationSettings.bufferMargin}
                  onChange={(e) => {
                    setApplicationSettings({ ...applicationSettings, bufferMargin: parseFloat(e.target.value) })
                    setUnsavedChanges(true)
                  }}
                  className="w-full px-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Drift Model</label>
                <select
                  value={applicationSettings.driftModel}
                  onChange={(e) => {
                    setApplicationSettings({ ...applicationSettings, driftModel: e.target.value })
                    setUnsavedChanges(true)
                  }}
                  className="w-full px-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg"
                >
                  <option value="AGDISP">AGDISP</option>
                  <option value="DRIFTSAFE">DRIFTSAFE</option>
                  <option value="Simple">Simple Model</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Weather Source</label>
                <select
                  value={applicationSettings.weatherSource}
                  onChange={(e) => {
                    setApplicationSettings({ ...applicationSettings, weatherSource: e.target.value })
                    setUnsavedChanges(true)
                  }}
                  className="w-full px-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg"
                >
                  <option value="sensor">Field Sensors</option>
                  <option value="station">Weather Station</option>
                  <option value="forecast">Forecast Data</option>
                </select>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Calculator className="w-12 h-12 mx-auto mb-3 text-[var(--muted-foreground)]" />
              <p className="text-[var(--muted-foreground)]">
                Section under development
              </p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-[var(--muted-foreground)]">
          Configure your SprayMate system preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)]">
            <div className="p-4">
              <h2 className="font-semibold mb-4">Configuration</h2>
              <nav className="space-y-1">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                      activeSection === section.id
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-[var(--secondary)]'
                    }`}
                  >
                    {section.icon}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{section.title}</p>
                      {activeSection === section.id && (
                        <p className="text-xs opacity-90">{section.description}</p>
                      )}
                    </div>
                    {activeSection === section.id && (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="border-t border-[var(--border)] p-4 space-y-2">
              <button className="w-full flex items-center gap-2 px-3 py-2 bg-[var(--secondary)] rounded-lg hover:bg-[var(--muted)] transition-colors">
                <Download className="w-4 h-4" />
                <span className="text-sm">Export Settings</span>
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 bg-[var(--secondary)] rounded-lg hover:bg-[var(--muted)] transition-colors">
                <Upload className="w-4 h-4" />
                <span className="text-sm">Import Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)]">
            {renderSectionContent()}

            {/* Save Bar */}
            {unsavedChanges && (
              <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-500 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <span>You have unsaved changes</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUnsavedChanges(false)}
                    className="px-4 py-2 bg-[var(--secondary)] rounded-lg hover:bg-[var(--muted)] transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}