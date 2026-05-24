import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
    const response = NextResponse.json({ message: "Sesion cerrada exitosamente" })

    request.cookies.getAll().forEach((cookie) => {
      if (cookie.name.startsWith("sb-")) {
        response.cookies.set(cookie.name, "", {
          path: "/",
          maxAge: 0,
        })
      }
    })

    return response
  } catch (error) {
    console.error("Error en logout:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
