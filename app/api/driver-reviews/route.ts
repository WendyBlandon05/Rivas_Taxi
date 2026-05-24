import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

// GET reviews for a driver
export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const driverId = searchParams.get("driverId")

  if (!driverId) {
    // Get all reviews with driver info
    const { data, error } = await supabase
      .from("driver_reviews")
      .select(`
        *,
        driver:drivers!driver_id(
          id,
          rating,
          profile:profiles(
            full_name
          )
        )
      `)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  }

  const { data, error } = await supabase
    .from("driver_reviews")
    .select("*")
    .eq("driver_id", driverId)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST a new review
export async function POST(request: Request) {
  const supabase = await createClient()
  const adminClient = createAdminClient()
  const body = await request.json()
  
  const { driverId, tripId, rating, comment } = body

  if (!driverId || !tripId || !rating) {
    return NextResponse.json(
      { error: "driverId, tripId y rating son requeridos" },
      { status: 400 }
    )
  }

  const numericRating = Number(rating)
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return NextResponse.json(
      { error: "La calificacion debe estar entre 1 y 5" },
      { status: 400 }
    )
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesion para calificar un viaje" }, { status: 401 })
  }

  const { data: trip, error: tripError } = await adminClient
    .from("trips")
    .select("id, passenger_id, driver_id, status")
    .eq("id", tripId)
    .single()

  if (tripError || !trip) {
    return NextResponse.json({ error: "Viaje no encontrado" }, { status: 404 })
  }

  if (trip.passenger_id !== user.id) {
    return NextResponse.json({ error: "No puedes calificar un viaje de otra cuenta" }, { status: 403 })
  }

  if (trip.driver_id !== driverId) {
    return NextResponse.json({ error: "El conductor no corresponde a este viaje" }, { status: 400 })
  }

  if (trip.status !== "completed") {
    return NextResponse.json({ error: "Solo puedes calificar viajes completados" }, { status: 400 })
  }

  const { data: profile } = await adminClient
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single()

  const passengerName = profile?.full_name || user.email?.split("@")[0] || "Pasajero"
  const passengerEmail = profile?.email || user.email || null
  const cleanComment = typeof comment === "string" ? comment.trim() : ""

  const { data: existingReview } = await adminClient
    .from("driver_reviews")
    .select("id")
    .eq("trip_id", tripId)
    .eq("driver_id", driverId)
    .maybeSingle()

  const reviewPayload = {
    driver_id: driverId,
    trip_id: tripId,
    passenger_name: passengerName,
    passenger_email: passengerEmail,
    rating: numericRating,
    comment: cleanComment || null,
  }
  const legacyReviewPayload = {
    driver_id: driverId,
    trip_id: tripId,
    passenger_name: passengerName,
    rating: numericRating,
    comment: cleanComment || null,
  }

  const saveReview = (payload: typeof reviewPayload | typeof legacyReviewPayload) => {
    return existingReview
      ? adminClient
        .from("driver_reviews")
        .update(payload)
        .eq("id", existingReview.id)
        .select()
        .single()
      : adminClient
        .from("driver_reviews")
        .insert(payload)
        .select()
        .single()
  }

  let { data, error } = await saveReview(reviewPayload)

  if (error?.message?.includes("passenger_email")) {
    const retry = await saveReview(legacyReviewPayload)
    data = retry.data
    error = retry.error
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update driver's average rating
  const { data: reviews } = await adminClient
    .from("driver_reviews")
    .select("rating")
    .eq("driver_id", driverId)

  if (reviews && reviews.length > 0) {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    await adminClient
      .from("drivers")
      .update({ rating: parseFloat(avgRating.toFixed(2)) })
      .eq("id", driverId)
  }

  return NextResponse.json(data, { status: existingReview ? 200 : 201 })
}
