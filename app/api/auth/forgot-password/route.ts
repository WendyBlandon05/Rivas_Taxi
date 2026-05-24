import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "El correo electronico es requerido" }, { status: 400 })
    }

    const origin = new URL(request.url).origin
    const supabase = await createClient()
    const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL || origin}/auth/callback?next=/reset-password`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      message: "Si el correo existe, enviaremos instrucciones para restablecer la contrasena.",
    })
  } catch (error) {
    console.error("Error requesting password reset:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
