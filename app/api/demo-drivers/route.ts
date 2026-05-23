import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET all available drivers
export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const nearLat = searchParams.get("lat")
  const nearLng = searchParams.get("lng")

  let query = supabase
    .from("demo_drivers")
    .select("*")
    .eq("is_verified", true)
    .order("rating", { ascending: false })

  if (status) {
    query = query.eq("status", status)
  }

  const { data: drivers, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // If coordinates provided, sort by distance
  if (nearLat && nearLng && drivers) {
    const lat = parseFloat(nearLat)
    const lng = parseFloat(nearLng)
    
    const driversWithDistance = drivers.map(driver => {
      const dLat = driver.current_latitude ? driver.current_latitude - lat : 0
      const dLng = driver.current_longitude ? driver.current_longitude - lng : 0
      const distance = Math.sqrt(dLat * dLat + dLng * dLng) * 111 // Approximate km
      return { ...driver, distance_km: Math.round(distance * 10) / 10 }
    }).sort((a, b) => a.distance_km - b.distance_km)

    return NextResponse.json(driversWithDistance)
  }

  return NextResponse.json(drivers)
}

// Update driver status
export async function PATCH(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  const { driverId, status, latitude, longitude, location } = body

  const updateData: Record<string, unknown> = {}
  if (status) updateData.status = status
  if (latitude) updateData.current_latitude = latitude
  if (longitude) updateData.current_longitude = longitude
  if (location) updateData.current_location = location
  updateData.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from("demo_drivers")
    .update(updateData)
    .eq("id", driverId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
