import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET a single driver by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("drivers")
      .select(`
        *,
        user:profiles(first_name, last_name, phone, email, avatar_url),
        reviews:reviews(
          id,
          rating,
          comment,
          created_at,
          reviewer:profiles(first_name, last_name, avatar_url)
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ driver: data })
  } catch (error) {
    console.error("Error fetching driver:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// UPDATE driver (status, info, etc.)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const updates = await request.json()

    const { data, error } = await supabase
      .from("drivers")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      message: "Conductor actualizado exitosamente",
      driver: data 
    })
  } catch (error) {
    console.error("Error updating driver:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
