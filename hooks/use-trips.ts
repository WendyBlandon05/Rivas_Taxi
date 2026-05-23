"use client"

import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useTrips(status?: string) {
  const url = status ? `/api/trips?status=${status}` : "/api/trips"
  const { data, error, isLoading, mutate } = useSWR(url, fetcher)
  
  return {
    trips: data?.trips || [],
    isLoading,
    error,
    refresh: mutate
  }
}

export function useTrip(id: string) {
  const { data, error, isLoading, mutate } = useSWR(id ? `/api/trips/${id}` : null, fetcher)
  
  return {
    trip: data?.trip,
    isLoading,
    error,
    refresh: mutate
  }
}

export async function createTrip(tripData: Record<string, unknown>) {
  const response = await fetch("/api/trips", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tripData)
  })
  return response.json()
}

export async function updateTrip(id: string, updates: Record<string, unknown>) {
  const response = await fetch(`/api/trips/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates)
  })
  return response.json()
}

export async function cancelTrip(id: string, reason: string) {
  return updateTrip(id, { status: "cancelled", cancellation_reason: reason })
}
