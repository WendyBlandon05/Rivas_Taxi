import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const email = searchParams.get("email")

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  // Get trips with driver info
  const { data: trips, error } = await supabase
    .from("trips")
    .select(`
      *,
      demo_driver:demo_driver_id (
        id,
        first_name,
        last_name,
        phone,
        vehicle_brand,
        vehicle_model,
        vehicle_color,
        vehicle_plate,
        rating,
        total_trips,
        total_cancelled_trips
      )
    `)
    .eq("passenger_email", email)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching trips:", error)
    return NextResponse.json(
      { error: "Error fetching trips" },
      { status: 500 }
    )
  }

  return NextResponse.json({ trips })
}
