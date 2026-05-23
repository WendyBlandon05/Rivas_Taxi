"use client"

import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export interface Review {
  id: string
  trip_id: string | null
  driver_id: string | null
  reviewer_id: string
  rating: number
  comment: string | null
  is_driver_review: boolean
  created_at: string
  reviewer?: {
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
  }
}

export function useReviews(options?: { driverId?: string; tripId?: string; limit?: number }) {
  const params = new URLSearchParams()
  if (options?.driverId) params.append("driver_id", options.driverId)
  if (options?.tripId) params.append("trip_id", options.tripId)
  if (options?.limit) params.append("limit", options.limit.toString())
  
  const url = `/api/reviews${params.toString() ? `?${params.toString()}` : ""}`
  const { data, error, isLoading, mutate } = useSWR(url, fetcher)
  
  return {
    reviews: (data?.reviews || []) as Review[],
    isLoading,
    error,
    refresh: mutate
  }
}

export async function createReview(reviewData: {
  tripId?: string
  driverId?: string
  rating: number
  comment?: string
  isDriverReview?: boolean
}) {
  const response = await fetch("/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reviewData)
  })
  return response.json()
}
