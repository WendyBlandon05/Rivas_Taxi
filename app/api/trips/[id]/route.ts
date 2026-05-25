import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

function generateConfirmationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = "PCT-"
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

type DriverCandidate = {
  id: string
  rating: number | null
  total_trips: number | null
}

type ScheduledTrip = {
  driver_id: string | null
  scheduled_at: string | null
  scheduled_end_at: string | null
  estimated_duration_minutes: number | null
}

async function findReplacementDriver(
  adminClient: ReturnType<typeof createAdminClient>,
  currentDriverId: string | null,
  scheduledAt: string | null,
  scheduledEndAt: string | null,
) {
  const { data: drivers, error: driversError } = await adminClient
    .from("drivers")
    .select("id, rating, total_trips")
    .eq("is_active", true)
    .neq("status", "offline")
    .order("rating", { ascending: false })
    .order("total_trips", { ascending: true })

  if (driversError) {
    console.error("[v0] Error finding replacement drivers:", driversError)
    return null
  }

  const candidates = ((drivers || []) as DriverCandidate[]).filter((driver) => driver.id !== currentDriverId)
  if (candidates.length === 0) return null

  if (!scheduledAt || !scheduledEndAt) {
    return candidates[0].id
  }

  const candidateIds = candidates.map((driver) => driver.id)
  const { data: scheduledTrips, error: tripsError } = await adminClient
    .from("trips")
    .select("driver_id, scheduled_at, scheduled_end_at, estimated_duration_minutes")
    .in("driver_id", candidateIds)
    .in("status", ["pending", "confirmed", "in_progress"])
    .not("scheduled_at", "is", null)

  if (tripsError) {
    console.error("[v0] Error checking replacement driver schedule:", tripsError)
    return candidates[0].id
  }

  const requestedStart = new Date(scheduledAt).getTime()
  const requestedEnd = new Date(scheduledEndAt).getTime()
  const trips = (scheduledTrips || []) as ScheduledTrip[]

  for (const driver of candidates) {
    const hasConflict = trips.some((trip) => {
      if (trip.driver_id !== driver.id || !trip.scheduled_at) return false

      const tripStart = new Date(trip.scheduled_at).getTime()
      const tripEnd = trip.scheduled_end_at
        ? new Date(trip.scheduled_end_at).getTime()
        : tripStart + (trip.estimated_duration_minutes || 60) * 60_000

      return requestedStart < tripEnd && requestedEnd > tripStart
    })

    if (!hasConflict) {
      return driver.id
    }
  }

  return null
}

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
          profile:profiles(
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
    const adminClient = createAdminClient()
    const updates = await request.json()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Debes iniciar sesion" }, { status: 401 })
    }

    if (updates.action === "driver_cancel") {
      const reason = String(updates.reason || "").trim()
      if (reason.length < 8) {
        return NextResponse.json({ error: "Debes escribir un motivo de cancelacion mas detallado" }, { status: 400 })
      }

      const { data: existingTrip, error: existingError } = await adminClient
        .from("trips")
        .select("*")
        .eq("id", id)
        .single()

      if (existingError || !existingTrip) {
        return NextResponse.json({ error: "Viaje no encontrado" }, { status: 404 })
      }

      if (existingTrip.driver_id !== user.id) {
        return NextResponse.json({ error: "Solo el conductor asignado puede cancelar este viaje" }, { status: 403 })
      }

      if (["completed", "cancelled"].includes(existingTrip.status)) {
        return NextResponse.json({ error: "Este viaje ya no se puede cancelar" }, { status: 400 })
      }

      const replacementDriverId = await findReplacementDriver(
        adminClient,
        existingTrip.driver_id,
        existingTrip.scheduled_at,
        existingTrip.scheduled_end_at
      )
      const now = new Date().toISOString()

      const { error: cancelError } = await adminClient
        .from("trips")
        .update({
          status: "cancelled",
          cancellation_reason: reason,
          cancelled_by: user.id,
          cancelled_at: now,
          updated_at: now
        })
        .eq("id", id)

      if (cancelError) {
        return NextResponse.json({ error: cancelError.message }, { status: 500 })
      }

      if (existingTrip.driver_id) {
        await adminClient
          .from("drivers")
          .update({ status: "available", updated_at: now })
          .eq("id", existingTrip.driver_id)
      }

      const replacementNotes = [
        existingTrip.notes,
        `Reasignado automaticamente porque el conductor cancelo el viaje ${existingTrip.confirmation_code}. Motivo: ${reason}`
      ].filter(Boolean).join("\n\n")

      const { data: replacementTrip, error: replacementError } = await adminClient
        .from("trips")
        .insert({
          passenger_id: existingTrip.passenger_id,
          passenger_name: existingTrip.passenger_name,
          passenger_phone: existingTrip.passenger_phone,
          passenger_email: existingTrip.passenger_email,
          driver_id: replacementDriverId,
          service_type: existingTrip.service_type,
          status: replacementDriverId ? "confirmed" : "pending",
          origin: existingTrip.origin,
          destination: existingTrip.destination,
          origin_address: existingTrip.origin_address,
          origin_lat: existingTrip.origin_lat,
          origin_lng: existingTrip.origin_lng,
          destination_address: existingTrip.destination_address,
          destination_lat: existingTrip.destination_lat,
          destination_lng: existingTrip.destination_lng,
          destination_id: existingTrip.destination_id,
          scheduled_at: existingTrip.scheduled_at,
          scheduled_end_at: existingTrip.scheduled_end_at,
          estimated_duration_minutes: existingTrip.estimated_duration_minutes,
          trip_date: existingTrip.trip_date,
          trip_time: existingTrip.trip_time,
          distance_km: existingTrip.distance_km,
          price_usd: existingTrip.price_usd,
          estimated_price: existingTrip.estimated_price,
          discount_code: existingTrip.discount_code,
          discount_amount: existingTrip.discount_amount,
          final_price: existingTrip.final_price,
          passengers: existingTrip.passengers,
          notes: replacementNotes,
          confirmation_code: generateConfirmationCode()
        })
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
            profile:profiles(
              id,
              full_name,
              phone,
              avatar_url
            )
          )
        `)
        .single()

      if (replacementError) {
        return NextResponse.json({
          error: `El viaje se cancelo, pero no se pudo crear la reasignacion: ${replacementError.message}`
        }, { status: 500 })
      }

      return NextResponse.json({
        message: replacementDriverId
          ? "Viaje cancelado y reasignado a otro conductor"
          : "Viaje cancelado. No habia otro conductor disponible, quedo pendiente de asignacion",
        replacementTrip
      })
    }

    const { data: requesterProfile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const isAdmin = requesterProfile?.role === "admin"

    // Get the trip first to validate ownership and driver info
    const { data: existingTrip, error: existingTripError } = await adminClient
      .from("trips")
      .select("*")
      .eq("id", id)
      .single()

    if (existingTripError || !existingTrip) {
      return NextResponse.json({ error: "Viaje no encontrado" }, { status: 404 })
    }

    // If cancelling, add cancellation details
    if (updates.status === "cancelled") {
      if (!isAdmin && existingTrip.passenger_id !== user.id) {
        return NextResponse.json({ error: "Solo puedes cancelar tus propias reservaciones" }, { status: 403 })
      }

      if (!["pending", "confirmed"].includes(existingTrip.status) && !isAdmin) {
        return NextResponse.json({ error: "Este viaje ya no se puede cancelar desde la web" }, { status: 400 })
      }

      const now = new Date().toISOString()
      const { data, error } = await adminClient
        .from("trips")
        .update({
          status: "cancelled",
          cancellation_reason: String(updates.cancellation_reason || "Cancelado por el pasajero"),
          cancelled_by: user.id,
          cancelled_at: now,
          updated_at: now
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
            profile:profiles(
              id,
              full_name,
              phone,
              avatar_url
            )
          )
        `)
        .single()

      if (error) {
        if (error.message?.includes("cancellation_reason")) {
          return NextResponse.json({
            error: "Falta ejecutar el script 010_add_trip_cancellation_fields.sql en Supabase para guardar motivos de cancelacion."
          }, { status: 400 })
        }

        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      if (existingTrip.driver_id) {
        await adminClient
          .from("drivers")
          .update({ status: "available", updated_at: now })
          .eq("id", existingTrip.driver_id)
      }

      return NextResponse.json({
        message: "Viaje cancelado exitosamente",
        trip: data
      })
    }

    if (updates.status === "in_progress" || updates.status === "completed") {
      let isAssignedDriver = existingTrip.driver_id === user.id

      if (!isAssignedDriver && existingTrip.driver_id) {
        const { data: driver } = await adminClient
          .from("drivers")
          .select("user_id")
          .eq("id", existingTrip.driver_id)
          .single()

        isAssignedDriver = driver?.user_id === user.id
      }

      if (!isAdmin && !isAssignedDriver) {
        return NextResponse.json({ error: "Solo el conductor asignado puede actualizar este viaje" }, { status: 403 })
      }
    }

    const allowedUpdates = {
      status: updates.status,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await adminClient
      .from("trips")
      .update(allowedUpdates)
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
          profile:profiles(
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

    if (updates.status === "in_progress" && existingTrip?.driver_id) {
      await adminClient
        .from("drivers")
        .update({ status: "busy", updated_at: new Date().toISOString() })
        .eq("id", existingTrip.driver_id)
    }

    // If trip was cancelled or completed, free up the driver
    if ((updates.status === "cancelled" || updates.status === "completed") && existingTrip?.driver_id) {
      await adminClient
        .from("drivers")
        .update({ status: "available", updated_at: new Date().toISOString() })
        .eq("id", existingTrip.driver_id)

      // Increment completed trips if completed
      if (updates.status === "completed") {
        const { data: driverStats } = await adminClient
          .from("drivers")
          .select("total_trips")
          .eq("id", existingTrip.driver_id)
          .single()

        await adminClient
          .from("drivers")
          .update({ 
            total_trips: (driverStats?.total_trips || 0) + 1
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
