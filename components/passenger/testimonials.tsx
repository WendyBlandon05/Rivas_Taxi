"use client"

import { useState } from "react"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const testimonials = [
  {
    id: 1,
    rating: 5,
    text: "Muy buena atencion al cliente, responden rapido y cumplen con lo prometido.",
    email: "maria.lopez@gmail.com",
    name: "Maria Lopez"
  },
  {
    id: 2,
    rating: 5,
    text: "Excelente servicio, el conductor llego puntual y el viaje fue muy comodo.",
    email: "carlos.martinez@hotmail.com",
    name: "Carlos Martinez"
  },
  {
    id: 3,
    rating: 5,
    text: "Reservar fue facil y recibi confirmacion. Sin duda volveria a usar Pacific Coast.",
    email: "ana.garcia@yahoo.com",
    name: "Ana Garcia"
  },
  {
    id: 4,
    rating: 5,
    text: "Viajamos en familia a San Juan del Sur y el servicio fue increible. Conductor muy amable.",
    email: "roberto.perez@outlook.com",
    name: "Roberto Perez"
  },
  {
    id: 5,
    rating: 5,
    text: "Los mejores precios de la zona y vehiculos muy limpios. Totalmente recomendado.",
    email: "lucia.hernandez@gmail.com",
    name: "Lucia Hernandez"
  }
]

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const itemsPerPage = 3

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const getVisibleTestimonials = () => {
    const visible = []
    for (let i = 0; i < itemsPerPage; i++) {
      visible.push(testimonials[(currentIndex + i) % testimonials.length])
    }
    return visible
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1a5276] mb-3">
            TU SEGURIDAD ES NUESTRA PRIORIDAD
          </h2>
          <p className="text-gray-600">
            LA SATISFACCION DE NUESTROS CLIENTES ES NUESTRA MEJOR REFERENCIA
          </p>
        </div>

        <div className="relative">
          {/* Desktop View - Show all cards */}
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
              {getVisibleTestimonials().map((testimonial, index) => (
                <Card key={`${testimonial.id}-${index}`} className="w-80 shadow-lg border-0 bg-gradient-to-b from-amber-50 to-white">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 text-sm mb-4 min-h-[60px]">
                      {`"${testimonial.text}"`}
                    </p>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1a5276] to-amber-500 flex items-center justify-center text-white font-bold text-lg">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div className="text-center">
                        <p className="text-[#1a5276] font-semibold text-sm">{testimonial.name}</p>
                        <p className="text-gray-500 text-xs">{testimonial.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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

          {/* Mobile View - Show one card at a time */}
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

              <Card className="w-full max-w-sm shadow-lg border-0 bg-gradient-to-b from-amber-50 to-white">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center gap-1 mb-4">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm mb-4">
                    {`"${testimonials[currentIndex].text}"`}
                  </p>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1a5276] to-amber-500 flex items-center justify-center text-white font-bold text-lg">
                      {testimonials[currentIndex].name.charAt(0)}
                    </div>
                    <div className="text-center">
                      <p className="text-[#1a5276] font-semibold text-sm">{testimonials[currentIndex].name}</p>
                      <p className="text-gray-500 text-xs">{testimonials[currentIndex].email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                variant="ghost"
                size="icon"
                onClick={nextSlide}
                className="rounded-full border-2 border-gray-300"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Dots indicator */}
            <div className="flex justify-center gap-2 mt-4">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? "bg-[#1a5276]" : "bg-gray-300"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Decorative line */}
      <div className="mt-12 h-2 bg-gradient-to-r from-[#1a5276] via-amber-400 to-[#1a5276]" />
    </section>
  )
}
