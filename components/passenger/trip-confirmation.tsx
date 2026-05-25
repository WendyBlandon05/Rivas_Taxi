"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { CheckCircle, MapPin, Calendar, Clock, Users, Car, Phone, User, Navigation, Share2, Download, XCircle, AlertTriangle, Star, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import type { TripData } from "@/app/trips/page"

const CANCELLATION_REASONS = [
  { id: "plans_changed", label: "Mis planes cambiaron" },
  { id: "found_alternative", label: "Encontre otra alternativa de transporte" },
  { id: "wrong_details", label: "Ingrese datos incorrectos" },
  { id: "price_too_high", label: "El precio es muy alto" },
  { id: "emergency", label: "Tengo una emergencia" },
  { id: "other", label: "Otro motivo" }
]

// Dynamically import the map to avoid SSR issues
const TripMap = dynamic(() => import("./trip-map").then(mod => mod.TripMap), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Cargando mapa...</p>
    </div>
  )
})

interface TripConfirmationProps {
  tripData: TripData
  onNewTrip: () => void
}

export function TripConfirmation({ tripData, onNewTrip }: TripConfirmationProps) {
  const [showMap, setShowMap] = useState(true)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelNotes, setCancelNotes] = useState("")
  const [isCancelling, setIsCancelling] = useState(false)
  const [isCancelled, setIsCancelled] = useState(false)
  
  // Use the confirmation code from the trip data or generate one
  const confirmationCode = tripData.confirmationCode || `PCT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  
  // Check if driver is assigned
  const hasDriver = !!tripData.driver || tripData.driverAssigned
  
  // Estimated arrival time based on distance
  const estimatedTime = tripData.distanceKm 
    ? `${Math.round(tripData.distanceKm * 1.5)}-${Math.round(tripData.distanceKm * 2)} minutos`
    : "25-35 minutos"

  const handleCancelTrip = async () => {
    if (!cancelReason) return
    setIsCancelling(true)
    
    try {
      if (tripData.id) {
        const response = await fetch(`/api/trips/${tripData.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "cancelled",
            cancellation_reason: cancelReason === "other" ? cancelNotes : CANCELLATION_REASONS.find(r => r.id === cancelReason)?.label
          })
        })
        
        if (!response.ok) {
          const data = await response.json().catch(() => null)
          throw new Error(data?.error || "Error al cancelar el viaje")
        }
      }
      
      setIsCancelled(true)
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al cancelar el viaje. Por favor intenta de nuevo.")
    } finally {
      setIsCancelling(false)
      setShowCancelDialog(false)
    }
  }

  const handleShare = async () => {
    const shareText = `Viaje reservado de ${tripData.origin} a ${tripData.destination}. Codigo: ${confirmationCode}`
    const shareData = {
      title: "Mi viaje con Pacific Coast Taxi",
      text: shareText,
      url: window.location.href
    }
    
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch {
        return
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareData.url}`)
      alert("Enlace copiado al portapapeles")
    } catch {
      alert(`${shareText}\n${shareData.url}`)
    }
  }

  const handleDownloadReceipt = () => {
    const lines = [
      "PACIFIC COAST TAXI",
      "Comprobante de reservacion",
      "",
      `Codigo: ${confirmationCode}`,
      `Estado: ${tripData.status === "confirmed" ? "Confirmado" : "Pendiente"}`,
      `Pasajero: ${tripData.name}`,
      `Telefono: ${tripData.phone}`,
      `Origen: ${tripData.origin}`,
      `Destino: ${tripData.destination}`,
      `Fecha: ${tripData.date}`,
      `Hora: ${tripData.time}`,
      `Pasajeros: ${tripData.passengers}`,
      `Distancia: ${tripData.distanceKm || 0} km`,
      `Precio estimado: $${(tripData.estimatedPrice || 0).toFixed(2)} USD`,
      `Precio final: $${(tripData.finalPrice || tripData.estimatedPrice || 0).toFixed(2)} USD`,
      tripData.driver ? `Conductor: ${tripData.driver.name || "Conductor asignado"}` : "Conductor: Pendiente de asignacion",
      "",
      "Gracias por reservar con Pacific Coast Taxi."
    ]

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `comprobante-${confirmationCode}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (isCancelled) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-700 mb-2">Viaje Cancelado</h2>
          <p className="text-red-600 mb-4">Tu reservacion ha sido cancelada exitosamente</p>
          <div className="bg-white rounded-lg p-4 inline-block">
            <p className="text-sm text-gray-500 mb-1">Codigo de Reservacion</p>
            <p className="text-xl font-bold text-gray-400 tracking-wider line-through">{confirmationCode}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow text-center">
          <p className="text-gray-600 mb-4">
            Lamentamos que hayas tenido que cancelar tu viaje. Si necesitas ayuda o quieres reprogramar, no dudes en contactarnos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onNewTrip}
              className="bg-[#1a5276] hover:bg-[#154360] text-white"
            >
              Reservar nuevo viaje
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = "https://wa.me/50577502626"}
            >
              Contactar soporte
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success Banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-green-700 mb-2">
          {tripData.status === "confirmed" ? "Reservacion Confirmada" : "Reservacion Pendiente"}
        </h2>
        <p className="text-green-600 mb-4">
          {hasDriver 
            ? "Tu viaje ha sido reservado y un conductor ha sido asignado"
            : "Tu viaje ha sido registrado. Estamos buscando un conductor disponible."
          }
        </p>
        <div className="bg-white rounded-lg p-4 inline-block">
          <p className="text-sm text-gray-500 mb-1">Codigo de Confirmacion</p>
          <p className="text-3xl font-bold text-[#1a5276] tracking-wider">{confirmationCode}</p>
        </div>
        {tripData.finalPrice && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-2xl font-bold text-green-700">${tripData.finalPrice.toFixed(2)} USD</span>
          </div>
        )}
      </div>

      {/* Driver Info Card */}
      {hasDriver && tripData.driver && (
        <div className="shadow-lg border-2 border-amber-200 rounded-lg overflow-hidden bg-white">
          <div className="bg-amber-500 text-white px-6 py-4">
            <h3 className="flex items-center gap-2 font-semibold text-lg">
              <Car className="w-5 h-5" />
              Tu Conductor Asignado
            </h3>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-[#1a5276] overflow-hidden border-4 border-amber-400 flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                  Verificado
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-[#1a5276]">
                  {tripData.driver.profile?.full_name || "Conductor Asignado"}
                </h3>
                <div className="flex items-center justify-center md:justify-start gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${
                        i < Math.floor(tripData.driver!.rating || 5) 
                          ? 'text-amber-400 fill-amber-400' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">
                    {tripData.driver.rating || 5.0} ({tripData.driver.total_trips || 0} viajes)
                  </span>
                </div>
                {tripData.driver.profile?.phone && (
                  <a href={`tel:${tripData.driver.profile.phone}`} className="inline-flex items-center gap-2 mt-2 text-[#1a5276] hover:text-amber-500 transition-colors">
                    <Phone className="w-4 h-4" />
                    {tripData.driver.profile.phone}
                  </a>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500 mb-1">Vehiculo</p>
                <p className="font-semibold text-[#1a5276]">
                  {tripData.driver.vehicle_brand} {tripData.driver.vehicle_model}
                </p>
                <p className="text-sm text-gray-600">{tripData.driver.vehicle_color}</p>
                <div className="mt-2 bg-[#1a5276] text-white px-4 py-2 rounded-lg font-mono text-lg font-bold">
                  {tripData.driver.vehicle_plate}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Driver Assigned */}
      {!hasDriver && (
        <div className="shadow-lg border-2 border-yellow-200 rounded-lg overflow-hidden bg-yellow-50">
          <div className="p-6 text-center">
            <Spinner className="w-8 h-8 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Buscando Conductor Disponible
            </h3>
            <p className="text-yellow-700">
              Estamos asignando el mejor conductor para tu viaje. 
              Te notificaremos cuando uno sea asignado.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trip Details */}
        <div className="shadow-lg rounded-lg overflow-hidden bg-white border">
          <div className="bg-[#1a5276] text-white px-6 py-4">
            <h3 className="flex items-center gap-2 font-semibold text-lg">
              <Car className="w-5 h-5" />
              Detalles del Viaje
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Pasajero</p>
                <p className="font-medium">{tripData.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Telefono</p>
                <p className="font-medium">{tripData.phone}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-start gap-3 mb-3">
                <MapPin className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Origen</p>
                  <p className="font-medium">{tripData.origin}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Destino</p>
                  <p className="font-medium">{tripData.destination}</p>
                </div>
              </div>
              
              {tripData.distanceKm && (
                <p className="text-sm text-gray-500 mt-2 ml-8">
                  Distancia: {tripData.distanceKm.toFixed(1)} km
                </p>
              )}
            </div>

            <div className="border-t pt-4 grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="font-medium">
                    {new Date(tripData.date).toLocaleDateString('es-NI', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Hora</p>
                  <p className="font-medium">{tripData.time}</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Pasajeros</p>
                <p className="font-medium">{tripData.passengers} {tripData.passengers === 1 ? "persona" : "personas"}</p>
              </div>
            </div>

            {tripData.notes && (
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-1">Notas adicionales</p>
                <p className="text-gray-700 bg-gray-50 rounded p-3 text-sm">{tripData.notes}</p>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="w-5 h-5 text-amber-600" />
                <p className="font-semibold text-amber-800">Tiempo estimado de llegada</p>
              </div>
              <p className="text-2xl font-bold text-[#1a5276]">{estimatedTime}</p>
              <p className="text-xs text-gray-500 mt-1">*Sujeto a condiciones del trafico</p>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="shadow-lg rounded-lg overflow-hidden bg-white border">
          <div className="bg-[#1a5276] text-white px-6 py-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-lg">
              <MapPin className="w-5 h-5" />
              Ruta del Viaje
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMap(!showMap)}
              className="text-white hover:bg-white/20"
            >
              {showMap ? "Ocultar" : "Mostrar"}
            </Button>
          </div>
          <div className="p-4">
            {showMap && (
              <TripMap 
                origin={tripData.origin} 
                destination={tripData.destination} 
              />
            )}
            <p className="text-xs text-gray-500 mt-3 text-center">
              Podras ver la ubicacion del conductor en tiempo real durante tu viaje
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={handleShare}
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Compartir detalles
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadReceipt}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Descargar comprobante
          </Button>
          <Button
            onClick={onNewTrip}
            className="bg-[#1a5276] hover:bg-[#154360] text-white"
          >
            Reservar otro viaje
          </Button>
        </div>
        
        {/* Cancel Trip Button */}
        <div className="flex justify-center pt-2 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => setShowCancelDialog(true)}
            className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Cancelar viaje
          </Button>
        </div>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Cancelar Reservacion
            </DialogTitle>
            <DialogDescription>
              Por favor, selecciona el motivo de la cancelacion. Esto nos ayuda a mejorar nuestro servicio.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <RadioGroup value={cancelReason} onValueChange={setCancelReason}>
              {CANCELLATION_REASONS.map((reason) => (
                <div key={reason.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason.id} id={reason.id} />
                  <Label htmlFor={reason.id} className="cursor-pointer">{reason.label}</Label>
                </div>
              ))}
            </RadioGroup>
            
            {cancelReason === "other" && (
              <Textarea
                placeholder="Por favor, describe el motivo..."
                value={cancelNotes}
                onChange={(e) => setCancelNotes(e.target.value)}
                className="mt-2"
              />
            )}
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
            <p className="text-amber-800">
              <strong>Nota:</strong> Si cancelas con menos de 2 horas de anticipacion, podria aplicarse un cargo por cancelacion tardia.
            </p>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Volver
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelTrip}
              disabled={!cancelReason || isCancelling}
            >
              {isCancelling ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Cancelando...
                </>
              ) : (
                "Confirmar Cancelacion"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Info */}
      <div className="text-center text-gray-600 text-sm bg-white rounded-lg p-6 shadow">
        <p className="mb-2">Tienes alguna pregunta sobre tu reservacion?</p>
        <p className="font-semibold text-[#1a5276]">
          Llamanos al <a href="https://wa.me/50577502626" target="_blank" className="text-amber-500 hover:underline">+505 7750-2626</a> o escribenos por WhatsApp
        </p>
      </div>
    </div>
  )
}
