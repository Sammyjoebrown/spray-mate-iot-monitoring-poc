import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createJobSchema } from '@/lib/validations'
import { z } from 'zod'

export async function GET() {
  try {
    const jobs = await prisma.sprayJob.findMany({
      include: {
        block: true,
        mix: true,
        applicationEvents: true,
      },
      orderBy: {
        plannedStart: 'desc',
      },
    })

    return NextResponse.json(jobs)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = createJobSchema.parse(body)

    const job = await prisma.sprayJob.create({
      data: {
        blockId: validated.blockId,
        tankMixId: validated.tankMixId,
        operator: validated.operator,
        plannedStart: new Date(validated.plannedStart),
        plannedWindKph: validated.plannedWindKph,
        plannedWindDirDeg: validated.plannedWindDirDeg,
        plannedTempC: validated.plannedTempC,
        plannedRH: validated.plannedRH,
        plannedBoomWidthM: validated.plannedBoomWidthM,
        plannedSpeedKph: validated.plannedSpeedKph,
      },
      include: {
        block: true,
        mix: true,
      },
    })

    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating job:', error)
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    )
  }
}