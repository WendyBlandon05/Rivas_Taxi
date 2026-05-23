import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET all reviews (with optional filters)
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const driverId = searchParams.get("driver_id")
    const tripId = searchParams.get("trip_id")
    const limit = searchParams.get("limit")

    let query = supabase
      .from("reviews")
      .select(`
        *,
        reviewer:profiles(first_name, last_name, avatar_url),
        driver:drivers(
          id,
          vehicle_brand,
          vehicle_model,
          user:profiles(first_name, last_name)
        ),
        trip:trips(id, confirmation_code, origin, destination)
      `)
      .order("created_at", { ascending: false })

    if (driverId) {
      query = query.eq("driver_id", driverId)
    }

    if (tripId) {
      query = query.eq("trip_id", tripId)
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ reviews: data })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// CREATE a new review
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const reviewData = await request.json()

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        trip_id: reviewData.tripId || null,
        driver_id: reviewData.driverId || null,
        reviewer_id: user.id,
        rating: reviewData.rating,
        comment: reviewData.comment || null,
        is_driver_review: reviewData.isDriverReview ?? (!!reviewData.driverId)
      })
      .select(`
        *,
        reviewer:profiles(first_name, last_name, avatar_url)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      message: "Reseña creada exitosamente",
      review: data 
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
