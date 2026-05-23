import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Generate a random password
function generatePassword(length = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

export async function POST(request: NextRequest) {
  try {
    // Verify the requesting user is an admin
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado. Solo administradores.' }, { status: 403 })
    }

    // Get driver data from request
    const body = await request.json()
    const { 
      email, 
      full_name, 
      phone,
      password: customPassword,
      license_number,
      vehicle_brand,
      vehicle_model,
      vehicle_year,
      vehicle_plate,
      vehicle_color
    } = body

    if (!email || !full_name) {
      return NextResponse.json({ error: 'Email y nombre completo son requeridos' }, { status: 400 })
    }

    // Generate password if not provided
    const password = customPassword || generatePassword()

    // Use admin client to create user
    const adminClient = createAdminClient()
    
    // Create auth user with driver role in metadata
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for admin-created users
      user_metadata: {
        full_name,
        role: 'driver'
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return NextResponse.json({ 
        error: authError.message || 'Error al crear usuario' 
      }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 })
    }

    // The trigger should create the profile, but let's also update the drivers table
    // with the additional vehicle information
    const { error: driverError } = await adminClient
      .from('drivers')
      .upsert({
        id: authData.user.id,
        license_number,
        vehicle_brand,
        vehicle_model,
        vehicle_year: vehicle_year ? parseInt(vehicle_year) : null,
        vehicle_plate,
        vehicle_color,
        status: 'offline',
        is_active: true
      })

    if (driverError) {
      console.error('Error updating driver info:', driverError)
      // Don't fail the request, the user was created successfully
    }

    // Update profile with phone if provided
    if (phone) {
      await adminClient
        .from('profiles')
        .update({ phone })
        .eq('id', authData.user.id)
    }

    return NextResponse.json({
      success: true,
      message: 'Conductor creado exitosamente',
      driver: {
        id: authData.user.id,
        email: authData.user.email,
        full_name,
        password // Return password so admin can share with driver
      }
    })

  } catch (error) {
    console.error('Error in create driver:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  }
}

// GET - List all drivers (admin only)
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Get all drivers with their profiles
    const adminClient = createAdminClient()
    const { data: drivers, error } = await adminClient
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        phone,
        role,
        created_at,
        drivers (
          license_number,
          vehicle_brand,
          vehicle_model,
          vehicle_year,
          vehicle_plate,
          vehicle_color,
          status,
          rating,
          total_trips,
          is_active
        )
      `)
      .eq('role', 'driver')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching drivers:', error)
      return NextResponse.json({ error: 'Error al obtener conductores' }, { status: 500 })
    }

    return NextResponse.json({ drivers })

  } catch (error) {
    console.error('Error in get drivers:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
