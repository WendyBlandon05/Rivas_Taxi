"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { 
  Car, 
  Star, 
  MapPin, 
  Clock, 
  User, 
  Phone,
  DollarSign,
  XCircle,
  CheckCircle,
  MessageSquare,
  LogOut,
  Home,
  Menu,
  X,
  Navigation
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

interface DriverInfo {
  id: string
  license_number: string | null
  vehicle_brand: string | null
  vehicle_model: string | null
  vehicle_year: number | null
  vehicle_color: string | null
  vehicle_plate: string | null
  status: "available" | "busy" | "offline"
  rating: number
  total_trips: number
  is_active: boolean
}

interface Trip {
  id: string
  origin_address: string
  destination_address: string
  scheduled_at: string | null
  created_at: string
  status: string
  final_price: number | null
  estimated_price: number | null
  passenger: { full_name: string } | null
}

export default function DriverDashboard() {
  const { user, profile, signOut, isLoading: authLoading } = useAuth()
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    if (user && profile?.role === "driver") {
      fetchDriverData()
    } else if (!authLoading && profile?.role !== "driver") {
      setLoading(false)
    }
  }, [user, profile, authLoading])

  async function fetchDriverData() {
    setLoading(true)
    try {
      // Fetch driver info
      const { data: driverData } = await supabase
        .from("drivers")
        .select("*")
        .eq("id", user?.id)
        .single()

      if (driverData) {
        setDriverInfo(driverData as DriverInfo)
      }

      // Fetch driver's trips
      const { data: tripsData } = await supabase
        .from("trips")
        .select(`
          id,
          origin_address,
          destination_address,
          scheduled_at,
          created_at,
          status,
          final_price,
          estimated_price,
          passenger:profiles!trips_passenger_id_fkey(full_name)
        `)
        .eq("driver_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(20)

      if (tripsData) {
        setTrips(tripsData as unknown as Trip[])
      }
    } catch (error) {
      console.error("Error fetching driver data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(newStatus: string) {
    if (!user) return
    
    setUpdatingStatus(true)
    try {
      const { error } = await supabase
        .from("drivers")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", user.id)

      if (!error) {
        setDriverInfo(prev => prev ? { ...prev, status: newStatus as DriverInfo["status"] } : null)
      }
    } catch (error) {
      console.error("Error updating status:", error)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      available: "bg-green-100 text-green-700",
      busy: "bg-amber-100 text-amber-700",
      offline: "bg-gray-100 text-gray-700",
      completed: "bg-green-100 text-green-700",
      in_progress: "bg-blue-100 text-blue-700",
      pending: "bg-amber-100 text-amber-700",
      confirmed: "bg-cyan-100 text-cyan-700",
      cancelled: "bg-red-100 text-red-700"
    }
    return styles[status] || "bg-gray-100 text-gray-700"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      available: "Disponible",
      busy: "Ocupado",
      offline: "Desconectado",
      completed: "Completado",
      in_progress: "En curso",
      pending: "Pendiente",
      confirmed: "Confirmado",
      cancelled: "Cancelado"
    }
    return labels[status] || status
  }

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Spinner className="w-10 h-10 text-[#1a5276] mx-auto" />
          <p className="mt-4 text-gray-600">Cargando panel del conductor...</p>
        </div>
      </div>
    )
  }

  // Access denied if not a driver
  if (!profile || profile.role !== "driver") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Acceso Denegado</h2>
            <p className="text-gray-500 mb-4">Esta pagina es exclusiva para conductores registrados.</p>
            <Link href="/login">
              <Button className="bg-[#1a5276]">Iniciar Sesion</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate stats
  const completedTrips = trips.filter(t => t.status === "completed").length
  const cancelledTrips = trips.filter(t => t.status === "cancelled").length
  const totalEarnings = trips
    .filter(t => t.status === "completed")
    .reduce((acc, t) => acc + (t.final_price || t.estimated_price || 0), 0)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-[#1a5276] text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden text-white">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 bg-[#0d2d44] text-white border-none p-6">
                  <div className="flex items-center gap-3 mb-8">
                    <Car className="w-8 h-8" />
                    <div>
                      <p className="font-bold">PACIFIC COAST</p>
                      <p className="text-xs text-white/70">Panel Conductor</p>
                    </div>
                  </div>
                  <nav className="space-y-4">
                    <Link href="/" className="flex items-center gap-3 text-white/70 hover:text-white">
                      <Home className="w-5 h-5" />
                      Inicio
                    </Link>
                    <button 
                      onClick={() => { signOut(); setMobileMenuOpen(false) }}
                      className="flex items-center gap-3 text-white/70 hover:text-white w-full"
                    >
                      <LogOut className="w-5 h-5" />
                      Cerrar Sesion
                    </button>
                  </nav>
                </SheetContent>
              </Sheet>
              
              <Car className="w-8 h-8" />
              <div className="hidden sm:block">
                <h1 className="font-bold text-lg lg:text-xl">Pacific Coast Taxi</h1>
                <p className="text-xs lg:text-sm text-blue-200">Panel del Conductor</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Status selector */}
              <Select 
                value={driverInfo?.status || "offline"} 
                onValueChange={handleStatusChange}
                disabled={updatingStatus}
              >
                <SelectTrigger className="w-[120px] lg:w-[150px] bg-white/10 border-white/20 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Disponible
                    </span>
                  </SelectItem>
                  <SelectItem value="busy">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" />
                      Ocupado
                    </span>
                  </SelectItem>
                  <SelectItem value="offline">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray-500" />
                      Desconectado
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              {updatingStatus && <Spinner className="w-4 h-4 text-white" />}
              
              <div className="hidden lg:flex items-center gap-2">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    <Home className="w-4 h-4 mr-2" />
                    Inicio
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white/10"
                  onClick={() => signOut()}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Salir
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 lg:py-8">
        {/* Driver Profile Card */}
        <Card className="mb-6">
          <CardContent className="p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
              {/* Profile */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-[#1a5276] rounded-full flex items-center justify-center shrink-0">
                  <User className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-800 truncate">
                    {profile.full_name || "Conductor"}
                  </h2>
                  <p className="text-gray-600 text-sm truncate">{profile.email}</p>
                  {profile.phone && (
                    <a href={`tel:${profile.phone}`} className="text-[#1a5276] flex items-center gap-1 text-sm">
                      <Phone className="w-4 h-4" />
                      {profile.phone}
                    </a>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-yellow-50 rounded-lg p-3 lg:p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xl lg:text-2xl font-bold text-yellow-700">
                      {driverInfo?.rating || "-"}
                    </span>
                  </div>
                  <p className="text-xs lg:text-sm text-yellow-600">Calificacion</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-3 lg:p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" />
                    <span className="text-xl lg:text-2xl font-bold text-green-700">{completedTrips}</span>
                  </div>
                  <p className="text-xs lg:text-sm text-green-600">Completados</p>
                </div>
                
                <div className="bg-red-50 rounded-lg p-3 lg:p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <XCircle className="w-4 h-4 lg:w-5 lg:h-5 text-red-500" />
                    <span className="text-xl lg:text-2xl font-bold text-red-700">{cancelledTrips}</span>
                  </div>
                  <p className="text-xs lg:text-sm text-red-600">Cancelados</p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-3 lg:p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <DollarSign className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500" />
                    <span className="text-xl lg:text-2xl font-bold text-blue-700">${totalEarnings}</span>
                  </div>
                  <p className="text-xs lg:text-sm text-blue-600">Ganancias</p>
                </div>
              </div>
            </div>

            {/* Vehicle Info */}
            {driverInfo && (driverInfo.vehicle_brand || driverInfo.vehicle_plate) && (
              <div className="mt-4 lg:mt-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center border-t pt-4">
                <Car className="w-6 h-6 text-gray-400 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800">
                    {driverInfo.vehicle_brand} {driverInfo.vehicle_model} 
                    {driverInfo.vehicle_year && ` (${driverInfo.vehicle_year})`}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {driverInfo.vehicle_color && `Color: ${driverInfo.vehicle_color}`}
                    {driverInfo.vehicle_plate && ` | Placa: `}
                    {driverInfo.vehicle_plate && (
                      <span className="font-mono">{driverInfo.vehicle_plate}</span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trips Section */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 lg:mb-6">
            <TabsTrigger value="all" className="text-xs lg:text-sm">
              Todos ({trips.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs lg:text-sm">
              Pendientes
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs lg:text-sm">
              Completados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <TripsList trips={trips} getStatusBadge={getStatusBadge} getStatusLabel={getStatusLabel} />
          </TabsContent>

          <TabsContent value="pending">
            <TripsList 
              trips={trips.filter(t => ["pending", "confirmed", "in_progress"].includes(t.status))} 
              getStatusBadge={getStatusBadge} 
              getStatusLabel={getStatusLabel} 
            />
          </TabsContent>

          <TabsContent value="completed">
            <TripsList 
              trips={trips.filter(t => t.status === "completed")} 
              getStatusBadge={getStatusBadge} 
              getStatusLabel={getStatusLabel} 
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function TripsList({ 
  trips, 
  getStatusBadge, 
  getStatusLabel 
}: { 
  trips: Trip[]
  getStatusBadge: (status: string) => string
  getStatusLabel: (status: string) => string 
}) {
  if (trips.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Navigation className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay viajes para mostrar</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {trips.map((trip) => (
        <Card key={trip.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getStatusBadge(trip.status)}>
                    {getStatusLabel(trip.status)}
                  </Badge>
                  {trip.passenger?.full_name && (
                    <span className="text-sm text-gray-600 truncate">
                      {trip.passenger.full_name}
                    </span>
                  )}
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700 line-clamp-1">{trip.origin_address}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700 line-clamp-1">{trip.destination_address}</span>
                  </div>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1">
                <span className="text-lg font-bold text-[#1a5276]">
                  ${trip.final_price || trip.estimated_price || 0}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(trip.scheduled_at || trip.created_at).toLocaleDateString("es-NI")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
