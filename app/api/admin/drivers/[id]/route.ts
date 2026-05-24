import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

function isValidNicaraguaPhone(value: string) {
  return /^\+505\d{8}$/.test(value)
}

function isValidCedula(value: string) {
  return /^\d{3}-\d{6}-\d{4}[A-Z]$/.test(value)
}

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: "No autorizado" }, { status: 401 }) }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "Acceso denegado" }, { status: 403 }) }
  }

  return { error: null }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await assertAdmin()
    if (error) return error

    const { id } = await params
    const body = await request.json()
    const adminClient = createAdminClient()

    const fullName = String(body.full_name || "").trim()
    const nameParts = fullName.split(" ").filter(Boolean)
    const phone = String(body.phone || "").trim()
    const cedula = String(body.cedula_number || "").trim()

    if (!isValidNicaraguaPhone(phone)) {
      return NextResponse.json({ error: "El telefono debe iniciar con +505 y tener 8 numeros despues" }, { status: 400 })
    }

    if (!isValidCedula(cedula)) {
      return NextResponse.json({ error: "La cedula debe tener el formato 111-111111-1111A" }, { status: 400 })
    }

    let { error: profileError } = await adminClient
      .from("profiles")
      .update({
        email: body.email,
        full_name: fullName,
        first_name: nameParts[0] || null,
        last_name: nameParts.slice(1).join(" ") || null,
        phone,
        cedula_number: cedula,
        address: body.address,
        location: body.address,
        avatar_url: body.avatar_url || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)

    if (profileError?.message?.includes("does not exist")) {
      const fallback = await adminClient
        .from("profiles")
        .update({
          email: body.email,
          full_name: fullName,
          phone,
          avatar_url: body.avatar_url || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
      profileError = fallback.error
    }

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    const { error: driverError } = await adminClient
      .from("drivers")
      .update({
        license_number: body.license_number || cedula,
        vehicle_brand: body.vehicle_brand || null,
        vehicle_model: body.vehicle_model,
        vehicle_year: body.vehicle_year ? Number(body.vehicle_year) : null,
        vehicle_plate: body.vehicle_plate,
        vehicle_color: body.vehicle_color,
        is_active: body.is_active,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)

    if (driverError) {
      return NextResponse.json({ error: driverError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "Conductor actualizado" })
  } catch (error) {
    console.error("Error updating driver:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await assertAdmin()
    if (error) return error

    const { id } = await params
    const adminClient = createAdminClient()
    const now = new Date().toISOString()

    const { error: driverError } = await adminClient
      .from("drivers")
      .update({ is_active: false, status: "offline", updated_at: now })
      .eq("id", id)

    if (driverError) {
      return NextResponse.json({ error: driverError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "Conductor eliminado del listado operativo" })
  } catch (error) {
    console.error("Error deleting driver:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
