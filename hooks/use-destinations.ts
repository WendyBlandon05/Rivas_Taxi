"use client"

import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export interface Destination {
  id: string
  name: string
  description: string | null
  distance_km: number
  price_usd: number
  image_url: string | null
  is_popular: boolean
  created_at: string
}

export function useDestinations(popular?: boolean) {
  const url = popular ? "/api/destinations?popular=true" : "/api/destinations"
  const { data, error, isLoading } = useSWR(url, fetcher)
  
  return {
    destinations: (data?.destinations || []) as Destination[],
    isLoading,
    error
  }
}

export async function validateDiscountCode(code: string) {
  const response = await fetch("/api/discount-codes/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code })
  })
  return response.json()
}
