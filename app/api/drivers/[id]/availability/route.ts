import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET driver availability
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    let query = supabase
      .from("driver_availability")
      .select("*")
      .eq("driver_id", id)
      .eq("is_available", true)
      .gte("date", new Date().toISOString().split("T")[0])
      .order("date", { ascending: true })

    if (date) {
      query = query.eq("date", date)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ availability: data })
  } catch (error) {
    console.error("Error fetching availability:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// SET driver availability
export async function POST(
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

    const availabilityData = await request.json()

    const { data, error } = await supabase
      .from("driver_availability")
      .insert({
        driver_id: id,
        date: availabilityData.date,
        start_time: availabilityData.startTime,
        end_time: availabilityData.endTime,
        is_available: availabilityData.isAvailable ?? true
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      message: "Disponibilidad guardada exitosamente",
      availability: data 
    }, { status: 201 })
  } catch (error) {
    console.error("Error setting availability:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
