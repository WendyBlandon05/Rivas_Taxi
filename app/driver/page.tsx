"use client"

import { useState, useEffect, type Dispatch, type FormEvent, type SetStateAction } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  Navigation,
  PlayCircle,
  Fuel,
  Gauge,
  Save,
  Calculator
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
  estimated_duration_minutes: number | null
  created_at: string
  status: string
  final_price: number | null
  estimated_price: number | null
  passenger: { full_name: string } | null
}

interface FuelRecord {
  id: string
  date: string
  amount_usd: number | string
  gallons: number | string | null
  remaining_gallons: number | string | null
  price_per_gallon: number | string | null
  odometer_start: number | null
  odometer_end: number | null
  km_driven: number | string | null
  notes: string | null
}

interface FuelSummary {
  totalAmount: number
  totalGallons: number
  totalRemainingGallons: number
  totalConsumedGallons: number
  totalKmDriven: number
  averageKmPerGallon: number
  recordCount: number
}

type FuelForm = {
  date: string
  amountUsd: string
  gallons: string
  remainingGallons: string
  odometerStart: string
  odometerEnd: string
  notes: string
}

const emptyFuelSummary: FuelSummary = {
  totalAmount: 0,
  totalGallons: 0,
  totalRemainingGallons: 0,
  totalConsumedGallons: 0,
  totalKmDriven: 0,
  averageKmPerGallon: 0,
  recordCount: 0
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10)
}

