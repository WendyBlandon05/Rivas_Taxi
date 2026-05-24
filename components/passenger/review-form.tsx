"use client"

import { useState } from "react"
import { Star, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ReviewFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (review: { rating: number; comment: string }) => void
}

export function ReviewForm({ isOpen, onClose, onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Por favor selecciona una calificacion")
      return
    }
    if (!comment.trim()) {
      setError("Por favor escribe un comentario")
      return
    }

    setIsSubmitting(true)
    setError("")
    
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
          isDriverReview: false,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "No se pudo enviar la resena")
      }

      onSubmit({ rating, comment })
      setSubmitted(true)

      setTimeout(() => {
        setSubmitted(false)
        setRating(0)
        setComment("")
        onClose()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar la resena")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {!submitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-[#1a5276] flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                Deja tu Resena
              </DialogTitle>
              <DialogDescription>
                Tu opinion es muy importante para nosotros. Cuentanos como fue tu experiencia con Pacific Coast Taxi.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Star Rating */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">Califica tu experiencia</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 transition-colors ${
                          star <= (hoverRating || rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-amber-600 mt-2 font-medium">
                    {rating === 1 && "Muy malo"}
                    {rating === 2 && "Malo"}
                    {rating === 3 && "Regular"}
                    {rating === 4 && "Bueno"}
                    {rating === 5 && "Excelente"}
                  </p>
                )}
              </div>

              {/* Comment */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Tu comentario
                </label>
                <Textarea
                  placeholder="Cuentanos sobre tu experiencia..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[120px] resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {comment.length}/500 caracteres
                </p>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-amber-500 hover:bg-[#1a5276] text-white"
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
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-green-500 fill-green-500" />
            </div>
            <h3 className="text-xl font-bold text-[#1a5276] mb-2">
              Gracias por tu resena
            </h3>
            <p className="text-gray-600">
              Tu opinion nos ayuda a mejorar nuestro servicio
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
