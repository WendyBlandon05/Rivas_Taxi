"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const trips = [
  {
    id: 1,
    destination: "PLAYA GIGANTE",
    description: "LLEVAMOS A TU GRUPO CON CONFIANZA",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/shutterstock_2302840889-1024x683-JtrAP0TDPUjgaCTbuqhOFEkwLlMsUX.jpg"
  },
  {
    id: 2,
    destination: "PLAYA MADERAS",
    description: "SOMOS LA MEJOR OPCION PARA LOS MOCHILEROS",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/img_blog_chica_isla_saona_playa_caribe_710x300-CKwOkw7I0ABzTLmINrudmhqeMy1hzo.jpg"
  },
  {
    id: 3,
    destination: "SAN JUAN DEL SUR",
    description: "TU FAMILIA MERECE VIAJAR CON SEGURIDAD",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/img_blog_familia_posando_playa_caribe_710x300-k47IcOmQYH84lMO2pXXB6JpCxJ3EbM.jpg"
  },
  {
    id: 4,
    destination: "GRANADA",
    description: "TRASLADAMOS A TU GRUPO POR EL PACIFICO",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cordoba-viajes-personas-mayores-BXXhZwBk4OP0X10ULS5mVlxE6uTDLW.jpeg"
  }
]

export function RecentTrips() {
  const [startIndex, setStartIndex] = useState(0)

  const nextSlide = () => {
    setStartIndex((prev) => (prev + 1) % trips.length)
  }

  const prevSlide = () => {
    setStartIndex((prev) => (prev - 1 + trips.length) % trips.length)
  }

  const getVisibleTrips = () => {
    const visible = []
    for (let i = 0; i < 4; i++) {
      visible.push(trips[(startIndex + i) % trips.length])
    }
    return visible
  }

  return (
    <section className="py-16 bg-[#e8f4f8]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1a5276] mb-3">
            VIAJES RECIENTES
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            CADA SERVICIO REALIZADO REFLEJA NUESTRO COMPROMISO CON SEGURIDAD, PUNTUALIDAD Y CONFIANZA
          </p>
        </div>

        <div className="relative">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevSlide}
              className="hidden md:flex rounded-full border-2 border-gray-300 hover:border-[#1a5276] hover:bg-[#1a5276] hover:text-white"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 max-w-6xl">
              {getVisibleTrips().map((trip, index) => (
                <div
                  key={`${trip.id}-${index}`}
                  className="relative group rounded-2xl overflow-hidden shadow-lg cursor-pointer bg-gray-200"
                  style={{ height: "280px" }}
                >
                  <img
                    src={trip.image}
                    alt={trip.destination}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                    <h3 className="text-amber-400 font-bold text-lg mb-1">
                      {trip.destination}
                    </h3>
                    <p className="text-white text-xs uppercase tracking-wide">
                      {trip.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={nextSlide}
              className="hidden md:flex rounded-full border-2 border-gray-300 hover:border-[#1a5276] hover:bg-[#1a5276] hover:text-white"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden justify-center gap-4 mt-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevSlide}
              className="rounded-full border-2 border-gray-300"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
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
          <div className="flex justify-center gap-2 mt-6">
            {trips.map((_, index) => (
              <button
                key={index}
                onClick={() => setStartIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === startIndex ? "bg-[#1a5276]" : "bg-gray-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
