"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, ChevronLeft, ChevronRight, Clock, MapPin, ShieldCheck, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

const trips = [
  {
    id: 1,
    destination: "PLAYA GIGANTE",
    description: "Traslados comodos para grupos que buscan playa, descanso y una ruta segura.",
    service: "Servicio turistico",
    duration: "55 min aprox.",
    passengers: "Hasta 8 pasajeros",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/shutterstock_2302840889-1024x683-JtrAP0TDPUjgaCTbuqhOFEkwLlMsUX.jpg",
  },
  {
    id: 2,
    destination: "PLAYA MADERAS",
    description: "Una ruta ideal para surfistas, mochileros y viajeros que quieren llegar sin complicaciones.",
    service: "Traslado local",
    duration: "40 min aprox.",
    passengers: "Viajes privados",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/img_blog_chica_isla_saona_playa_caribe_710x300-CKwOkw7I0ABzTLmINrudmhqeMy1hzo.jpg",
  },
  {
    id: 3,
    destination: "SAN JUAN DEL SUR",
    description: "Servicio familiar con conductores verificados y seguimiento de la reserva.",
    service: "Destino destacado",
    duration: "35 min aprox.",
    passengers: "Familias y grupos",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/img_blog_familia_posando_playa_caribe_710x300-k47IcOmQYH84lMO2pXXB6JpCxJ3EbM.jpg",
  },
  {
    id: 4,
    destination: "GRANADA",
    description: "Viajes interdepartamentales para conectar Rivas con uno de los destinos mas visitados.",
    service: "Interdepartamental",
    duration: "1 h 30 min aprox.",
    passengers: "Ruta programada",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cordoba-viajes-personas-mayores-BXXhZwBk4OP0X10ULS5mVlxE6uTDLW.jpeg",
  },
]

export function RecentTrips() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const activeTrip = trips[activeIndex]
  const nextTrip = trips[(activeIndex + 1) % trips.length]

  useEffect(() => {
    if (isPaused) return

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % trips.length)
    }, 5500)

    return () => window.clearInterval(timer)
  }, [isPaused])

  const progressKey = useMemo(() => `${activeTrip.id}-${isPaused ? "paused" : "playing"}`, [activeTrip.id, isPaused])

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % trips.length)
  }

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + trips.length) % trips.length)
  }

  return (
    <section className="py-16 bg-[#e8f4f8]">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1a5276] mb-3">
              VIAJES RECIENTES
            </h2>
            <p className="text-gray-600 text-sm md:text-base max-w-2xl">
              RUTAS FRECUENTES CON SERVICIO SEGURO, PUNTUAL Y ACOMPANAMIENTO DURANTE LA RESERVA
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="rounded-full border-[#1a5276]/30 text-[#1a5276] hover:bg-[#1a5276] hover:text-white"
              aria-label="Viaje anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="rounded-full border-[#1a5276]/30 text-[#1a5276] hover:bg-[#1a5276] hover:text-white"
              aria-label="Viaje siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div
          className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative min-h-[460px] overflow-hidden rounded-lg bg-[#0d2d44] shadow-xl">
            <img
              key={activeTrip.id}
              src={activeTrip.image}
              alt={activeTrip.destination}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-105"
              crossOrigin="anonymous"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d2d44]/95 via-[#0d2d44]/55 to-black/10" />
            <div className="absolute inset-x-0 top-0 h-1 bg-white/20">
              <div
                key={progressKey}
                className={`h-full bg-amber-400 ${isPaused ? "" : "animate-[trip-progress_5.5s_linear_forwards]"}`}
              />
            </div>

            <div className="relative z-10 flex min-h-[460px] max-w-2xl flex-col justify-end p-6 md:p-10">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white backdrop-blur">
                <MapPin className="h-4 w-4 text-amber-300" />
                {activeTrip.service}
              </div>

              <h3 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                {activeTrip.destination}
              </h3>
              <p className="mt-4 max-w-xl text-base md:text-lg text-white/85">
                {activeTrip.description}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-white/12 p-3 text-white backdrop-blur">
                  <Clock className="mb-2 h-5 w-5 text-amber-300" />
                  <p className="text-xs text-white/65">Duracion</p>
                  <p className="font-semibold">{activeTrip.duration}</p>
                </div>
                <div className="rounded-lg bg-white/12 p-3 text-white backdrop-blur">
                  <Users className="mb-2 h-5 w-5 text-amber-300" />
                  <p className="text-xs text-white/65">Modalidad</p>
                  <p className="font-semibold">{activeTrip.passengers}</p>
                </div>
                <div className="rounded-lg bg-white/12 p-3 text-white backdrop-blur">
                  <ShieldCheck className="mb-2 h-5 w-5 text-amber-300" />
                  <p className="text-xs text-white/65">Seguridad</p>
                  <p className="font-semibold">Conductor verificado</p>
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href={`/trips?service=turistico`}>
                  <Button className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white">
                    Reservar esta ruta
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="text-left text-sm font-medium text-white/80 hover:text-white"
                >
                  Siguiente: {nextTrip.destination}
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {trips.map((trip, index) => {
              const isActive = index === activeIndex

              return (
                <button
                  key={trip.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`group grid grid-cols-[92px_1fr] gap-3 rounded-lg border bg-white p-2 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                    isActive ? "border-[#1a5276] ring-2 ring-[#1a5276]/15" : "border-transparent"
                  }`}
                >
                  <div className="relative h-20 overflow-hidden rounded-md bg-gray-200">
                    <img
                      src={trip.image}
                      alt={trip.destination}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div className="min-w-0 py-1">
                    <p className="text-xs font-semibold text-amber-600">{trip.service}</p>
                    <h4 className="truncate font-bold text-[#1a5276]">{trip.destination}</h4>
                    <p className="mt-1 line-clamp-2 text-xs text-gray-600">{trip.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {trips.map((trip, index) => (
            <button
              key={trip.id}
              onClick={() => setActiveIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === activeIndex ? "w-8 bg-[#1a5276]" : "w-2 bg-gray-400"
              }`}
              aria-label={`Ir a ${trip.destination}`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes trip-progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </section>
  )
}
