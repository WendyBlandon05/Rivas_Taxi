import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET all drivers (with optional filters)
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const verified = searchParams.get("verified")

    let query = supabase
      .from("drivers")
      .select(`
        *,
        user:profiles(first_name, last_name, phone, email, avatar_url)
      `)
      .order("rating", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    if (verified === "true") {
      query = query.eq("is_verified", true)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ drivers: data })
  } catch (error) {
    console.error("Error fetching drivers:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// CREATE a new driver profile
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const driverData = await request.json()

    // Update user role to driver
    await supabase
      .from("profiles")
      .update({ role: "driver" })
      .eq("id", user.id)

    const { data, error } = await supabase
      .from("drivers")
      .insert({
        user_id: user.id,
        license_number: driverData.licenseNumber,
        license_expiry: driverData.licenseExpiry,
        vehicle_brand: driverData.vehicleBrand,
        vehicle_model: driverData.vehicleModel,
        vehicle_year: driverData.vehicleYear,
        vehicle_color: driverData.vehicleColor,
        vehicle_plate: driverData.vehiclePlate,
        vehicle_photo_url: driverData.vehiclePhotoUrl,
        status: "offline",
        is_verified: false
      })
      .select(`
        *,
        user:profiles(first_name, last_name, phone, email)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      message: "Perfil de conductor creado exitosamente",
      driver: data 
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating driver:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
