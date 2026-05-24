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

function isValidNicaraguaPhone(value: string) {
  return /^\+505\d{8}$/.test(value)
}

function isValidCedula(value: string) {
  return /^\d{3}-\d{6}-\d{4}[A-Z]$/.test(value)
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
      first_name,
      last_name,
      phone,
      cedula_number,
      address,
      password: customPassword,
      license_number,
      vehicle_brand,
      vehicle_model,
      vehicle_year,
      vehicle_plate,
      vehicle_color,
      avatar_url,
      vehicle_photo_url
    } = body

    const resolvedFullName = full_name || [first_name, last_name].filter(Boolean).join(' ').trim()
    const resolvedLicenseNumber = license_number || cedula_number

    if (!email || !resolvedFullName || !phone || !resolvedLicenseNumber || !address || !vehicle_model || !vehicle_plate || !vehicle_color) {
      return NextResponse.json({
        error: 'Correo, nombre, telefono, cedula/licencia, direccion, modelo, color y placa son requeridos'
      }, { status: 400 })
    }

    if (!isValidNicaraguaPhone(phone)) {
      return NextResponse.json({
        error: 'El telefono debe iniciar con +505 y tener 8 numeros despues'
      }, { status: 400 })
    }

    if (!isValidCedula(resolvedLicenseNumber)) {
      return NextResponse.json({
        error: 'La cedula debe tener el formato 111-111111-1111A'
      }, { status: 400 })
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
        full_name: resolvedFullName,
        first_name,
        last_name,
        phone,
        cedula_number: resolvedLicenseNumber,
        address,
        avatar_url,
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

    await adminClient
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email,
        full_name: resolvedFullName,
        first_name: first_name || resolvedFullName.split(' ')[0] || null,
        last_name: last_name || resolvedFullName.split(' ').slice(1).join(' ') || null,
        phone,
        cedula_number: resolvedLicenseNumber,
        address,
        location: address,
        avatar_url: avatar_url || null,
        role: 'driver'
      })

    const { error: driverError } = await adminClient
      .from('drivers')
      .upsert({
        id: authData.user.id,
        user_id: authData.user.id,
        license_number: resolvedLicenseNumber,
        vehicle_brand: vehicle_brand || null,
        vehicle_model,
        vehicle_year: vehicle_year ? parseInt(vehicle_year) : null,
        vehicle_plate,
        vehicle_color,
        status: 'offline',
        is_active: true,
        is_verified: true
      })

    if (driverError) {
      console.error('Error updating driver info:', driverError)
      // Don't fail the request, the user was created successfully
    }

    return NextResponse.json({
      success: true,
      message: 'Conductor creado exitosamente',
      driver: {
        id: authData.user.id,
        email: authData.user.email,
        full_name: resolvedFullName,
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

    // Get all drivers and profiles separately to avoid PostgREST relationship ambiguity.
    const adminClient = createAdminClient()
    const { data: driverRows, error: driversError } = await adminClient
      .from('drivers')
      .select(`
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
        is_active,
        created_at
      `)
      .order('created_at', { ascending: false })

    if (driversError) {
      console.error('Error fetching drivers:', driversError)
      return NextResponse.json({ error: driversError.message || 'Error al obtener conductores' }, { status: 500 })
    }

    const driverIds = (driverRows || []).map((driver) => driver.id)
    let { data: profileRows, error: profilesError } = await adminClient
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        phone,
        cedula_number,
        address,
        avatar_url,
        role,
        created_at
      `)
      .in('id', driverIds)

    if (profilesError?.message?.includes('does not exist')) {
      const fallback = await adminClient
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          phone,
          avatar_url,
          role,
          created_at
        `)
        .in('id', driverIds)
      profileRows = fallback.data
      profilesError = fallback.error
    }

    if (profilesError) {
      console.error('Error fetching driver profiles:', profilesError)
      return NextResponse.json({ error: profilesError.message || 'Error al obtener conductores' }, { status: 500 })
    }

    const profileMap = new Map((profileRows || []).map((profile) => [profile.id, profile]))
    const drivers = (driverRows || []).map((driver) => ({
      ...(profileMap.get(driver.id) || {
        id: driver.id,
        email: '',
        full_name: 'Sin perfil',
        first_name: null,
        last_name: null,
        phone: null,
        cedula_number: null,
        address: null,
        avatar_url: null,
        role: 'driver',
        created_at: driver.created_at,
      }),
      drivers: driver
    }))

    return NextResponse.json({ drivers })

  } catch (error) {
    console.error('Error in get drivers:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
