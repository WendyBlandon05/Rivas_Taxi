"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/language-context"

const INITIAL_GA4_VISITS = 552

interface VisitStats {
  total: number
  today: number
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}

export function VisitCounter() {
  const { t } = useLanguage()
  const [stats, setStats] = useState<VisitStats>({ total: INITIAL_GA4_VISITS, today: 0 })

  useEffect(() => {
    let isMounted = true
    const alreadyRecorded = window.sessionStorage.getItem("pct-visit-recorded") === "true"
    const pagePath = `${window.location.pathname}${window.location.search}`

    async function syncVisits() {
      try {
        const response = await fetch("/api/analytics/visits", {
          method: alreadyRecorded ? "GET" : "POST",
          headers: alreadyRecorded ? undefined : { "Content-Type": "application/json" },
          body: alreadyRecorded ? undefined : JSON.stringify({ pagePath }),
          cache: "no-store",
        })
        const data = await response.json()

        if (!alreadyRecorded && response.ok) {
          window.sessionStorage.setItem("pct-visit-recorded", "true")
        }

        if (isMounted && typeof data.total === "number" && typeof data.today === "number") {
          setStats(data)
        }
      } catch {
        if (isMounted) {
          setStats((current) => current)
        }
      }
    }

    syncVisits()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="bg-white border-y border-gray-100">
      <div className="container mx-auto px-4 py-5 text-center">
        <p className="text-base md:text-lg font-medium text-slate-900">
          {t("visitCounter.visits")}: {formatCount(stats.total)} <span className="text-slate-400">|</span>{" "}
          {t("visitCounter.today")}: {formatCount(stats.today)}
        </p>
      </div>
    </section>
  )
}
