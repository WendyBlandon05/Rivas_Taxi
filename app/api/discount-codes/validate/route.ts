import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

const FIRST_TRIP_COUPONS = new Set(["BIENVENIDO20"])

// Validate a discount code
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()
    const { code } = await request.json()
    const normalizedCode = String(code || "").trim().toUpperCase()

    if (!normalizedCode) {
      return NextResponse.json({ error: "Codigo requerido" }, { status: 400 })
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (FIRST_TRIP_COUPONS.has(normalizedCode)) {
      if (!user) {
        return NextResponse.json({
          valid: false,
          error: "Inicia sesion o registrate para usar este cupon de primer viaje",
        }, { status: 401 })
      }

      const { count, error: tripsError } = await adminClient
        .from("trips")
        .select("id", { count: "exact", head: true })
        .eq("passenger_id", user.id)

      if (tripsError) {
        console.error("Error checking first-trip coupon:", tripsError)
        return NextResponse.json({ error: "Error al validar el historial de viajes" }, { status: 500 })
      }

      if ((count || 0) > 0) {
        return NextResponse.json({
          valid: false,
          error: "Este cupon solo aplica para tu primer viaje. Si ya reservaste antes, aunque hayas cancelado, no se puede usar de nuevo.",
        }, { status: 400 })
      }
    }

    const { data, error } = await adminClient
      .from("discount_codes")
      .select("*")
      .eq("code", normalizedCode)
      .eq("is_active", true)
      .single()

    if (error || !data) {
      return NextResponse.json({ 
        valid: false, 
        error: "Codigo de descuento invalido o expirado" 
      }, { status: 404 })
    }

    // Check if code has reached max uses
    if (data.max_uses && data.current_uses >= data.max_uses) {
      return NextResponse.json({ 
        valid: false, 
        error: "Este codigo ya alcanzo el limite de usos" 
      }, { status: 400 })
    }

    // Check if code is still valid (date range)
    const now = new Date()
    if (data.valid_from && new Date(data.valid_from) > now) {
      return NextResponse.json({ 
        valid: false, 
        error: "Este codigo aun no esta activo" 
      }, { status: 400 })
    }

    if (data.valid_until && new Date(data.valid_until) < now) {
      return NextResponse.json({ 
        valid: false, 
        error: "Este codigo ha expirado" 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      valid: true,
      discountCode: data.code,
      discountPercentage: Number(data.discount_percentage),
      discount_percentage: Number(data.discount_percentage)
    })
  } catch (error) {
    console.error("Error validating discount code:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
