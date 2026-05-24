"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star, Car, User } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

interface DriverReviewModalProps {
  isOpen: boolean
  onClose: () => void
  tripId: string
  driverId: string
  driverName: string
  initialRating?: number
  initialComment?: string
  onSuccess: () => void
}

export function DriverReviewModal({
  isOpen,
  onClose,
  tripId,
  driverId,
  driverName,
  initialRating = 5,
  initialComment = "",
  onSuccess
}: DriverReviewModalProps) {
  const [rating, setRating] = useState(initialRating)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState(initialComment)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setRating(initialRating)
    setComment(initialComment)
    setHoveredRating(0)
    setError("")
    setSuccess(false)
  }, [isOpen, initialRating, initialComment])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError("")
    
    try {
      const response = await fetch("/api/driver-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverId,
          tripId,
          rating,
          comment: comment.trim() || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al enviar la resena")
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar la resena")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = () => {
    return (
      <div className="flex gap-2 justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-10 h-10 ${
                star <= (hoveredRating || rating)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  const getRatingLabel = () => {
    const labels: Record<number, string> = {
      1: "Muy malo",
      2: "Malo",
      3: "Regular",
      4: "Bueno",
      5: "Excelente"
    }
    return labels[hoveredRating || rating]
  }

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-green-600 fill-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Gracias por tu resena!
            </h3>
            <p className="text-gray-600">
              Tu calificacion ayuda a mejorar nuestro servicio.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Calificar Conductor</DialogTitle>
          <DialogDescription className="text-center">
            Como fue tu experiencia con este conductor?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Driver Info */}
          <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
            <div className="w-14 h-14 bg-[#1a5276] rounded-full flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">
                {driverName}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Car className="w-4 h-4" />
                <span>Pacific Coast Taxi</span>
              </div>
            </div>
          </div>

          {/* Rating Stars */}
          <div className="text-center">
            <Label className="text-sm text-gray-600 mb-3 block">
              Tu calificacion
            </Label>
            {renderStars()}
            <p className="mt-2 text-lg font-medium text-[#1a5276]">
              {getRatingLabel()}
            </p>
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment" className="text-sm text-gray-600">
              Comentario (opcional)
            </Label>
            <Textarea
              id="comment"
              placeholder="Cuentanos mas sobre tu experiencia..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-[#1a5276] hover:bg-[#154360]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Enviando...
                </>
              ) : (
                "Enviar Resena"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
