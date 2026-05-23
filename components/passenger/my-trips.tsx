"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Car, 
  Star, 
  Phone,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageSquare,
  RefreshCw
} from "lucide-react"
import { DriverReviewModal } from "./driver-review-modal"

interface DriverProfile {
  id: string
  full_name: string
  phone: string
  avatar_url: string | null
}

interface Driver {
  id: string
  vehicle_brand: string
  vehicle_model: string
  vehicle_year: number
  vehicle_color: string
  vehicle_plate: string
  rating: number
  total_trips: number
  profile: DriverProfile | null
}

interface Trip {
  id: string
  confirmation_code: string
  origin_address: string
  destination_address: string
  trip_date: string
  trip_time: string
  passengers: number
  service_type: string
  notes: string
  estimated_price: number
  final_price: number
  distance_km: number
  status: string
  created_at: string
  driver: Driver | null
}

interface MyTripsProps {
  onNewTrip: () => void
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { 
    label: "Pendiente", 
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: <AlertCircle className="w-4 h-4" />
  },
  confirmed: { 
    label: "Confirmado", 
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: <CheckCircle className="w-4 h-4" />
  },
  in_progress: { 
    label: "En Progreso", 
    color: "bg-green-100 text-green-800 border-green-300",
    icon: <Car className="w-4 h-4" />
  },
  completed: { 
    label: "Completado", 
    color: "bg-gray-100 text-gray-800 border-gray-300",
    icon: <CheckCircle className="w-4 h-4" />
  },
  cancelled: { 
    label: "Cancelado", 
    color: "bg-red-100 text-red-800 border-red-300",
    icon: <XCircle className="w-4 h-4" />
  }
}

export function MyTrips({ onNewTrip }: MyTripsProps) {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)

  const fetchTrips = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/trips")
      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
      } else {
        setTrips(data.trips || [])
      }
    } catch (err) {
      setError("Error al cargar los viajes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrips()
  }, [])

  const handleCancelTrip = async (tripId: string) => {
    if (!confirm("¿Estas seguro de que deseas cancelar este viaje?")) return
    
    setCancellingId(tripId)
    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "cancelled",
          cancellation_reason: "Cancelado por el pasajero"
        })
      })
      
      if (response.ok) {
        fetchTrips()
      } else {
        alert("Error al cancelar el viaje")
      }
    } catch (err) {
      alert("Error al cancelar el viaje")
    } finally {
      setCancellingId(null)
    }
  }

  const openReviewModal = (trip: Trip) => {
    setSelectedTrip(trip)
    setReviewModalOpen(true)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Sin fecha"
    const date = new Date(dateStr)
    return date.toLocaleDateString("es-NI", { 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Spinner className="w-8 h-8 text-[#1a5276]" />
        <p className="mt-4 text-gray-600">Cargando tus viajes...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchTrips} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reintentar
        </Button>
      </div>
    )
  }

  if (trips.length === 0) {
    return (
      <div className="text-center py-16">
        <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No tienes viajes registrados
        </h3>
        <p className="text-gray-500 mb-6">
          Reserva tu primer viaje con Pacific Coast Taxi
        </p>
        <Button onClick={onNewTrip} className="bg-[#1a5276] hover:bg-[#154360]">
          Reservar Viaje
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          Mis Viajes ({trips.length})
        </h2>
        <Button onClick={fetchTrips} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <div className="grid gap-6">
        {trips.map((trip) => {
          const status = statusConfig[trip.status] || statusConfig.pending
          
          return (
            <Card key={trip.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="font-mono text-[#1a5276]">
                        {trip.confirmation_code}
                      </span>
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Creado el {new Date(trip.created_at).toLocaleDateString("es-NI")}
                    </p>
                  </div>
                  <Badge className={`${status.color} flex items-center gap-1`}>
                    {status.icon}
                    {status.label}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Route */}
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div className="w-0.5 h-8 bg-gray-300" />
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{trip.origin_address}</p>
                    <p className="text-sm text-gray-500 my-2">
                      {trip.distance_km?.toFixed(1) || 0} km
                    </p>
                    <p className="font-medium text-gray-800">{trip.destination_address}</p>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{formatDate(trip.trip_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{trip.trip_time || "Sin hora"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{trip.passengers} pasajero(s)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#1a5276]">
                    <DollarSign className="w-4 h-4" />
                    <span>${(trip.final_price || trip.estimated_price || 0).toFixed(2)} USD</span>
                  </div>
                </div>

                {/* Driver Info */}
                {trip.driver && (
                  <div className="bg-gray-50 rounded-lg p-4 mt-4">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Car className="w-4 h-4" />
                      Conductor Asignado
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium text-gray-800">
                          {trip.driver.profile?.full_name || "Conductor"}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">{trip.driver.rating || 5.0}</span>
                          <span className="text-gray-500 text-sm">
                            ({trip.driver.total_trips || 0} viajes)
                          </span>
                        </div>
                        {trip.driver.profile?.phone && (
                          <a 
                            href={`tel:${trip.driver.profile.phone}`}
                            className="flex items-center gap-1 text-[#1a5276] hover:underline mt-2"
                          >
                            <Phone className="w-4 h-4" />
                            {trip.driver.profile.phone}
                          </a>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-600">
                          {trip.driver.vehicle_brand} {trip.driver.vehicle_model}
                        </p>
                        <p className="text-gray-600">
                          Color: {trip.driver.vehicle_color}
                        </p>
                        <p className="font-mono text-gray-800 mt-1">
                          Placa: {trip.driver.vehicle_plate}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  {(trip.status === "pending" || trip.status === "confirmed") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelTrip(trip.id)}
                      disabled={cancellingId === trip.id}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      {cancellingId === trip.id ? (
                        <Spinner className="w-4 h-4 mr-2" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      Cancelar Viaje
                    </Button>
                  )}
                  
                  {trip.status === "completed" && trip.driver && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openReviewModal(trip)}
                      className="text-[#1a5276] border-[#1a5276] hover:bg-blue-50"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Calificar Conductor
                    </Button>
                  )}
                </div>

                {trip.notes && (
                  <div className="text-sm text-gray-500 italic pt-2">
                    Nota: {trip.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Review Modal */}
      {selectedTrip && selectedTrip.driver && (
        <DriverReviewModal
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false)
            setSelectedTrip(null)
          }}
          tripId={selectedTrip.id}
          driverId={selectedTrip.driver.id}
          driverName={selectedTrip.driver.profile?.full_name || "Conductor"}
          onSuccess={() => {
            fetchTrips()
            setReviewModalOpen(false)
            setSelectedTrip(null)
          }}
        />
      )}
    </div>
  )
}
