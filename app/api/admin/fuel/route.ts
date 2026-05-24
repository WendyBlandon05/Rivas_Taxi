import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

type FuelRecord = {
  id: string
  demo_driver_id: string
  date: string
  amount_usd: number | string
  gallons: number | string | null
  remaining_gallons: number | string | null
  price_per_gallon: number | string | null
  km_driven: number | string | null
  notes: string | null
}

type TripRecord = {
  driver_id: string | null
  scheduled_at: string | null
  created_at: string
  final_price: number | string | null
  estimated_price: number | string | null
}

function money(value: unknown) {
  const numberValue = Number(value || 0)
  return Number.isFinite(numberValue) ? numberValue : 0
}

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: "No autorizado" }, { status: 401 }) }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "Acceso denegado" }, { status: 403 }) }
  }

  return { error: null }
}

export async function GET(request: Request) {
  try {
    const { error } = await assertAdmin()
    if (error) return error

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const adminClient = createAdminClient()

    const { data: drivers } = await adminClient
      .from("drivers")
      .select("id")

    const driverIds = (drivers || []).map((driver) => driver.id)
    const { data: profiles } = driverIds.length > 0
      ? await adminClient
        .from("profiles")
        .select("id, full_name, email")
        .in("id", driverIds)
      : { data: [] }

    const profileMap = new Map((profiles || []).map((profile) => [profile.id, profile]))

    const driverMap = new Map<string, { name: string; email: string }>()
    for (const driver of drivers || []) {
      const profile = profileMap.get(driver.id)
      driverMap.set(driver.id, {
        name: profile?.full_name || "Sin nombre",
        email: profile?.email || ""
      })
    }

    let fuelQuery = adminClient
      .from("fuel_consumption")
      .select("*")
      .order("date", { ascending: false })

    if (startDate) fuelQuery = fuelQuery.gte("date", startDate)
    if (endDate) fuelQuery = fuelQuery.lte("date", endDate)

    const { data: fuelData, error: fuelError } = await fuelQuery
    if (fuelError) {
      return NextResponse.json({ error: fuelError.message }, { status: 500 })
    }

    let tripsQuery = adminClient
      .from("trips")
      .select("driver_id, scheduled_at, created_at, final_price, estimated_price")
      .eq("status", "completed")
      .not("driver_id", "is", null)

    if (startDate) tripsQuery = tripsQuery.gte("created_at", `${startDate}T00:00:00`)
    if (endDate) tripsQuery = tripsQuery.lte("created_at", `${endDate}T23:59:59`)

    const { data: tripsData, error: tripsError } = await tripsQuery
    if (tripsError) {
      return NextResponse.json({ error: tripsError.message }, { status: 500 })
    }

    const rows = new Map<string, {
      key: string
      driverId: string
      driverName: string
      driverEmail: string
      date: string
      fuelAmount: number
      gallons: number
      remainingGallons: number
      consumedGallons: number
      pricePerGallon: number
      kmDriven: number
      earnings: number
      completedTrips: number
      notes: string
    }>()

    function getRow(driverId: string, date: string) {
      const key = `${driverId}-${date}`
      const driver = driverMap.get(driverId)
      if (!rows.has(key)) {
        rows.set(key, {
          key,
          driverId,
          driverName: driver?.name || "Conductor eliminado",
          driverEmail: driver?.email || "",
          date,
          fuelAmount: 0,
          gallons: 0,
          remainingGallons: 0,
          consumedGallons: 0,
          pricePerGallon: 0,
          kmDriven: 0,
          earnings: 0,
          completedTrips: 0,
          notes: ""
        })
      }
      return rows.get(key)!
    }

    for (const record of (fuelData || []) as FuelRecord[]) {
      const row = getRow(record.demo_driver_id, record.date)
      const gallons = money(record.gallons)
      const remaining = money(record.remaining_gallons)
      row.fuelAmount += money(record.amount_usd)
      row.gallons += gallons
      row.remainingGallons += remaining
      row.consumedGallons += Math.max(gallons - remaining, 0)
      row.pricePerGallon = row.gallons > 0 ? row.fuelAmount / row.gallons : money(record.price_per_gallon)
      row.kmDriven += money(record.km_driven)
      row.notes = [row.notes, record.notes].filter(Boolean).join(" | ")
    }

    for (const trip of (tripsData || []) as TripRecord[]) {
      if (!trip.driver_id) continue
      const date = new Date(trip.scheduled_at || trip.created_at).toISOString().slice(0, 10)
      const row = getRow(trip.driver_id, date)
      row.earnings += money(trip.final_price || trip.estimated_price)
      row.completedTrips += 1
    }

    const records = Array.from(rows.values())
      .sort((a, b) => b.date.localeCompare(a.date) || a.driverName.localeCompare(b.driverName))
      .map((row) => ({
        ...row,
        fuelAmount: Number(row.fuelAmount.toFixed(2)),
        gallons: Number(row.gallons.toFixed(2)),
        remainingGallons: Number(row.remainingGallons.toFixed(2)),
        consumedGallons: Number(row.consumedGallons.toFixed(2)),
        pricePerGallon: Number(row.pricePerGallon.toFixed(2)),
        kmDriven: Number(row.kmDriven.toFixed(2)),
        earnings: Number(row.earnings.toFixed(2)),
        netIncome: Number((row.earnings - row.fuelAmount).toFixed(2))
      }))

    return NextResponse.json({
      records,
      summary: {
        totalFuel: Number(records.reduce((sum, row) => sum + row.fuelAmount, 0).toFixed(2)),
        totalEarnings: Number(records.reduce((sum, row) => sum + row.earnings, 0).toFixed(2)),
        totalNet: Number(records.reduce((sum, row) => sum + row.netIncome, 0).toFixed(2)),
        totalTrips: records.reduce((sum, row) => sum + row.completedTrips, 0)
      }
    })
  } catch (error) {
    console.error("Error fetching admin fuel report:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
