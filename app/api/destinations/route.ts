import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET all destinations
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const popular = searchParams.get("popular")

    let query = supabase
      .from("destinations")
      .select("*")
      .order("is_popular", { ascending: false })
      .order("name", { ascending: true })

    if (popular === "true") {
      query = query.eq("is_popular", true)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching destinations:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
