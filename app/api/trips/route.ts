import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

// Generate unique confirmation code
function generateConfirmationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'PCT-'
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

const AVERAGE_SPEED_KMH = 45
const TURNAROUND_MINUTES = 20

function estimateTripDurationMinutes(distanceKm: number): number {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
    return 30
  }

  const travelMinutes = (distanceKm / AVERAGE_SPEED_KMH) * 60
  return Math.max(30, Math.ceil(travelMinutes + TURNAROUND_MINUTES))
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000)
}

function getTomorrowDateInput() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const year = tomorrow.getFullYear()
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
  const day = String(tomorrow.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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

async function findAvailableDriverForSchedule(
  adminClient: ReturnType<typeof createAdminClient>,
  scheduledAt: string | null,
  scheduledEndAt: string | null,
) {
  const { data: drivers, error: driversError } = await adminClient
    .from('drivers')
    .select('id, rating, total_trips')
    .eq('is_active', true)
    .neq('status', 'offline')
    .order('rating', { ascending: false })
    .order('total_trips', { ascending: true })

  if (driversError) {
    console.error('[v0] Error finding drivers:', driversError)
    return null
  }

  const candidates = (drivers || []) as DriverCandidate[]
  if (candidates.length === 0) return null

  if (!scheduledAt || !scheduledEndAt) {
    return candidates[0].id
  }

  const candidateIds = candidates.map((driver) => driver.id)
  const { data: scheduledTrips, error: tripsError } = await adminClient
    .from('trips')
    .select('driver_id, scheduled_at, scheduled_end_at, estimated_duration_minutes')
    .in('driver_id', candidateIds)
    .in('status', ['pending', 'confirmed', 'in_progress'])
    .not('scheduled_at', 'is', null)

  if (tripsError) {
    console.error('[v0] Error checking driver schedule:', tripsError)
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

// GET - Fetch trips with driver info
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()
    const { searchParams } = new URL(request.url)
    const passengerEmail = searchParams.get('email')
    const status = searchParams.get('status')
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ trips: [] })
    }

    const { data: requesterProfile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = requesterProfile?.role === 'admin'

    // Build query with driver relationship
    let query = adminClient
      .from('trips')
      .select(`
        *,
        driver_reviews(
          id,
          rating,
          comment,
          created_at
        ),
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
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    // Filter by passenger email if provided
    if (isAdmin && passengerEmail) {
      const { data: profile } = await adminClient
        .from('profiles')
        .select('id')
        .eq('email', passengerEmail)
        .single()
      
      if (profile) {
        query = query.eq('passenger_id', profile.id)
      }
    } else if (!isAdmin) {
      query = query.eq('passenger_id', user.id)
    }

    const { data, error } = await query

    if (error) {
      console.error('[v0] Error fetching trips:', error)
      return NextResponse.json({ error: error.message, trips: [] }, { status: 200 })
    }

    return NextResponse.json({ trips: data || [] })
  } catch (error) {
    console.error('[v0] Server error fetching trips:', error)
    return NextResponse.json({ error: 'Error del servidor', trips: [] }, { status: 200 })
  }
}

// POST - Create a new trip with driver assignment
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()
    const body = await request.json()

    const {
      passengerEmail,
      passengerName,
      passengerPhone,
      serviceType,
      origin,
      originLat,
      originLng,
      destination,
      destinationLat,
      destinationLng,
      tripDate,
      tripTime,
      passengers,
      notes,
      priceUsd,
      distanceKm,
      discountCode,
      discountAmount: providedDiscountAmount,
      finalPrice: providedFinalPrice
    } = body

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Para tu mayor seguridad debes registrarte o iniciar sesion antes de reservar un viaje.' },
        { status: 401 }
      )
    }

    // Validate required fields
    if (!passengerName || !passengerPhone || !origin || !destination) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos (nombre, telefono, origen, destino)' },
        { status: 400 }
      )
    }

    const minTripDate = getTomorrowDateInput()
    if (!tripDate || tripDate < minTripDate) {
      return NextResponse.json(
        { error: `Las reservas deben programarse a partir del ${minTripDate}.` },
        { status: 400 }
      )
    }

    const passengerId = user.id
    const resolvedPassengerEmail = passengerEmail || user.email || null
    const { data: passengerProfile } = await adminClient
      .from('profiles')
      .select('full_name, phone, email')
      .eq('id', passengerId)
      .single()
    const resolvedPassengerName = passengerProfile?.full_name || passengerName
    const resolvedPassengerPhone = passengerProfile?.phone || passengerPhone

    // Validate and apply discount code if provided
    let discountAmount = Number(providedDiscountAmount || 0)
    let validatedDiscountCode = null
    const estimatedPrice = Number(priceUsd || 0)

    if (discountCode && !providedDiscountAmount) {
      const { data: coupon, error: couponError } = await adminClient
        .from('discount_codes')
        .select('*')
        .eq('code', discountCode.toUpperCase())
        .eq('is_active', true)
        .lte('valid_from', new Date().toISOString())
        .gte('valid_until', new Date().toISOString())
        .single()

      if (!couponError && coupon) {
        // Check max uses
        if (!coupon.max_uses || coupon.current_uses < coupon.max_uses) {
          // Check minimum trip amount
          if (!coupon.min_trip_amount || estimatedPrice >= coupon.min_trip_amount) {
            discountAmount = (estimatedPrice * coupon.discount_percentage) / 100
            validatedDiscountCode = coupon.code

            // Increment usage count
            await adminClient
              .from('discount_codes')
              .update({ current_uses: coupon.current_uses + 1 })
              .eq('id', coupon.id)
          }
        }
      }
    } else if (discountCode) {
      validatedDiscountCode = discountCode
    }

    // Generate confirmation code
    const confirmationCode = generateConfirmationCode()

    // Calculate final price
    const finalPrice = Number.isFinite(Number(providedFinalPrice))
      ? Number(providedFinalPrice)
      : Math.max(0, estimatedPrice - discountAmount)

    // Create scheduled_at from date and time
    let scheduledAt = null
    let scheduledEndAt = null
    if (tripDate && tripTime) {
      scheduledAt = new Date(`${tripDate}T${tripTime}:00`).toISOString()
    }

    const estimatedDurationMinutes = estimateTripDurationMinutes(Number(distanceKm || 0))
    if (scheduledAt) {
      scheduledEndAt = addMinutes(new Date(scheduledAt), estimatedDurationMinutes).toISOString()
    }

    const assignedDriverId = await findAvailableDriverForSchedule(adminClient, scheduledAt, scheduledEndAt)
    const tripStatus: 'pending' | 'confirmed' = assignedDriverId ? 'confirmed' : 'pending'

    // Create the trip
    const { data: trip, error: tripError } = await adminClient
      .from('trips')
      .insert({
        passenger_id: passengerId,
        passenger_name: resolvedPassengerName,
        passenger_phone: resolvedPassengerPhone,
        passenger_email: resolvedPassengerEmail,
        service_type: serviceType || 'urbano',
        status: tripStatus,
        origin_address: origin,
        origin_lat: originLat,
        origin_lng: originLng,
        destination_address: destination,
        destination_lat: destinationLat,
        destination_lng: destinationLng,
        scheduled_at: scheduledAt,
        scheduled_end_at: scheduledEndAt,
        estimated_duration_minutes: estimatedDurationMinutes,
        trip_date: tripDate,
        trip_time: tripTime,
        passengers: passengers || 1,
        notes,
        price_usd: estimatedPrice,
        estimated_price: estimatedPrice,
        final_price: finalPrice,
        distance_km: distanceKm,
        discount_code: validatedDiscountCode,
        discount_amount: discountAmount,
        confirmation_code: confirmationCode,
        driver_id: assignedDriverId
      })
      .select(`
        *,
        driver:drivers!driver_id(
          id,
          vehicle_brand,
          vehicle_model,
          vehicle_color,
          vehicle_plate,
          rating,
          profile:profiles(full_name, phone)
        )
      `)
      .single()

    if (tripError?.message?.includes("passenger_email")) {
      const { data: fallbackTrip, error: fallbackError } = await adminClient
        .from('trips')
        .insert({
          passenger_id: passengerId,
          passenger_name: resolvedPassengerName,
          passenger_phone: resolvedPassengerPhone,
          service_type: serviceType || 'urbano',
          status: tripStatus,
          origin_address: origin,
          origin_lat: originLat,
          origin_lng: originLng,
          destination_address: destination,
          destination_lat: destinationLat,
          destination_lng: destinationLng,
          scheduled_at: scheduledAt,
          scheduled_end_at: scheduledEndAt,
          estimated_duration_minutes: estimatedDurationMinutes,
          trip_date: tripDate,
          trip_time: tripTime,
          passengers: passengers || 1,
          notes,
          price_usd: estimatedPrice,
          estimated_price: estimatedPrice,
          final_price: finalPrice,
          distance_km: distanceKm,
          discount_code: validatedDiscountCode,
          discount_amount: discountAmount,
          confirmation_code: confirmationCode,
          driver_id: assignedDriverId
        })
        .select(`
          *,
          driver:drivers!driver_id(
            id,
            vehicle_brand,
            vehicle_model,
            vehicle_color,
            vehicle_plate,
            rating,
            profile:profiles(full_name, phone)
          )
        `)
        .single()

      if (!fallbackError) {
        return NextResponse.json({
          message: assignedDriverId
            ? 'Reservacion confirmada! Un conductor ha sido asignado.'
            : 'Reservacion creada. Estamos buscando un conductor disponible.',
          trip: fallbackTrip,
          driverAssigned: !!assignedDriverId,
          confirmation_code: confirmationCode
        }, { status: 201 })
      }
    }

    if (tripError) {
      console.error('[v0] Error creating trip:', tripError)
      return NextResponse.json(
        { error: 'Error al crear la reservacion: ' + tripError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: assignedDriverId 
        ? 'Reservacion confirmada! Un conductor ha sido asignado.'
        : 'Reservacion creada. Estamos buscando un conductor disponible.',
      trip,
      driverAssigned: !!assignedDriverId,
      confirmation_code: confirmationCode
    }, { status: 201 })

  } catch (error) {
    console.error('[v0] Server error creating trip:', error)
    return NextResponse.json(
      { error: 'Error del servidor al crear la reservacion' },
      { status: 500 }
    )
  }
}
