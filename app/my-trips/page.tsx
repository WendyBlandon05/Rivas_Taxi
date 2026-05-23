"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Car, Calendar, Clock, MapPin, Users, ChevronRight, History, CalendarClock, AlertCircle, Plus, Star, RefreshCw, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { DriverReviewModal } from "@/components/passenger/driver-review-modal"

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
  status: string
  estimated_price: number
  final_price: number
  discount_code: string | null
  discount_amount: number
  passenger_name: string
  passenger_phone: string
  driver_id: string | null
  driver: Driver | null
  created_at: string
}

export default function MyTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const [reviewTrip, setReviewTrip] = useState<Trip | null>(null)

  // Check if user has email stored
  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail")
    if (storedEmail) {
      setEmail(storedEmail)
      setEmailSubmitted(true)
      fetchTrips(storedEmail)
    }
  }, [])

  const fetchTrips = async (userEmail: string) => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch(`/api/trips?email=${encodeURIComponent(userEmail)}`)
      const data = await response.json()
      
      if (response.ok) {
        setTrips(data.trips || [])
        localStorage.setItem("userEmail", userEmail)
      } else {
        setError(data.error || "Error al cargar viajes")
      }
    } catch (err) {
      setError("Error de conexion")
    }
    setLoading(false)
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setEmailSubmitted(true)
      fetchTrips(email)
    }
  }

  const handleCancelTrip = async (tripId: string) => {
    if (!confirm("¿Estas seguro de que deseas cancelar este viaje?")) return
    
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
        fetchTrips(email)
      }
    } catch (err) {
      console.error("Error cancelling trip:", err)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Confirmado</span>
      case "pending":
        return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">Pendiente</span>
      case "in_progress":
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">En Progreso</span>
      case "completed":
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">Completado</span>
      case "cancelled":
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">Cancelado</span>
      default:
        return null
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Sin fecha"
    return new Date(dateStr).toLocaleDateString('es-NI', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const upcomingTrips = trips.filter(t => ['pending', 'confirmed', 'in_progress'].includes(t.status))
  const pastTrips = trips.filter(t => ['completed', 'cancelled'].includes(t.status))

  // Email input form
  if (!emailSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-[#1a5276] text-white py-8">
          <div className="container mx-auto px-4">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-lg">PACIFIC COAST TAXI</span>
            </Link>
            <h1 className="text-3xl font-bold mt-4">Mis Viajes</h1>
            <p className="text-blue-100 mt-1">Ingresa tu correo para ver tus viajes</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo electronico
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-[#1a5276] hover:bg-[#154360]">
                  Ver mis viajes
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1a5276] text-white py-8">
        <div className="container mx-auto px-4">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg">PACIFIC COAST TAXI</span>
          </Link>
          <h1 className="text-3xl font-bold mt-4">Mis Viajes</h1>
          <div className="flex items-center justify-between mt-1">
            <p className="text-blue-100">{email}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchTrips(email)}
              className="text-white hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-[#1a5276]" />
          </div>
        ) : error ? (
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
              <Button onClick={() => fetchTrips(email)} className="mt-4">
                Reintentar
              </Button>
            </CardContent>
          </Card>
        ) : trips.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarClock className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No tienes viajes registrados</h3>
              <p className="text-gray-500 mb-6">Reserva tu primer viaje con Pacific Coast Taxi</p>
              <Link href="/trips">
                <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Reservar un viaje
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4" />
                Proximos ({upcomingTrips.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Historial ({pastTrips.length})
              </TabsTrigger>
            </TabsList>

            {/* Upcoming Trips */}
            <TabsContent value="upcoming">
              {upcomingTrips.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CalendarClock className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No tienes viajes programados</h3>
                    <p className="text-gray-500 mb-6">Reserva tu proximo viaje</p>
                    <Link href="/trips">
                      <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Reservar un viaje
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {upcomingTrips.map((trip) => (
                    <Card key={trip.id} className="shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          {/* Trip Info */}
                          <div className="flex-1 p-6">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-sm text-gray-500 font-mono">{trip.confirmation_code}</span>
                              {getStatusBadge(trip.status)}
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-xs text-gray-500">Origen</p>
                                  <p className="font-medium">{trip.origin_address}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-xs text-gray-500">Destino</p>
                                  <p className="font-medium">{trip.destination_address}</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                {formatDate(trip.trip_date)}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                {trip.trip_time || "Sin hora"}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users className="w-4 h-4" />
                                {trip.passengers} {trip.passengers === 1 ? "pasajero" : "pasajeros"}
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t">
                              {trip.discount_code && (
                                <p className="text-sm text-green-600 mb-1">
                                  Descuento aplicado: {trip.discount_code} (-${trip.discount_amount?.toFixed(2)})
                                </p>
                              )}
                              <p className="text-lg font-bold text-[#1a5276]">
                                ${trip.final_price?.toFixed(2) || trip.estimated_price?.toFixed(2)} USD
                              </p>
                            </div>

                            {/* Cancel Button */}
                            {['pending', 'confirmed'].includes(trip.status) && (
                              <div className="mt-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancelTrip(trip.id)}
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Cancelar viaje
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Driver Info */}
                          <div className="bg-gray-50 p-6 md:w-64 border-t md:border-t-0 md:border-l">
                            {trip.driver ? (
                              <div>
                                <p className="text-xs text-gray-500 mb-2">Conductor asignado</p>
                                <p className="font-semibold text-[#1a5276]">
                                  {trip.driver.profile?.full_name || "Conductor"}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {trip.driver.vehicle_brand} {trip.driver.vehicle_model} {trip.driver.vehicle_year}
                                </p>
                                <p className="text-sm text-gray-500">{trip.driver.vehicle_color}</p>
                                <div className="mt-2 bg-[#1a5276] text-white px-3 py-1 rounded text-sm font-mono inline-block">
                                  {trip.driver.vehicle_plate}
                                </div>
                                <div className="flex items-center gap-1 mt-2">
                                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                  <span className="text-sm font-medium">{trip.driver.rating || 5.0}</span>
                                  <span className="text-xs text-gray-500">({trip.driver.total_trips || 0} viajes)</span>
                                </div>
                                {trip.driver.profile?.phone && (
                                  <a 
                                    href={`tel:${trip.driver.profile.phone}`}
                                    className="block mt-3 text-sm text-amber-600 hover:text-amber-700"
                                  >
                                    {trip.driver.profile.phone}
                                  </a>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full text-center">
                                <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
                                <p className="text-sm text-gray-600">Buscando conductor...</p>
                                <p className="text-xs text-gray-400 mt-1">Te notificaremos pronto</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <div className="text-center mt-6">
                    <Link href="/trips">
                      <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Reservar otro viaje
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Past Trips / History */}
            <TabsContent value="history">
              {pastTrips.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <History className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No tienes viajes anteriores</h3>
                    <p className="text-gray-500">Tu historial de viajes aparecera aqui</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pastTrips.map((trip) => (
                    <Card key={trip.id} className={`shadow-md overflow-hidden ${trip.status === 'cancelled' ? 'opacity-60' : ''}`}>
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          {/* Trip Info */}
                          <div className="flex-1 p-6">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-sm text-gray-500 font-mono">{trip.confirmation_code}</span>
                              {getStatusBadge(trip.status)}
                            </div>

                            <div className="flex items-center gap-4 mb-3 flex-wrap">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-green-500" />
                                <span className="text-sm">{trip.origin_address}</span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-400 hidden sm:block" />
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-red-500" />
                                <span className="text-sm">{trip.destination_address}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(trip.trip_date)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {trip.trip_time || "Sin hora"}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {trip.passengers}
                              </div>
                            </div>

                            <p className="mt-2 font-semibold text-[#1a5276]">
                              ${trip.final_price?.toFixed(2) || trip.estimated_price?.toFixed(2)} USD
                            </p>

                            {/* Review button for completed trips */}
                            {trip.status === 'completed' && trip.driver && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-3"
                                onClick={() => setReviewTrip(trip)}
                              >
                                <Star className="w-4 h-4 mr-2" />
                                Calificar viaje
                              </Button>
                            )}
                          </div>

                          {/* Driver Info (compact for history) */}
                          {trip.driver && (
                            <div className="bg-gray-50 p-4 md:w-48 border-t md:border-t-0 md:border-l flex items-center justify-center">
                              <div className="text-center">
                                <p className="text-xs text-gray-500">Conductor</p>
                                <p className="font-medium text-sm">{trip.driver.profile?.full_name || "Conductor"}</p>
                                <div className="flex items-center justify-center gap-1 mt-1">
                                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                  <span className="text-xs">{trip.driver.rating || 5.0}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Driver Review Modal */}
      {reviewTrip && reviewTrip.driver && (
        <DriverReviewModal
          isOpen={!!reviewTrip}
          onClose={() => setReviewTrip(null)}
          tripId={reviewTrip.id}
          driverId={reviewTrip.driver.id}
          driverName={reviewTrip.driver.profile?.full_name || "Conductor"}
          onSuccess={() => {
            setReviewTrip(null)
            fetchTrips(email)
          }}
        />
      )}
    </div>
  )
}
