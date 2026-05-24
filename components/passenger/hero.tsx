"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"

export function Hero() {
  const { t } = useLanguage()

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sddefault-s67OlZY118IKdFEWF1WRgizL15PdJv.jpg"
          alt="San Juan del Sur, Nicaragua"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a5276]/80 via-[#1a5276]/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            <span className="block">{t("hero.title1")}</span>
            <span className="block">{t("hero.title2")}</span>
            <span className="block">{t("hero.title3")}</span>
            <span className="block text-amber-400">{t("hero.title4")}</span>
          </h1>
          
          <p className="text-white/90 text-lg md:text-xl mb-8 max-w-lg">
            {t("hero.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/trips">
              <Button 
                size="lg" 
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-6 text-lg rounded-lg w-full sm:w-auto"
              >
                {t("hero.bookNow")}
              </Button>
            </Link>
            <Link href="#servicios">
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold px-8 py-6 text-lg rounded-lg w-full sm:w-auto"
              >
                {t("hero.viewServices")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
