import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET fuel consumption records
export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const driverId = searchParams.get("driverId")
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")

  if (!driverId) {
    return NextResponse.json({ error: "driverId is required" }, { status: 400 })
  }

  let query = supabase
    .from("fuel_consumption")
    .select("*")
    .eq("demo_driver_id", driverId)
    .order("date", { ascending: false })

  if (startDate) {
    query = query.gte("date", startDate)
  }
  if (endDate) {
    query = query.lte("date", endDate)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Calculate totals
  const totalAmount = data?.reduce((sum, record) => sum + parseFloat(record.amount_usd), 0) || 0
  const totalGallons = data?.reduce((sum, record) => sum + (record.gallons ? parseFloat(record.gallons) : 0), 0) || 0

  return NextResponse.json({
    records: data,
    summary: {
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalGallons: Math.round(totalGallons * 100) / 100,
      recordCount: data?.length || 0
    }
  })
}

// POST a new fuel consumption record
export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  
  const { driverId, date, amountUsd, gallons, odometerStart, odometerEnd, notes } = body

  if (!driverId || !date || !amountUsd) {
    return NextResponse.json(
      { error: "driverId, date, and amountUsd are required" },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from("fuel_consumption")
    .insert({
      demo_driver_id: driverId,
      date,
      amount_usd: amountUsd,
      gallons: gallons || null,
      odometer_start: odometerStart || null,
      odometer_end: odometerEnd || null,
      notes: notes || null
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: "Ya existe un registro de gasolina para este dia" },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

// PUT update a fuel consumption record
export async function PUT(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  
  const { id, amountUsd, gallons, odometerStart, odometerEnd, notes } = body

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 })
  }

  const updateData: Record<string, unknown> = {}
  if (amountUsd !== undefined) updateData.amount_usd = amountUsd
  if (gallons !== undefined) updateData.gallons = gallons
  if (odometerStart !== undefined) updateData.odometer_start = odometerStart
  if (odometerEnd !== undefined) updateData.odometer_end = odometerEnd
  if (notes !== undefined) updateData.notes = notes

  const { data, error } = await supabase
    .from("fuel_consumption")
    .update(updateData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
