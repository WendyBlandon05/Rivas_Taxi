import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

const NICARAGUA_UTC_OFFSET_HOURS = 6

function getNicaraguaDayRange() {
  const now = new Date()
  const nicaraguaNow = new Date(now.getTime() - NICARAGUA_UTC_OFFSET_HOURS * 60 * 60 * 1000)
  const year = nicaraguaNow.getUTCFullYear()
  const month = nicaraguaNow.getUTCMonth()
  const day = nicaraguaNow.getUTCDate()

  const startUtc = new Date(Date.UTC(year, month, day, NICARAGUA_UTC_OFFSET_HOURS, 0, 0, 0))
  const endUtc = new Date(Date.UTC(year, month, day + 1, NICARAGUA_UTC_OFFSET_HOURS, 0, 0, 0))

  return { startUtc, endUtc }
}

async function getVisitStats(supabase: ReturnType<typeof createAdminClient>) {
  const { startUtc, endUtc } = getNicaraguaDayRange()

  const [{ data: settings }, { count: totalRecorded }, { count: today }] = await Promise.all([
    supabase
      .from("site_visit_settings")
      .select("initial_total")
      .eq("id", true)
      .single(),
    supabase
      .from("site_visits")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("site_visits")
      .select("id", { count: "exact", head: true })
      .gte("visited_at", startUtc.toISOString())
      .lt("visited_at", endUtc.toISOString()),
  ])

  return {
    total: Number(settings?.initial_total || 0) + Number(totalRecorded || 0),
    today: Number(today || 0),
  }
}

export async function GET() {
  try {
    const supabase = createAdminClient()
    const stats = await getVisitStats(supabase)
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error loading visit stats:", error)
    return NextResponse.json({ total: 552, today: 0 }, { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await request.json().catch(() => ({}))
    const pagePath = typeof body.pagePath === "string" && body.pagePath.trim()
      ? body.pagePath.slice(0, 300)
      : "/"
    const userAgent = request.headers.get("user-agent")?.slice(0, 500) || null

    await supabase
      .from("site_visits")
      .insert({
        page_path: pagePath,
        user_agent: userAgent,
      })

    const stats = await getVisitStats(supabase)
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error registering visit:", error)
    return NextResponse.json(
      { error: "No se pudo registrar la visita" },
      { status: 500 }
    )
  }
}
