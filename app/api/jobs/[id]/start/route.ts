import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { startJobSchema } from '@/lib/validations'
import { LabelGuard, type SprayConditions } from '@/lib/services/label-guard'
import { z } from 'zod'
import { Decimal } from 'decimal.js'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await req.json()
    const validated = startJobSchema.parse(body)

    // Fetch the job with related data
    const job = await prisma.sprayJob.findUnique({
      where: { id },
      include: {
        block: true,
        mix: true,
      },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Get tank mix lines
    const tankMixLines = JSON.parse(job.mix.lines) as Array<{
      productId: string
      ratePerHa: number
      rateUnit: string
      isActiveIngredientRate: boolean
    }>

    // Get products and their labels
    const products = await prisma.chemicalProduct.findMany({
      where: {
        id: { in: tankMixLines.map(l => l.productId) },
      },
    })

    // Combine label rules
    const productLabels = products.map(p => ({
      productName: p.name,
      label: JSON.parse(p.label),
    }))

    const combinedRules = LabelGuard.combineLabelRules(productLabels)

    // Check current seasonal AI for this block
    const currentSeason = new Date().getFullYear().toString()
    const seasonalAI = await prisma.seasonalActiveIngredient.findMany({
      where: {
        blockId: job.blockId,
        season: currentSeason,
      },
    })

    const totalSeasonalAI = seasonalAI.reduce(
      (sum, record) => sum.add(record.aiGrams),
      new Decimal(0)
    )

    // Prepare spray conditions
    const conditions: SprayConditions = {
      windKph: validated.actualWindKph,
      windDirDeg: validated.actualWindDirDeg,
      tempC: validated.actualTempC,
      rhPct: validated.actualRH,
      plannedStart: job.plannedStart,
      blockId: job.blockId,
      seasonalAIApplied: totalSeasonalAI.toNumber(),
    }

    // Check rules
    const ruleCheck = LabelGuard.checkRules(combinedRules, conditions)

    if (!ruleCheck.passes) {
      return NextResponse.json(
        {
          ok: false,
          violations: ruleCheck.violations,
          remediations: LabelGuard.generateRemediation(ruleCheck.violations),
        },
        { status: 400 }
      )
    }

    // Create spray application event
    const event = await prisma.sprayApplicationEvent.create({
      data: {
        jobId: job.id,
        actualStart: new Date(),
        actualEnd: new Date(), // Will be updated when job completes
        actualWindKph: validated.actualWindKph,
        actualWindDirDeg: validated.actualWindDirDeg,
        actualTempC: validated.actualTempC,
        actualRH: validated.actualRH,
        areaTreatedHa: new Decimal(job.block.areaHa).toNumber(),
        nozzleClass: 'Medium', // Default
        outcome: 'completed',
      },
    })

    return NextResponse.json({
      ok: true,
      eventId: event.id,
      message: 'Job started successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error starting job:', error)
    return NextResponse.json(
      { error: 'Failed to start job' },
      { status: 500 }
    )
  }
}