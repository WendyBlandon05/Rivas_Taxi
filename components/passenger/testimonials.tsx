"use client"

import { useEffect, useMemo, useState } from "react"
import { Star, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ServiceReview {
  id: string
  rating: number
  comment: string | null
  created_at: string
  reviewer?: {
    email: string | null
    full_name: string | null
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
  } | null
}

function getReviewerName(review: ServiceReview) {
  const fullName = review.reviewer?.full_name?.trim()
  if (fullName) return fullName

  const firstName = review.reviewer?.first_name?.trim()
  const lastName = review.reviewer?.last_name?.trim()
  const name = [firstName, lastName].filter(Boolean).join(" ")
  if (name) return name

  return review.reviewer?.email?.split("@")[0] || "Cliente"
}

function getReviewerEmail(review: ServiceReview) {
  return review.reviewer?.email || "Usuario verificado"
}

function ReviewCard({ review }: { review: ServiceReview }) {
  const name = getReviewerName(review)
  const email = getReviewerEmail(review)

  return (
    <Card className="w-full md:w-80 shadow-lg border-0 bg-gradient-to-b from-amber-50 to-white">
      <CardContent className="p-6 text-center">
        <div className="flex justify-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-5 h-5 ${
                star <= review.rating
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <p className="text-gray-700 text-sm mb-4 min-h-[60px]">
          {`"${review.comment || "Excelente servicio."}"`}
        </p>
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1a5276] to-amber-500 flex items-center justify-center text-white font-bold text-lg">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="text-center">
            <p className="text-[#1a5276] font-semibold text-sm">{name}</p>
            <p className="text-gray-500 text-xs break-all">{email}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function Testimonials() {
  const [reviews, setReviews] = useState<ServiceReview[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true)
      setError("")

      try {
        const response = await fetch("/api/reviews?service_only=true&min_rating=4&limit=12")
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "No se pudieron cargar las resenas")
        }

        const realReviews = (data.reviews || []).filter((review: ServiceReview) => (
          review.rating >= 4 && !review.driver_id && review.comment
        ))

        setReviews(realReviews)
        setCurrentIndex(0)
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudieron cargar las resenas")
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [])

  const visibleTestimonials = useMemo(() => {
    if (reviews.length === 0) return []

    const itemsPerPage = Math.min(3, reviews.length)
    const visible = []
    for (let i = 0; i < itemsPerPage; i++) {
      visible.push(reviews[(currentIndex + i) % reviews.length])
    }
    return visible
  }, [currentIndex, reviews])

  const nextSlide = () => {
    if (reviews.length === 0) return
    setCurrentIndex((prev) => (prev + 1) % reviews.length)
  }

  const prevSlide = () => {
    if (reviews.length === 0) return
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length)
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1a5276] mb-3">
            TU SEGURIDAD ES NUESTRA PRIORIDAD
          </h2>
          <p className="text-gray-600">
            EXPERIENCIAS COMPARTIDAS POR NUESTROS CLIENTES
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-64 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="max-w-xl mx-auto rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-600">
            {error}
          </div>
        ) : reviews.length === 0 ? (
          <div className="max-w-xl mx-auto rounded-lg border border-blue-100 bg-blue-50 p-8 text-center">
            <MessageSquare className="w-10 h-10 text-[#1a5276] mx-auto mb-3" />
            <h3 className="font-semibold text-[#1a5276] mb-2">Aun no hay resenas reales publicadas</h3>
            <p className="text-sm text-gray-600">
              Cuando los usuarios dejen resenas de 4 o 5 estrellas, apareceran aqui.
            </p>
          </div>
        ) : (
          <div className="relative">
            <div className="hidden md:flex items-center justify-center gap-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevSlide}
                className="rounded-full border-2 border-gray-300 hover:border-[#1a5276] hover:bg-[#1a5276] hover:text-white"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <div className="flex gap-6">
                {visibleTestimonials.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={nextSlide}
                className="rounded-full border-2 border-gray-300 hover:border-[#1a5276] hover:bg-[#1a5276] hover:text-white"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            <div className="md:hidden">
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevSlide}
                  className="rounded-full border-2 border-gray-300"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>

                <ReviewCard review={reviews[currentIndex]} />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextSlide}
                  className="rounded-full border-2 border-gray-300"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex justify-center gap-2 mt-4">
                {reviews.map((review, index) => (
                  <button
                    key={review.id}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? "bg-[#1a5276]" : "bg-gray-300"
                    }`}
                    aria-label={`Ir a resena ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 h-2 bg-gradient-to-r from-[#1a5276] via-amber-400 to-[#1a5276]" />
    </section>
  )
}