export default function DriverDashboard() {
  const { user, profile, signOut, isLoading: authLoading } = useAuth()
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [updatingTripId, setUpdatingTripId] = useState<string | null>(null)
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([])
  const [fuelSummary, setFuelSummary] = useState<FuelSummary>(emptyFuelSummary)
  const [fuelSubmitting, setFuelSubmitting] = useState(false)
  const [fuelError, setFuelError] = useState("")
  const [fuelSuccess, setFuelSuccess] = useState("")
  const [cancelTrip, setCancelTrip] = useState<Trip | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelError, setCancelError] = useState("")
  const [cancelSuccess, setCancelSuccess] = useState("")
  const [cancellingTripId, setCancellingTripId] = useState<string | null>(null)
  const [fuelForm, setFuelForm] = useState<FuelForm>({
    date: getTodayDate(),
    amountUsd: "",
    gallons: "",
    remainingGallons: "",
    odometerStart: "",
    odometerEnd: "",
    notes: ""
  })
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
          estimated_duration_minutes,
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

      await fetchFuelData()
    } catch (error) {
      console.error("Error fetching driver data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchFuelData() {
    try {
      const response = await fetch("/api/fuel-consumption")
      const data = await response.json()

      if (!response.ok) {
        const message = String(data.error || "")
        if (message.includes("fuel_consumption")) {
          throw new Error("Falta crear la tabla de gasolina. Ejecuta el script 004 en Supabase.")
        }
        throw new Error(data.error || "Error al cargar registros de gasolina")
      }

      setFuelRecords(data.records || [])
      setFuelSummary(data.summary || emptyFuelSummary)
    } catch (error) {
      console.error("Error fetching fuel data:", error)
      setFuelError(error instanceof Error ? error.message : "Error al cargar registros de gasolina")
    }
  }

  async function handleFuelSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFuelSubmitting(true)
    setFuelError("")
    setFuelSuccess("")

    try {
      const response = await fetch("/api/fuel-consumption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fuelForm)
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "No se pudo guardar el registro")
      }

      setFuelSuccess("Registro de gasolina guardado correctamente")
      setFuelForm({
        date: getTodayDate(),
        amountUsd: "",
        gallons: "",
        remainingGallons: "",
        odometerStart: "",
        odometerEnd: "",
        notes: ""
      })
      await fetchFuelData()
    } catch (error) {
      setFuelError(error instanceof Error ? error.message : "No se pudo guardar el registro")
    } finally {
      setFuelSubmitting(false)
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

  async function handleTripStatusChange(tripId: string, status: "in_progress" | "completed") {
    setUpdatingTripId(tripId)
    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al actualizar el viaje")
      }

      await fetchDriverData()
    } catch (error) {
      console.error("Error updating trip status:", error)
    } finally {
      setUpdatingTripId(null)
    }
  }

  async function handleDriverCancelTrip() {
    if (!cancelTrip) return

    const reason = cancelReason.trim()
    if (reason.length < 8) {
      setCancelError("Escribe un motivo mas detallado para cancelar el viaje.")
      return
    }

    setCancellingTripId(cancelTrip.id)
    setCancelError("")
    setCancelSuccess("")

    try {
      const response = await fetch(`/api/trips/${cancelTrip.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "driver_cancel", reason })
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "No se pudo cancelar el viaje")
      }

      setCancelSuccess(data.message || "Viaje cancelado y reasignado")
      setCancelTrip(null)
      setCancelReason("")
      await fetchDriverData()
    } catch (error) {
      setCancelError(error instanceof Error ? error.message : "No se pudo cancelar el viaje")
    } finally {
      setCancellingTripId(null)
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
                  <SheetTitle className="sr-only">Menu del conductor</SheetTitle>
                  <div className="flex items-center gap-3 mb-8">
                    <Car className="w-8 h-8" />
                    <div>
                      <p className="font-bold">PACIFIC COAST</p>
                      <p className="text-xs text-white/70">Panel Conductor</p>
                    </div>
                  </div>
                  <nav className="space-y-4">
                    <Link href="/driver" className="flex items-center gap-3 text-white/70 hover:text-white">
                      <Home className="w-5 h-5" />
                      Panel
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
                <Link href="/driver">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    <Home className="w-4 h-4 mr-2" />
                    Panel
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

        {/* Mini dashboard */}
        <Tabs defaultValue="trips" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 lg:mb-6">
            <TabsTrigger value="trips" className="text-sm lg:text-base">
              <Navigation className="w-4 h-4 mr-2" />
              Viajes
            </TabsTrigger>
            <TabsTrigger value="fuel" className="text-sm lg:text-base">
              <Fuel className="w-4 h-4 mr-2" />
              Gasolina
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trips">
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
                <TripsList
                  trips={trips}
                  getStatusBadge={getStatusBadge}
                  getStatusLabel={getStatusLabel}
                  onTripStatusChange={handleTripStatusChange}
                  onCancelTrip={setCancelTrip}
                  updatingTripId={updatingTripId}
                  cancellingTripId={cancellingTripId}
                />
              </TabsContent>

              <TabsContent value="pending">
                <TripsList 
                  trips={trips.filter(t => ["pending", "confirmed", "in_progress"].includes(t.status))} 
                  getStatusBadge={getStatusBadge} 
                  getStatusLabel={getStatusLabel} 
                  onTripStatusChange={handleTripStatusChange}
                  onCancelTrip={setCancelTrip}
                  updatingTripId={updatingTripId}
                  cancellingTripId={cancellingTripId}
                />
              </TabsContent>

              <TabsContent value="completed">
                <TripsList 
                  trips={trips.filter(t => t.status === "completed")} 
                  getStatusBadge={getStatusBadge} 
                  getStatusLabel={getStatusLabel} 
                  onTripStatusChange={handleTripStatusChange}
                  onCancelTrip={setCancelTrip}
                  updatingTripId={updatingTripId}
                  cancellingTripId={cancellingTripId}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="fuel">
            <FuelTrackingSection
              fuelForm={fuelForm}
              setFuelForm={setFuelForm}
              onSubmit={handleFuelSubmit}
              submitting={fuelSubmitting}
              error={fuelError}
              success={fuelSuccess}
              records={fuelRecords}
              summary={fuelSummary}
            />
          </TabsContent>
        </Tabs>

        <Dialog open={!!cancelTrip} onOpenChange={(open) => {
          if (!open) {
            setCancelTrip(null)
            setCancelReason("")
            setCancelError("")
          }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Cancelar viaje
              </DialogTitle>
              <DialogDescription>
                El viaje actual quedara cancelado con tu motivo y el sistema intentara asignarlo a otro conductor.
              </DialogDescription>
            </DialogHeader>
            {cancelTrip && (
              <div className="rounded-lg border p-3 text-sm text-gray-700 space-y-1">
                <p className="font-semibold text-gray-800">{cancelTrip.passenger?.full_name || "Pasajero"}</p>
                <p>{cancelTrip.origin_address}</p>
                <p>{cancelTrip.destination_address}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="cancel-reason">Motivo de cancelacion</Label>
              <Textarea
                id="cancel-reason"
                placeholder="Ejemplo: falla mecanica, emergencia personal, accidente en ruta..."
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                className="min-h-28"
              />
            </div>
            {cancelError && <p className="text-sm text-red-600">{cancelError}</p>}
            {cancelSuccess && <p className="text-sm text-green-600">{cancelSuccess}</p>}
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCancelTrip(null)
                  setCancelReason("")
                  setCancelError("")
                }}
              >
                Volver
              </Button>
              <Button
                type="button"
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={!cancelTrip || cancellingTripId === cancelTrip.id}
                onClick={handleDriverCancelTrip}
              >
                {cancelTrip && cancellingTripId === cancelTrip.id ? (
                  <Spinner className="w-4 h-4 mr-2" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                Confirmar cancelacion
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

function numberValue(value: number | string | null | undefined) {
  const parsed = Number(value || 0)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatMoney(value: number | string | null | undefined) {
  return `$${numberValue(value).toFixed(2)}`
}

function formatNumber(value: number | string | null | undefined) {
  return numberValue(value).toFixed(2)
}

function FuelTrackingSection({
  fuelForm,
  setFuelForm,
  onSubmit,
  submitting,
  error,
  success,
  records,
  summary
}: {
  fuelForm: FuelForm
  setFuelForm: Dispatch<SetStateAction<FuelForm>>
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  submitting: boolean
  error: string
  success: string
  records: FuelRecord[]
  summary: FuelSummary
}) {
  const amount = Number(fuelForm.amountUsd || 0)
  const gallons = Number(fuelForm.gallons || 0)
  const remaining = Number(fuelForm.remainingGallons || 0)
  const pricePerGallon = amount > 0 && gallons > 0 ? amount / gallons : 0
  const consumedGallons = Math.max(gallons - remaining, 0)

  function updateField(field: keyof FuelForm, value: string) {
    setFuelForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
          <Fuel className="w-5 h-5 text-[#1a5276]" />
          Control de gasolina
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-sky-50 rounded-lg p-3">
            <p className="text-xs text-sky-700">Gasto total</p>
            <p className="text-xl font-bold text-sky-900">{formatMoney(summary.totalAmount)}</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3">
            <p className="text-xs text-emerald-700">Galones cargados</p>
            <p className="text-xl font-bold text-emerald-900">{formatNumber(summary.totalGallons)}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <p className="text-xs text-amber-700">Galones consumidos</p>
            <p className="text-xl font-bold text-amber-900">{formatNumber(summary.totalConsumedGallons)}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-700">Km por galon</p>
            <p className="text-xl font-bold text-slate-900">{formatNumber(summary.averageKmPerGallon)}</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="grid lg:grid-cols-2 gap-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fuel-date">Dia</Label>
              <Input
                id="fuel-date"
                type="date"
                value={fuelForm.date}
                onChange={(event) => updateField("date", event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fuel-amount">Precio pagado USD</Label>
              <Input
                id="fuel-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="25.00"
                value={fuelForm.amountUsd}
                onChange={(event) => updateField("amountUsd", event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fuel-gallons">Galones cargados</Label>
              <Input
                id="fuel-gallons"
                type="number"
                min="0"
                step="0.01"
                placeholder="5"
                value={fuelForm.gallons}
                onChange={(event) => updateField("gallons", event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fuel-remaining">Galones al final</Label>
              <Input
                id="fuel-remaining"
                type="number"
                min="0"
                step="0.01"
                placeholder="1"
                value={fuelForm.remainingGallons}
                onChange={(event) => updateField("remainingGallons", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="odometer-start">Kilometraje inicial</Label>
              <Input
                id="odometer-start"
                type="number"
                min="0"
                placeholder="12000"
                value={fuelForm.odometerStart}
                onChange={(event) => updateField("odometerStart", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="odometer-end">Kilometraje final</Label>
              <Input
                id="odometer-end"
                type="number"
                min="0"
                placeholder="12140"
                value={fuelForm.odometerEnd}
                onChange={(event) => updateField("odometerEnd", event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="border rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calculator className="w-4 h-4" />
                  Precio por galon
                </div>
                <p className="text-lg font-bold text-[#1a5276]">{formatMoney(pricePerGallon)}</p>
              </div>
              <div className="border rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Gauge className="w-4 h-4" />
                  Consumo del dia
                </div>
                <p className="text-lg font-bold text-[#1a5276]">{formatNumber(consumedGallons)} gal</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fuel-notes">Notas</Label>
              <Textarea
                id="fuel-notes"
                placeholder="Gasolinera, tipo de combustible, pago, observaciones del vehiculo..."
                value={fuelForm.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                className="min-h-24"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <Button type="submit" className="w-full bg-[#1a5276] hover:bg-[#154360]" disabled={submitting}>
              {submitting ? <Spinner className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Guardar registro de gasolina
            </Button>
          </div>
        </form>

        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-800 mb-3">Ultimos registros</h3>
          {records.length === 0 ? (
            <p className="text-sm text-gray-500">Todavia no hay registros de gasolina.</p>
          ) : (
            <div className="space-y-2">
              {records.slice(0, 5).map((record) => (
                <div key={record.id} className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 rounded-lg border p-3">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {new Date(`${record.date}T00:00:00`).toLocaleDateString("es-NI")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatNumber(record.gallons)} gal cargados
                      {record.remaining_gallons !== null && ` | ${formatNumber(record.remaining_gallons)} gal al final`}
                      {record.km_driven !== null && ` | ${formatNumber(record.km_driven)} km`}
                    </p>
                    {record.notes && <p className="text-sm text-gray-500 mt-1">{record.notes}</p>}
                  </div>
                  <div className="lg:text-right">
                    <p className="font-bold text-[#1a5276]">{formatMoney(record.amount_usd)}</p>
                    <p className="text-xs text-gray-500">{formatMoney(record.price_per_gallon)} por galon</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function TripsList({ 
  trips, 
  getStatusBadge, 
  getStatusLabel,
  onTripStatusChange,
  onCancelTrip,
  updatingTripId,
  cancellingTripId
}: { 
  trips: Trip[]
  getStatusBadge: (status: string) => string
  getStatusLabel: (status: string) => string 
  onTripStatusChange: (tripId: string, status: "in_progress" | "completed") => Promise<void>
  onCancelTrip: (trip: Trip) => void
  updatingTripId: string | null
  cancellingTripId: string | null
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
                  {" · "}
                  {trip.estimated_duration_minutes || 30} min aprox.
                </span>
                {["pending", "confirmed"].includes(trip.status) && (
                  <Button
                    size="sm"
                    className="bg-[#1a5276] hover:bg-[#154360] text-white"
                    disabled={updatingTripId === trip.id}
                    onClick={() => onTripStatusChange(trip.id, "in_progress")}
                  >
                    {updatingTripId === trip.id ? (
                      <Spinner className="w-4 h-4 mr-2" />
                    ) : (
                      <PlayCircle className="w-4 h-4 mr-2" />
                    )}
                    Iniciar viaje
                  </Button>
                )}
                {trip.status === "in_progress" && (
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={updatingTripId === trip.id}
                    onClick={() => onTripStatusChange(trip.id, "completed")}
                  >
                    {updatingTripId === trip.id ? (
                      <Spinner className="w-4 h-4 mr-2" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Viaje finalizado
                  </Button>
                )}
                {["pending", "confirmed", "in_progress"].includes(trip.status) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                    disabled={cancellingTripId === trip.id || updatingTripId === trip.id}
                    onClick={() => onCancelTrip(trip)}
                  >
                    {cancellingTripId === trip.id ? (
                      <Spinner className="w-4 h-4 mr-2" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
