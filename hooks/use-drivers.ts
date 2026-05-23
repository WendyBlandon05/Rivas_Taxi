"use client"

import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export interface Driver {
  id: string
  user_id: string
  license_number: string
  license_expiry: string | null
  vehicle_brand: string
  vehicle_model: string
  vehicle_year: number | null
  vehicle_color: string
  vehicle_plate: string
  vehicle_photo_url: string | null
  status: "available" | "busy" | "offline"
  rating: number
  total_trips: number
  is_verified: boolean
  created_at: string
  updated_at: string
  user?: {
    first_name: string | null
    last_name: string | null
    phone: string | null
    email: string
    avatar_url: string | null
  }
}

export function useDrivers(options?: { status?: string; verified?: boolean }) {
  const params = new URLSearchParams()
  if (options?.status) params.append("status", options.status)
  if (options?.verified) params.append("verified", "true")
  
  const url = `/api/drivers${params.toString() ? `?${params.toString()}` : ""}`
  const { data, error, isLoading, mutate } = useSWR(url, fetcher)
  
  return {
    drivers: (data?.drivers || []) as Driver[],
    isLoading,
    error,
    refresh: mutate
  }
}

export function useDriver(id: string) {
  const { data, error, isLoading, mutate } = useSWR(id ? `/api/drivers/${id}` : null, fetcher)
  
  return {
    driver: data?.driver as Driver | undefined,
    isLoading,
    error,
    refresh: mutate
  }
}

export async function updateDriverStatus(id: string, status: "available" | "busy" | "offline") {
  const response = await fetch(`/api/drivers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  })
  return response.json()
}
