"use client"

import { useState } from "react"
import { Star, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createReview } from "@/hooks/use-reviews"

interface DriverReviewFormProps {
  driverId: string
  driverName: string
  tripId?: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function DriverReviewForm({ 
  driverId, 
  driverName, 
  tripId, 
  isOpen, 
  onClose,
  onSuccess 
}: DriverReviewFormProps) {
  const [rating, setRating] = useState(5)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (rating < 1) {
      setError("Por favor selecciona una calificacion")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const result = await createReview({
        driverId,
        tripId,
        rating,
        comment: comment.trim() || undefined,
        isDriverReview: true
      })

      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
        return
      }

      // Reset form
      setRating(5)
      setComment("")
      onSuccess?.()
      onClose()
    } catch (err) {
      setError("Error al enviar la resena. Intenta de nuevo.")
    }

    setIsSubmitting(false)
  }

  const displayRating = hoveredRating || rating

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#1a5276]">Calificar a {driverName}</DialogTitle>
          <DialogDescription>
            Tu opinion nos ayuda a mejorar el servicio
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Star Rating */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Selecciona tu calificacion</p>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= displayRating
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-lg font-semibold text-[#1a5276] mt-2">
              {displayRating === 1 && "Muy malo"}
              {displayRating === 2 && "Malo"}
              {displayRating === 3 && "Regular"}
              {displayRating === 4 && "Bueno"}
              {displayRating === 5 && "Excelente"}
            </p>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Comentario (opcional)
            </label>
            <Textarea
              placeholder="Cuentanos sobre tu experiencia con el conductor..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-[#1a5276] hover:bg-[#154360] text-white"
          >
            {isSubmitting ? (
              "Enviando..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar Resena
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
