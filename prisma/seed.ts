import { PrismaClient } from '@prisma/client'
import { FarmGenerator } from '../lib/utils/farm-generator'
import { LabelRuleSet, TankMixLine } from '../lib/types'
import { Decimal } from 'decimal.js'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  await prisma.sensorReading.deleteMany()
  await prisma.sensorDevice.deleteMany()
  await prisma.sprayApplicationEvent.deleteMany()
  await prisma.sprayJob.deleteMany()
  await prisma.tankMix.deleteMany()
  await prisma.inventoryLot.deleteMany()
  await prisma.chemicalProduct.deleteMany()
  await prisma.block.deleteMany()
  await prisma.farm.deleteMany()

  // Create farm
  const farmGen = new FarmGenerator(42)
  const generatedFarm = farmGen.generateFarm()

  const farm = await prisma.farm.create({
    data: {
      name: generatedFarm.name,
      timezone: 'Australia/Sydney',
    },
  })

  console.log(`✅ Created farm: ${farm.name}`)

  // Create blocks
  const blocks = await Promise.all(
    generatedFarm.blocks.map(block =>
      prisma.block.create({
        data: {
          farmId: farm.id,
          name: block.name,
          areaHa: new Decimal(block.areaHa),
          polygon: JSON.stringify(block.polygon),
        },
      })
    )
  )

  console.log(`✅ Created ${blocks.length} blocks`)

  // Create chemical products with label rules
  const products = [
    {
      name: 'GlyphoMax 540',
      formulation: 'SL',
      concentrationPct: 54.0,
      unit: 'L',
      densityKgPerL: 1.36,
      label: {
        maxWindKph: 20,
        disallowedWindDirDeg: [90, 91, 92, 93, 94, 95],
        bufferZones: [{ type: 'water', minDistanceM: 20 }],
        reentryHours: 4,
        preHarvestDays: 7,
        maxSeasonalGaiPerHa: 2160,
        temperatureRange: { minC: 10, maxC: 35 },
        relativeHumidityRange: { minPct: 30, maxPct: 85 },
      } as LabelRuleSet,
    },
    {
      name: 'Atrazine 900 WG',
      formulation: 'WG',
      concentrationPct: 90.0,
      unit: 'kg',
      densityKgPerL: null,
      label: {
        maxWindKph: 15,
        bufferZones: [
          { type: 'water', minDistanceM: 40 },
          { type: 'sensitive', minDistanceM: 100 },
        ],
        reentryHours: 12,
        preHarvestDays: 60,
        maxSeasonalGaiPerHa: 900,
        maxApplicationsPerSeason: 2,
        temperatureRange: { minC: 8, maxC: 30 },
      } as LabelRuleSet,
    },
    {
      name: 'MCPA 750',
      formulation: 'SL',
      concentrationPct: 75.0,
      unit: 'L',
      densityKgPerL: 1.40,
      label: {
        maxWindKph: 18,
        bufferZones: [{ type: 'water', minDistanceM: 15 }],
        reentryHours: 6,
        preHarvestDays: 7,
        maxSeasonalGaiPerHa: 1500,
        temperatureRange: { minC: 10, maxC: 28 },
      } as LabelRuleSet,
    },
    {
      name: 'Lontrel 300',
      formulation: 'SL',
      concentrationPct: 30.0,
      unit: 'L',
      densityKgPerL: 1.15,
      label: {
        maxWindKph: 22,
        bufferZones: [{ type: 'water', minDistanceM: 10 }],
        reentryHours: 4,
        preHarvestDays: 14,
        maxSeasonalGaiPerHa: 600,
        temperatureRange: { minC: 12, maxC: 30 },
      } as LabelRuleSet,
    },
    {
      name: 'Hasten Adjuvant',
      formulation: 'EC',
      concentrationPct: 100.0,
      unit: 'L',
      densityKgPerL: 0.92,
      label: {
        maxWindKph: 25,
        reentryHours: 2,
      } as LabelRuleSet,
    },
    {
      name: 'Urea 46%',
      formulation: 'SG',
      concentrationPct: 46.0,
      unit: 'kg',
      densityKgPerL: null,
      label: {
        maxWindKph: 30,
        temperatureRange: { minC: 5, maxC: 35 },
      } as LabelRuleSet,
    },
  ]

  const createdProducts = await Promise.all(
    products.map(p =>
      prisma.chemicalProduct.create({
        data: {
          name: p.name,
          formulation: p.formulation,
          concentrationPct: new Decimal(p.concentrationPct),
          unit: p.unit,
          densityKgPerL: p.densityKgPerL ? new Decimal(p.densityKgPerL) : null,
          label: JSON.stringify(p.label),
        },
      })
    )
  )

  console.log(`✅ Created ${createdProducts.length} chemical products`)

  // Create inventory lots
  const inventoryData = [
    { productName: 'GlyphoMax 540', batch: 'GL2024-001', openingQty: 200, unit: 'L' },
    { productName: 'GlyphoMax 540', batch: 'GL2024-002', openingQty: 150, unit: 'L' },
    { productName: 'Atrazine 900 WG', batch: 'AT2024-001', openingQty: 50, unit: 'kg' },
    { productName: 'MCPA 750', batch: 'MC2024-001', openingQty: 100, unit: 'L' },
    { productName: 'Lontrel 300', batch: 'LN2024-001', openingQty: 40, unit: 'L' },
    { productName: 'Hasten Adjuvant', batch: 'HA2024-001', openingQty: 20, unit: 'L' },
    { productName: 'Urea 46%', batch: 'UR2024-001', openingQty: 500, unit: 'kg' },
  ]

  const inventoryLots = await Promise.all(
    inventoryData.map(async inv => {
      const product = createdProducts.find(p => p.name === inv.productName)
      if (!product) throw new Error(`Product ${inv.productName} not found`)

      return prisma.inventoryLot.create({
        data: {
          productId: product.id,
          batch: inv.batch,
          openingQty: new Decimal(inv.openingQty),
          qtyUnit: inv.unit,
        },
      })
    })
  )

  console.log(`✅ Created ${inventoryLots.length} inventory lots`)

  // Create tank mixes
  const tankMixes = [
    {
      name: 'Broadleaf Knockdown',
      lines: [
        {
          productId: createdProducts.find(p => p.name === 'GlyphoMax 540')!.id,
          ratePerHa: 2.0,
          rateUnit: 'L/ha',
          isActiveIngredientRate: false,
        },
        {
          productId: createdProducts.find(p => p.name === 'MCPA 750')!.id,
          ratePerHa: 0.75,
          rateUnit: 'L/ha',
          isActiveIngredientRate: false,
        },
        {
          productId: createdProducts.find(p => p.name === 'Hasten Adjuvant')!.id,
          ratePerHa: 1.0,
          rateUnit: 'L/ha',
          isActiveIngredientRate: false,
        },
      ] as TankMixLine[],
      waterRatePerHaL: 100,
    },
    {
      name: 'Pre-emergent Mix',
      lines: [
        {
          productId: createdProducts.find(p => p.name === 'Atrazine 900 WG')!.id,
          ratePerHa: 1.1,
          rateUnit: 'kg/ha',
          isActiveIngredientRate: false,
        },
        {
          productId: createdProducts.find(p => p.name === 'Lontrel 300')!.id,
          ratePerHa: 150,
          rateUnit: 'g ai/ha',
          isActiveIngredientRate: true,
        },
      ] as TankMixLine[],
      waterRatePerHaL: 80,
    },
    {
      name: 'Foliar Nutrition',
      lines: [
        {
          productId: createdProducts.find(p => p.name === 'Urea 46%')!.id,
          ratePerHa: 10,
          rateUnit: 'kg/ha',
          isActiveIngredientRate: false,
        },
      ] as TankMixLine[],
      waterRatePerHaL: 200,
    },
  ]

  const createdTankMixes = await Promise.all(
    tankMixes.map(mix =>
      prisma.tankMix.create({
        data: {
          name: mix.name,
          lines: JSON.stringify(mix.lines),
          waterRatePerHaL: new Decimal(mix.waterRatePerHaL),
        },
      })
    )
  )

  console.log(`✅ Created ${createdTankMixes.length} tank mixes`)

  // Create sensor devices
  const sensorDevices = await Promise.all([
    prisma.sensorDevice.create({
      data: {
        id: 'WS001',
        blockId: blocks[0].id,
        type: 'wind',
        status: 'active',
        pose: JSON.stringify({ lat: -37.8136, lng: 144.9631 }),
        deployedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.sensorDevice.create({
      data: {
        id: 'WS002',
        blockId: blocks[5].id,
        type: 'humidity',
        status: 'active',
        pose: JSON.stringify({ lat: -37.8140, lng: 144.9635 }),
        deployedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.sensorDevice.create({
      data: {
        id: 'SM001',
        blockId: blocks[2].id,
        type: 'driftSampler',
        status: 'active',
        pose: JSON.stringify({ lat: -37.8145, lng: 144.9640 }),
        deployedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.sensorDevice.create({
      data: {
        id: 'SM002',
        blockId: blocks[8].id,
        type: 'nozzle',
        status: 'offline',
        pose: JSON.stringify({ lat: -37.8148, lng: 144.9645 }),
        deployedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      },
    }),
  ])

  console.log(`✅ Created ${sensorDevices.length} sensor devices`)

  // Generate sensor readings for the last 24 hours
  const now = new Date()
  const sensorReadings = []

  for (const sensor of sensorDevices) {
    // Only create readings for active sensors
    if (sensor.status !== 'active') continue

    for (let hoursAgo = 0; hoursAgo < 24; hoursAgo++) {
      const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000)

      if (sensor.type === 'wind') {
        sensorReadings.push({
          deviceId: sensor.id,
          ts: timestamp,
          payload: {
            windSpeed: 10 + Math.sin(hoursAgo / 2) * 5 + Math.random() * 3,
            windDirection: 180 + Math.sin(hoursAgo / 6) * 45,
            gusts: 15 + Math.sin(hoursAgo / 1.5) * 8 + Math.random() * 5,
          },
        })
      } else if (sensor.type === 'humidity') {
        sensorReadings.push({
          deviceId: sensor.id,
          ts: timestamp,
          payload: {
            humidity: 60 + Math.sin(hoursAgo / 4) * 15 + Math.random() * 5,
            temperature: 20 + Math.sin(hoursAgo / 3) * 5 + Math.random() * 2,
            dewPoint: 14 + Math.sin(hoursAgo / 5) * 3 + Math.random(),
          },
        })
      } else if (sensor.type === 'driftSampler') {
        sensorReadings.push({
          deviceId: sensor.id,
          ts: timestamp,
          payload: {
            particleCount: Math.floor(100 + Math.random() * 50),
            particleSize: 50 + Math.random() * 100, // microns
            driftPercentage: Math.random() * 5, // 0-5%
          },
        })
      } else if (sensor.type === 'nozzle') {
        sensorReadings.push({
          deviceId: sensor.id,
          ts: timestamp,
          payload: {
            flowRate: 1.2 + Math.random() * 0.3, // L/min
            pressure: 3.0 + Math.random() * 0.5, // bar
            dropletSize: 200 + Math.random() * 100, // microns
          },
        })
      }
    }
  }

  await prisma.sensorReading.createMany({
    data: sensorReadings.map(reading => ({
      ...reading,
      payload: JSON.stringify(reading.payload),
    })),
  })

  console.log(`✅ Created ${sensorReadings.length} sensor readings`)

  // Create spray jobs with varied states and dates
  const operators = ['John Smith', 'Sarah Johnson', 'Mike Brown', 'Emma Wilson']
  const sprayJobs = []

  // Historical completed jobs (last 90 days)
  for (let daysAgo = 1; daysAgo <= 90; daysAgo += 3 + Math.floor(Math.random() * 7)) {
    const jobDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    const block = blocks[Math.floor(Math.random() * blocks.length)]
    const tankMix = createdTankMixes[Math.floor(Math.random() * createdTankMixes.length)]
    const operator = operators[Math.floor(Math.random() * operators.length)]

    // Skip some days randomly (weather delays, etc)
    if (Math.random() < 0.2) continue

    const job = await prisma.sprayJob.create({
      data: {
        blockId: block.id,
        tankMixId: tankMix.id,
        operator,
        plannedStart: jobDate,
        plannedWindKph: new Decimal(5 + Math.random() * 10),
        plannedWindDirDeg: Math.floor(Math.random() * 360),
        plannedTempC: new Decimal(18 + Math.random() * 10),
        plannedRH: Math.floor(50 + Math.random() * 30),
        plannedBoomWidthM: new Decimal(24),
        plannedSpeedKph: new Decimal(10 + Math.random() * 5),
      },
    })

    sprayJobs.push(job)

    // Create application event for completed jobs
    await prisma.sprayApplicationEvent.create({
      data: {
        jobId: job.id,
        actualStart: jobDate,
        actualEnd: new Date(jobDate.getTime() + (2 + Math.random() * 4) * 60 * 60 * 1000),
        actualWindKph: new Decimal(5 + Math.random() * 10),
        actualWindDirDeg: Math.floor(Math.random() * 360),
        actualTempC: new Decimal(18 + Math.random() * 10),
        actualRH: Math.floor(50 + Math.random() * 30),
        areaTreatedHa: new Decimal(block.areaHa).mul(0.95 + Math.random() * 0.1),
        nozzleClass: ['Fine', 'Medium', 'Coarse', 'Very Coarse'][Math.floor(Math.random() * 4)],
        outcome: 'completed',
        notes: [
          'Good conditions throughout',
          'Slight wind increase in afternoon',
          'Completed without issues',
          'Minor calibration adjustment needed',
          'Excellent coverage achieved',
        ][Math.floor(Math.random() * 5)],
      },
    })
  }

  // Current/upcoming jobs
  for (let daysAhead = 0; daysAhead <= 7; daysAhead++) {
    if (Math.random() < 0.3) continue // Some days have no jobs

    const jobDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000)
    const block = blocks[Math.floor(Math.random() * blocks.length)]
    const tankMix = createdTankMixes[Math.floor(Math.random() * createdTankMixes.length)]
    const operator = operators[Math.floor(Math.random() * operators.length)]

    const job = await prisma.sprayJob.create({
      data: {
        blockId: block.id,
        tankMixId: tankMix.id,
        operator,
        plannedStart: jobDate,
        plannedWindKph: new Decimal(8 + Math.random() * 7),
        plannedWindDirDeg: Math.floor(Math.random() * 360),
        plannedTempC: new Decimal(20 + Math.random() * 8),
        plannedRH: Math.floor(55 + Math.random() * 25),
        plannedBoomWidthM: new Decimal(24),
        plannedSpeedKph: new Decimal(12 + Math.random() * 3),
      },
    })

    sprayJobs.push(job)

    // Add event for today's job as in-progress
    if (daysAhead === 0) {
      await prisma.sprayApplicationEvent.create({
        data: {
          jobId: job.id,
          actualStart: new Date(),
          actualEnd: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          actualWindKph: new Decimal(12),
          actualWindDirDeg: 180,
          actualTempC: new Decimal(22),
          actualRH: 65,
          areaTreatedHa: new Decimal(block.areaHa).mul(0.3), // 30% complete
          nozzleClass: 'Medium',
          outcome: 'completed',
          notes: 'In progress - good conditions',
        },
      })
    }
  }

  console.log(`✅ Created ${sprayJobs.length} spray jobs with varied states`)

  // Add more chemical products for diversity
  const additionalProducts = [
    {
      name: 'Prosaro 420 SC',
      formulation: 'SC',
      concentrationPct: 42.0,
      unit: 'L',
      densityKgPerL: 1.2,
      label: {
        maxWindKph: 15,
        bufferZones: [{ type: 'water', minDistanceM: 30 }],
        reentryHours: 8,
        preHarvestDays: 35,
        maxSeasonalGaiPerHa: 420,
        temperatureRange: { minC: 10, maxC: 28 },
      } as LabelRuleSet,
    },
    {
      name: 'Velocity',
      formulation: 'EC',
      concentrationPct: 10.0,
      unit: 'L',
      densityKgPerL: 0.95,
      label: {
        maxWindKph: 20,
        bufferZones: [{ type: 'sensitive', minDistanceM: 50 }],
        reentryHours: 6,
        preHarvestDays: 21,
        maxSeasonalGaiPerHa: 100,
        temperatureRange: { minC: 12, maxC: 30 },
      } as LabelRuleSet,
    },
    {
      name: 'Uptake Spraying Oil',
      formulation: 'EC',
      concentrationPct: 82.4,
      unit: 'L',
      densityKgPerL: 0.85,
      label: {
        maxWindKph: 25,
        reentryHours: 2,
      } as LabelRuleSet,
    },
    {
      name: 'Select 240 EC',
      formulation: 'EC',
      concentrationPct: 24.0,
      unit: 'L',
      densityKgPerL: 0.94,
      label: {
        maxWindKph: 18,
        bufferZones: [{ type: 'water', minDistanceM: 15 }],
        reentryHours: 4,
        preHarvestDays: 80,
        maxSeasonalGaiPerHa: 60,
        temperatureRange: { minC: 8, maxC: 32 },
      } as LabelRuleSet,
    },
  ]

  const moreProducts = await Promise.all(
    additionalProducts.map(p =>
      prisma.chemicalProduct.create({
        data: {
          name: p.name,
          formulation: p.formulation,
          concentrationPct: new Decimal(p.concentrationPct),
          unit: p.unit,
          densityKgPerL: p.densityKgPerL ? new Decimal(p.densityKgPerL) : null,
          label: JSON.stringify(p.label),
        },
      })
    )
  )

  console.log(`✅ Created ${moreProducts.length} additional chemical products`)

  // Add inventory for new products
  const additionalInventory = await Promise.all([
    prisma.inventoryLot.create({
      data: {
        productId: moreProducts[0].id,
        batch: 'PR2024-001',
        openingQty: new Decimal(30),
        qtyUnit: 'L',
      },
    }),
    prisma.inventoryLot.create({
      data: {
        productId: moreProducts[1].id,
        batch: 'VL2024-001',
        openingQty: new Decimal(25),
        qtyUnit: 'L',
      },
    }),
    prisma.inventoryLot.create({
      data: {
        productId: moreProducts[2].id,
        batch: 'UP2024-001',
        openingQty: new Decimal(60),
        qtyUnit: 'L',
      },
    }),
    prisma.inventoryLot.create({
      data: {
        productId: moreProducts[3].id,
        batch: 'SL2024-001',
        openingQty: new Decimal(15),
        qtyUnit: 'L',
      },
    }),
  ])

  console.log(`✅ Created ${additionalInventory.length} additional inventory lots`)

  console.log('✨ Database seeded successfully with comprehensive demo data!')
}

main()
  .catch(e => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })