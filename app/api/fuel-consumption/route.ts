import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

function toNumber(value: unknown) {
  if (value === undefined || value === null || value === "") return null
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

async function getDriverUser() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { supabase, user: null, error: NextResponse.json({ error: "Debes iniciar sesion" }, { status: 401 }) }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || profile?.role !== "driver") {
    return { supabase, user, error: NextResponse.json({ error: "Solo conductores pueden registrar gasolina" }, { status: 403 }) }
  }

  return { supabase, user, error: null }
}

// GET fuel consumption records
export async function GET(request: Request) {
  const { supabase, user, error: authError } = await getDriverUser()
  if (authError || !user) return authError

  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")

  let query = supabase
    .from("fuel_consumption")
    .select("*")
    .eq("demo_driver_id", user.id)
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
  const records = data || []
  const totalAmount = records.reduce((sum, record) => sum + Number(record.amount_usd || 0), 0)
  const totalGallons = records.reduce((sum, record) => sum + Number(record.gallons || 0), 0)
  const totalRemainingGallons = records.reduce((sum, record) => sum + Number(record.remaining_gallons || 0), 0)
  const totalConsumedGallons = records.reduce((sum, record) => {
    const gallons = Number(record.gallons || 0)
    const remaining = Number(record.remaining_gallons || 0)
    return sum + Math.max(gallons - remaining, 0)
  }, 0)
  const totalKmDriven = records.reduce((sum, record) => {
    const kmDriven = Number(record.km_driven || 0)
    if (kmDriven) return sum + kmDriven

    const odometerStart = Number(record.odometer_start || 0)
    const odometerEnd = Number(record.odometer_end || 0)
    return odometerEnd > odometerStart ? sum + (odometerEnd - odometerStart) : sum
  }, 0)
  const averageKmPerGallon = totalConsumedGallons > 0 ? totalKmDriven / totalConsumedGallons : 0

  return NextResponse.json({
    records,
    summary: {
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalGallons: Math.round(totalGallons * 100) / 100,
      totalRemainingGallons: Math.round(totalRemainingGallons * 100) / 100,
      totalConsumedGallons: Math.round(totalConsumedGallons * 100) / 100,
      totalKmDriven: Math.round(totalKmDriven * 100) / 100,
      averageKmPerGallon: Math.round(averageKmPerGallon * 100) / 100,
      recordCount: records.length
    }
  })
}

// POST a new fuel consumption record
export async function POST(request: Request) {
  const { supabase, user, error: authError } = await getDriverUser()
  if (authError || !user) return authError

  const body = await request.json()
  
  const { date, amountUsd, gallons, remainingGallons, odometerStart, odometerEnd, notes } = body
  const amount = toNumber(amountUsd)
  const gallonsAdded = toNumber(gallons)
  const gallonsRemaining = toNumber(remainingGallons)
  const odometerStartValue = toNumber(odometerStart)
  const odometerEndValue = toNumber(odometerEnd)
  const pricePerGallon = amount && gallonsAdded && gallonsAdded > 0 ? amount / gallonsAdded : null
  const kmDriven = odometerStartValue !== null && odometerEndValue !== null && odometerEndValue >= odometerStartValue
    ? odometerEndValue - odometerStartValue
    : null

  if (!date || !amount || amount <= 0 || !gallonsAdded || gallonsAdded <= 0) {
    return NextResponse.json(
      { error: "La fecha, el monto y los galones cargados son obligatorios" },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from("fuel_consumption")
    .insert({
      demo_driver_id: user.id,
      date,
      amount_usd: amount,
      gallons: gallonsAdded,
      remaining_gallons: gallonsRemaining,
      price_per_gallon: pricePerGallon,
      odometer_start: odometerStartValue,
      odometer_end: odometerEndValue,
      km_driven: kmDriven,
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
  const { supabase, user, error: authError } = await getDriverUser()
  if (authError || !user) return authError

  const body = await request.json()
  
  const { id, amountUsd, gallons, remainingGallons, odometerStart, odometerEnd, notes } = body

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 })
  }

  const updateData: Record<string, unknown> = {}
  const amount = toNumber(amountUsd)
  const gallonsAdded = toNumber(gallons)
  const gallonsRemaining = toNumber(remainingGallons)
  const odometerStartValue = toNumber(odometerStart)
  const odometerEndValue = toNumber(odometerEnd)

  if (amountUsd !== undefined) updateData.amount_usd = amount
  if (gallons !== undefined) updateData.gallons = gallonsAdded
  if (remainingGallons !== undefined) updateData.remaining_gallons = gallonsRemaining
  if (odometerStart !== undefined) updateData.odometer_start = odometerStartValue
  if (odometerEnd !== undefined) updateData.odometer_end = odometerEndValue
  if (notes !== undefined) updateData.notes = notes
  if (amount && gallonsAdded && gallonsAdded > 0) updateData.price_per_gallon = amount / gallonsAdded
  if (odometerStartValue !== null && odometerEndValue !== null && odometerEndValue >= odometerStartValue) {
    updateData.km_driven = odometerEndValue - odometerStartValue
  }

  const { data, error } = await supabase
    .from("fuel_consumption")
    .update(updateData)
    .eq("id", id)
    .eq("demo_driver_id", user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
