"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Car } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

const services = [
  {
    id: 1,
    serviceId: "urbano",
    titleKey: "services.urbano.title",
    descriptionKey: "services.urbano.description"
  },
  {
    id: 2,
    serviceId: "turistico",
    titleKey: "services.turistico.title",
    descriptionKey: "services.turistico.description"
  },
  {
    id: 3,
    serviceId: "empresarial",
    titleKey: "services.empresarial.title",
    descriptionKey: "services.empresarial.description"
  }
]

// Imagen de viajeros con maletas
const travelerImage = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/transparent-Photoroom%20%284%29-GCgWzYLeTOHVONJ3lvicSwkhp1XsZx.png"

export function Services() {
  const { t } = useLanguage()

  return (
    <section id="servicios" className="py-16 bg-[#1a5276]">
      {/* Decorative top bar */}
      <div className="h-3 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 -mt-16 mb-16" />

      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            {t("services.title")}
          </h2>
          <p className="text-white/80 text-sm md:text-base">
            {t("services.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {services.map((service) => (
            <Card 
              key={service.id} 
              className="bg-white rounded-xl overflow-hidden border-0 shadow-lg flex flex-col h-full transition-transform duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
            >
              <CardContent className="pt-8 pb-4 text-center flex-grow flex flex-col">
                <div className="relative w-24 h-24 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center overflow-hidden">
                  <img
                    src={travelerImage}
                    alt="Viajeros"
                    className="w-20 h-20 object-contain"
                    crossOrigin="anonymous"
                  />
                </div>
                <h3 className="text-[#1a5276] font-bold text-sm mb-2">
                  {t(service.titleKey)}
                </h3>
                <p className="text-gray-600 text-xs px-2 flex-grow">
                  {t(service.descriptionKey)}
                </p>
              </CardContent>
              <CardFooter className="pb-6 pt-2 justify-center mt-auto">
                <Link href={`/trips?service=${service.serviceId}`}>
                  <Button className="bg-amber-500 hover:bg-[#1a5276] text-white text-xs px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-300">
                    <Car className="w-4 h-4" />
                    {t("hero.bookNow")}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
