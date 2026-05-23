import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET current user profile
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select(`
        *,
        driver:drivers(*)
      `)
      .eq("id", user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// UPDATE current user profile
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const updates = await request.json()

    const { data, error } = await supabase
      .from("profiles")
      .update({
        first_name: updates.firstName,
        last_name: updates.lastName,
        phone: updates.phone,
        location: updates.location,
        avatar_url: updates.avatarUrl
      })
      .eq("id", user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      message: "Perfil actualizado exitosamente",
      profile: data 
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
