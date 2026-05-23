import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET a single trip by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("trips")
      .select(`
        *,
        driver:drivers!driver_id(
          id,
          license_number,
          vehicle_brand,
          vehicle_model,
          vehicle_year,
          vehicle_plate,
          vehicle_color,
          status,
          rating,
          total_trips,
          profile:profiles!id(
            id,
            full_name,
            phone,
            avatar_url
          )
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ trip: data })
  } catch (error) {
    console.error("[v0] Error fetching trip:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// UPDATE a trip (cancel, update status, etc.)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const updates = await request.json()

    // Get the trip first to get driver info
    const { data: existingTrip } = await supabase
      .from("trips")
      .select("driver_id, status")
      .eq("id", id)
      .single()

    // If cancelling, add cancellation details
    if (updates.status === "cancelled") {
      updates.cancelled_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from("trips")
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select(`
        *,
        driver:drivers!driver_id(
          id,
          vehicle_brand,
          vehicle_model,
          vehicle_year,
          vehicle_plate,
          vehicle_color,
          rating,
          total_trips,
          profile:profiles!id(
            id,
            full_name,
            phone,
            avatar_url
          )
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // If trip was cancelled or completed, free up the driver
    if ((updates.status === "cancelled" || updates.status === "completed") && existingTrip?.driver_id) {
      await supabase
        .from("drivers")
        .update({ status: "available", updated_at: new Date().toISOString() })
        .eq("id", existingTrip.driver_id)

      // Increment completed trips if completed
      if (updates.status === "completed") {
        await supabase
          .from("drivers")
          .update({ 
            total_trips: (await supabase.from("drivers").select("total_trips").eq("id", existingTrip.driver_id).single()).data?.total_trips + 1 || 1
          })
          .eq("id", existingTrip.driver_id)
      }
    }

    return NextResponse.json({ 
      message: "Viaje actualizado exitosamente",
      trip: data 
    })
  } catch (error) {
    console.error("[v0] Error updating trip:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
