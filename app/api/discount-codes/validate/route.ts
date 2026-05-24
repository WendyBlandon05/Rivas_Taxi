import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Validate a discount code
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Codigo requerido" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("discount_codes")
      .select("*")
      .eq("code", code.toUpperCase())
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
