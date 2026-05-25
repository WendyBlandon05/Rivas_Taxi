"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { X, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function PromotionsPopup() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isLoading) return

    const today = new Date().toISOString().slice(0, 10)
    const storageKey = user ? `pctPromoSeen:${user.id}:${today}` : `pctGuestPromoSeen:${today}`
    const hasSeenPromo = localStorage.getItem(storageKey)

    if (hasSeenPromo) return

    const timer = setTimeout(() => {
      setIsOpen(true)
      localStorage.setItem(storageKey, "true")
    }, 1800)

    return () => clearTimeout(timer)
  }, [isLoading, user])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-1.5 hover:bg-white transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="relative h-40">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sddefault-s67OlZY118IKdFEWF1WRgizL15PdJv.jpg"
            alt="Promocion especial"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a5276] to-transparent" />
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <Gift className="w-8 h-8 text-amber-400" />
            <span className="text-white font-bold text-xl">OFERTA ESPECIAL</span>
          </div>
        </div>

        <div className="p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#1a5276] text-2xl font-bold text-center">
              20% DE DESCUENTO
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4 text-center">
            <p className="text-gray-600 mb-2">
              En tu primer viaje con Pacific Coast Taxi
            </p>
            <div className="bg-amber-100 rounded-lg p-4 my-4">
              <p className="text-sm text-gray-600 mb-1">Usa el codigo:</p>
              <p className="text-2xl font-bold text-[#1a5276] tracking-wider">
                BIENVENIDO20
              </p>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Valido para viajes dentro de Rivas. Promocion por tiempo limitado.
            </p>
            
            <div className="flex flex-col gap-2">
              <Button 
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold"
                onClick={() => {
                  setIsOpen(false)
                  router.push("/trips?coupon=BIENVENIDO20")
                }}
              >
                RESERVAR AHORA
              </Button>
              <Button 
                variant="ghost" 
                className="text-gray-500"
                onClick={() => setIsOpen(false)}
              >
                Tal vez mas tarde
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
