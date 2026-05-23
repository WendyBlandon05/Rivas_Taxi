import { createClient } from "@/lib/supabase/server"
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

// GET - Fetch trips with driver info
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const passengerEmail = searchParams.get('email')
    const status = searchParams.get('status')

    // Build query with driver relationship
    let query = supabase
      .from('trips')
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
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    // Filter by passenger email if provided
    if (passengerEmail) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', passengerEmail)
        .single()
      
      if (profile) {
        query = query.eq('passenger_id', profile.id)
      }
    } else {
      // Try to get authenticated user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        query = query.eq('passenger_id', user.id)
      }
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

    // Validate required fields
    if (!passengerName || !passengerPhone || !origin || !destination) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos (nombre, telefono, origen, destino)' },
        { status: 400 }
      )
    }

    // Get passenger ID from auth or email
    let passengerId: string | null = null
    
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      passengerId = user.id
    } else if (passengerEmail) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', passengerEmail)
        .single()
      
      if (existingProfile) {
        passengerId = existingProfile.id
      }
    }

    // Validate and apply discount code if provided
    let discountAmount = providedDiscountAmount || 0
    let validatedDiscountCode = null
    const estimatedPrice = priceUsd || 0

    if (discountCode && !providedDiscountAmount) {
      const { data: coupon, error: couponError } = await supabase
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
            await supabase
              .from('discount_codes')
              .update({ current_uses: coupon.current_uses + 1 })
              .eq('id', coupon.id)
          }
        }
      }
    } else if (discountCode) {
      validatedDiscountCode = discountCode
    }

    // Find an available driver
    const { data: availableDrivers, error: driversError } = await supabase
      .from('drivers')
      .select(`
        id,
        status,
        rating,
        total_trips,
        vehicle_brand,
        vehicle_model,
        profile:profiles!id(full_name)
      `)
      .eq('status', 'available')
      .eq('is_active', true)
      .order('rating', { ascending: false })
      .limit(5)

    if (driversError) {
      console.error('[v0] Error finding drivers:', driversError)
    }

    // Select a driver (prioritize by rating, or null if none available)
    let assignedDriverId = null
    let tripStatus: 'pending' | 'confirmed' = 'pending'

    if (availableDrivers && availableDrivers.length > 0) {
      // Randomly select from top rated drivers for fairness
      const randomIndex = Math.floor(Math.random() * Math.min(3, availableDrivers.length))
      assignedDriverId = availableDrivers[randomIndex].id
      tripStatus = 'confirmed'

      // Update driver status to busy
      await supabase
        .from('drivers')
        .update({ status: 'busy', updated_at: new Date().toISOString() })
        .eq('id', assignedDriverId)
    }

    // Generate confirmation code
    const confirmationCode = generateConfirmationCode()

    // Calculate final price
    const finalPrice = providedFinalPrice || (estimatedPrice - discountAmount)

    // Create scheduled_at from date and time
    let scheduledAt = null
    if (tripDate && tripTime) {
      scheduledAt = new Date(`${tripDate}T${tripTime}:00`).toISOString()
    }

    // Create the trip
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert({
        passenger_id: passengerId,
        passenger_name: passengerName,
        passenger_phone: passengerPhone,
        service_type: serviceType || 'local',
        status: tripStatus,
        origin_address: origin,
        origin_lat: originLat,
        origin_lng: originLng,
        destination_address: destination,
        destination_lat: destinationLat,
        destination_lng: destinationLng,
        scheduled_at: scheduledAt,
        trip_date: tripDate,
        trip_time: tripTime,
        passengers: passengers || 1,
        notes,
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
          profile:profiles!id(full_name, phone)
        )
      `)
      .single()

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
