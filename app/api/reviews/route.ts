import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

// GET all reviews (with optional filters)
export async function GET(request: Request) {
  try {
    const adminClient = createAdminClient()
    const { searchParams } = new URL(request.url)
    const driverId = searchParams.get("driver_id")
    const tripId = searchParams.get("trip_id")
    const limit = searchParams.get("limit")
    const minRating = Number(searchParams.get("min_rating") || 0)
    const serviceOnly = searchParams.get("service_only") === "true"

    let query = adminClient
      .from("reviews")
      .select(`
        *,
        reviewer:profiles(email, full_name, first_name, last_name, avatar_url),
        driver:drivers(
          id,
          vehicle_brand,
          vehicle_model,
          user:profiles(first_name, last_name)
        )
      `)
      .order("created_at", { ascending: false })

    if (driverId) {
      query = query.eq("driver_id", driverId)
    }

    if (tripId) {
      query = query.eq("trip_id", tripId)
    }

    if (serviceOnly) {
      query = query.eq("is_driver_review", false)
    }

    if (minRating > 0) {
      query = query.gte("rating", minRating)
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const { data, error } = await query

    if (error) {
      if (error.message?.includes("public.reviews") || error.message?.includes("schema cache")) {
        return NextResponse.json({ reviews: [] })
      }
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
    const rating = Number(reviewData.rating)
    const comment = typeof reviewData.comment === "string" ? reviewData.comment.trim() : ""

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "La calificacion debe estar entre 1 y 5" }, { status: 400 })
    }

    if (!comment) {
      return NextResponse.json({ error: "El comentario es requerido" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        trip_id: reviewData.tripId || null,
        driver_id: reviewData.driverId || null,
        reviewer_id: user.id,
        rating,
        comment,
        is_driver_review: reviewData.isDriverReview ?? (!!reviewData.driverId)
      })
      .select(`
        *,
        reviewer:profiles(email, full_name, first_name, last_name, avatar_url)
      `)
      .single()

    if (error) {
      if (error.message?.includes("public.reviews") || error.message?.includes("schema cache")) {
        return NextResponse.json(
          { error: "La tabla de resenas aun no existe. Ejecuta el script 008 en Supabase." },
          { status: 400 }
        )
      }
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
