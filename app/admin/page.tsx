"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Users, Car, DollarSign, TrendingUp, 
  Star, Bell, Settings, LogOut,
  Search, Filter, Download, RefreshCw, Plus, Menu, X, Eye, EyeOff, Copy, Check, UserPlus,
  Fuel, Edit, Trash2, Camera
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface Trip {
  id: string
  passenger: { full_name: string } | null
  passenger_name: string | null
  passenger_email: string | null
  driver: { id: string; profiles: { full_name: string } | null } | null
  origin_address: string
  destination_address: string
  scheduled_at: string | null
  created_at: string
  status: "completed" | "in_progress" | "cancelled" | "pending" | "confirmed"
  final_price: number | null
  estimated_price: number | null
}

interface Driver {
  id: string
  profiles: {
    full_name: string | null
    email: string
    phone: string | null
    cedula_number: string | null
    address: string | null
    avatar_url: string | null
  } | null
  status: "available" | "busy" | "offline"
  total_trips: number
  rating: number
  is_active: boolean
  license_number: string | null
  cedula_number: string | null
  vehicle_brand: string | null
  vehicle_model: string | null
  vehicle_year: number | null
  vehicle_plate: string | null
  vehicle_color: string | null
  vehicle_photo_url: string | null
}

interface Stats {
  todayEarnings: number
  todayTrips: number
  activeDrivers: number
  totalDrivers: number
  avgRating: number
}

interface FuelReportRecord {
  key: string
  driverId: string
  driverName: string
  driverEmail: string
  date: string
  fuelAmount: number
  gallons: number
  remainingGallons: number
  consumedGallons: number
  pricePerGallon: number
  kmDriven: number
  earnings: number
  completedTrips: number
  netIncome: number
  notes: string
}

interface FuelReportSummary {
  totalFuel: number
  totalEarnings: number
  totalNet: number
  totalTrips: number
}

type DriverForm = {
  id: string
  email: string
  full_name: string
  phone: string
  cedula_number: string
  address: string
  avatar_url: string
  vehicle_brand: string
  vehicle_model: string
  vehicle_year: string
  vehicle_color: string
  vehicle_plate: string
  vehicle_photo_url: string
  is_active: boolean
}

function generatePassword(length: number = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%"
  let password = ""
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

function formatNicaraguaPhone(value: string) {
  const digits = value.replace(/\D/g, "")
  const withoutCountryCode = digits.startsWith("505") ? digits.slice(3) : digits
  return `+505${withoutCountryCode.slice(0, 8)}`
}

function formatCedula(value: string) {
  const cleaned = value.toUpperCase().replace(/[^0-9A-Z]/g, "")
  const first = cleaned.slice(0, 3).replace(/\D/g, "")
  const second = cleaned.slice(3, 9).replace(/\D/g, "")
  const third = cleaned.slice(9, 13).replace(/\D/g, "")
  const letter = cleaned.slice(13, 14).replace(/[^A-Z]/g, "")

  let formatted = first
  if (second) formatted += `-${second}`
  if (third) formatted += `-${third}`
  if (letter) formatted += letter
  return formatted
}

function isValidNicaraguaPhone(value: string) {
  return /^\+505\d{8}$/.test(value)
}

function isValidCedula(value: string) {
  return /^\d{3}-\d{6}-\d{4}[A-Z]$/.test(value)
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, profile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<"overview" | "trips" | "drivers" | "fuel">("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [trips, setTrips] = useState<Trip[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [fuelRecords, setFuelRecords] = useState<FuelReportRecord[]>([])
  const [fuelSummary, setFuelSummary] = useState<FuelReportSummary>({
    totalFuel: 0,
    totalEarnings: 0,
    totalNet: 0,
    totalTrips: 0
  })
  const [stats, setStats] = useState<Stats>({
    todayEarnings: 0,
    todayTrips: 0,
    activeDrivers: 0,
    totalDrivers: 0,
    avgRating: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentDateLabel, setCurrentDateLabel] = useState("")
  
  // Create driver form state
  const [isCreateDriverOpen, setIsCreateDriverOpen] = useState(false)
  const [newDriverEmail, setNewDriverEmail] = useState("")
  const [newDriverName, setNewDriverName] = useState("")
  const [newDriverPhone, setNewDriverPhone] = useState("")
  const [newDriverCedula, setNewDriverCedula] = useState("")
  const [newDriverAddress, setNewDriverAddress] = useState("")
  const [newDriverPhotoUrl, setNewDriverPhotoUrl] = useState("")
  const [newDriverVehicleBrand, setNewDriverVehicleBrand] = useState("")
  const [newDriverVehicleModel, setNewDriverVehicleModel] = useState("")
  const [newDriverVehicleYear, setNewDriverVehicleYear] = useState("")
  const [newDriverVehicleColor, setNewDriverVehicleColor] = useState("")
  const [newDriverVehiclePlate, setNewDriverVehiclePlate] = useState("")
  const [newDriverPassword, setNewDriverPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isCreatingDriver, setIsCreatingDriver] = useState(false)
  const [copiedPassword, setCopiedPassword] = useState(false)
  const [driverCreated, setDriverCreated] = useState<{ email: string; password: string } | null>(null)
  const [editingDriver, setEditingDriver] = useState<DriverForm | null>(null)
  const [isSavingDriver, setIsSavingDriver] = useState(false)
  const [deletingDriverId, setDeletingDriverId] = useState<string | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const supabase = createClient()

  const handleSignOut = async () => {
    if (isSigningOut) return

    setIsSigningOut(true)
    try {
      await signOut()
      router.replace("/login")
      router.refresh()
    } catch (error) {
      toast.error("No se pudo cerrar sesion. Intenta de nuevo.")
      setIsSigningOut(false)
    }
  }

  useEffect(() => {
    setCurrentDateLabel(new Date().toLocaleDateString('es-NI', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
    setNewDriverPassword(generatePassword())
    fetchData()
  }, [])

  async function fetchData() {
    setIsLoading(true)
    try {
      // Fetch trips
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
          passenger_name,
          passenger_email,
          passenger:profiles!trips_passenger_id_fkey(full_name),
          driver:drivers!trips_driver_id_fkey(id, profiles(full_name))
        `)
        .order("created_at", { ascending: false })
        .limit(50)

      if (tripsData) {
        const tripsWithFallback = tripsData as unknown as Trip[]
        const missingPassengerEmails = Array.from(new Set(
          tripsWithFallback
            .filter((trip) => !trip.passenger?.full_name && trip.passenger_email)
            .map((trip) => trip.passenger_email as string)
        ))
        const profileNameByEmail = new Map<string, string>()

        if (missingPassengerEmails.length > 0) {
          const { data: passengerProfiles } = await supabase
            .from("profiles")
            .select("email, full_name")
            .in("email", missingPassengerEmails)

          for (const passengerProfile of passengerProfiles || []) {
            if (passengerProfile.email && passengerProfile.full_name) {
              profileNameByEmail.set(passengerProfile.email, passengerProfile.full_name)
            }
          }
        }

        setTrips(tripsWithFallback.map((trip) => ({
          ...trip,
          passenger: {
            full_name:
              trip.passenger?.full_name ||
              (trip.passenger_email ? profileNameByEmail.get(trip.passenger_email) : undefined) ||
              trip.passenger_name ||
              trip.passenger_email ||
              "Sin asignar"
          }
        })))
      }

      // Fetch drivers through the admin API so RLS does not hide operational data
      const driversResponse = await fetch("/api/admin/drivers")
      const driversResult = await driversResponse.json()
      const driversData = (driversResult.drivers || [])
        .map((profileRecord: any) => {
          const driverRecord = Array.isArray(profileRecord.drivers)
            ? profileRecord.drivers[0]
            : profileRecord.drivers

          if (!driverRecord || driverRecord.is_active === false) return null

          return {
            id: profileRecord.id,
            profiles: {
              full_name: profileRecord.full_name,
              email: profileRecord.email,
              phone: profileRecord.phone,
              cedula_number: profileRecord.cedula_number,
              address: profileRecord.address,
              avatar_url: profileRecord.avatar_url
            },
            status: driverRecord.status,
            total_trips: driverRecord.total_trips,
            rating: driverRecord.rating,
            is_active: driverRecord.is_active,
            license_number: driverRecord.license_number,
            cedula_number: driverRecord.cedula_number,
            vehicle_brand: driverRecord.vehicle_brand,
            vehicle_model: driverRecord.vehicle_model,
            vehicle_year: driverRecord.vehicle_year,
            vehicle_plate: driverRecord.vehicle_plate,
            vehicle_color: driverRecord.vehicle_color,
            vehicle_photo_url: driverRecord.vehicle_photo_url
          }
        })
        .filter(Boolean) as Driver[]

      if (driversData) {
        setDrivers(driversData)
        
        // Calculate stats
        const activeDrivers = driversData.filter(d => d.status !== "offline").length
        const totalDrivers = driversData.length
        const avgRating = driversData.length > 0 
          ? driversData.reduce((acc, d) => acc + (d.rating || 0), 0) / driversData.length 
          : 0

        // Calculate today's stats
        const today = new Date().toISOString().split("T")[0]
        const todayTrips = tripsData?.filter(t => t.created_at.startsWith(today)) || []
        const todayEarnings = todayTrips.reduce((acc, t) => acc + (t.final_price || t.estimated_price || 0), 0)

        setStats({
          todayEarnings,
          todayTrips: todayTrips.length,
          activeDrivers,
          totalDrivers,
          avgRating: Number(avgRating.toFixed(1))
        })
      }

      await fetchFuelReport()
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchFuelReport() {
    try {
      const response = await fetch("/api/admin/fuel")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar gasolina")
      }

      setFuelRecords(data.records || [])
      setFuelSummary(data.summary || {
        totalFuel: 0,
        totalEarnings: 0,
        totalNet: 0,
        totalTrips: 0
      })
    } catch (error) {
      console.error("Error fetching fuel report:", error)
      toast.error(error instanceof Error ? error.message : "Error al cargar reporte de gasolina")
    }
  }

  async function handleCreateDriver(e: React.FormEvent) {
    e.preventDefault()

    if (!isValidNicaraguaPhone(newDriverPhone)) {
      toast.error("El telefono debe iniciar con +505 y tener 8 numeros despues.")
      return
    }

    if (!isValidCedula(newDriverCedula)) {
      toast.error("La cedula debe tener el formato 111-111111-1111A.")
      return
    }

    setIsCreatingDriver(true)

    try {
      const response = await fetch("/api/admin/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newDriverEmail,
          password: newDriverPassword,
          full_name: newDriverName,
          phone: newDriverPhone,
          cedula_number: newDriverCedula,
          license_number: newDriverCedula,
          address: newDriverAddress,
          avatar_url: newDriverPhotoUrl,
          vehicle_brand: newDriverVehicleBrand,
          vehicle_model: newDriverVehicleModel,
          vehicle_year: newDriverVehicleYear,
          vehicle_color: newDriverVehicleColor,
          vehicle_plate: newDriverVehiclePlate
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al crear conductor")
      }

      // Show success with credentials
      setDriverCreated({
        email: newDriverEmail,
        password: newDriverPassword
      })
      
      toast.success("Conductor creado exitosamente")
      
      // Refresh drivers list
      fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear conductor")
    } finally {
      setIsCreatingDriver(false)
    }
  }

  function resetCreateDriverForm() {
    setNewDriverEmail("")
    setNewDriverName("")
    setNewDriverPhone("")
    setNewDriverCedula("")
    setNewDriverAddress("")
    setNewDriverPhotoUrl("")
    setNewDriverVehicleBrand("")
    setNewDriverVehicleModel("")
    setNewDriverVehicleYear("")
    setNewDriverVehicleColor("")
    setNewDriverVehiclePlate("")
    setNewDriverPassword(generatePassword())
    setShowPassword(false)
    setCopiedPassword(false)
    setDriverCreated(null)
  }

  function openEditDriver(driver: Driver) {
    setEditingDriver({
      id: driver.id,
      email: driver.profiles?.email || "",
      full_name: driver.profiles?.full_name || "",
      phone: driver.profiles?.phone || "",
      cedula_number: driver.profiles?.cedula_number || driver.cedula_number || driver.license_number || "",
      address: driver.profiles?.address || "",
      avatar_url: driver.profiles?.avatar_url || "",
      vehicle_brand: driver.vehicle_brand || "",
      vehicle_model: driver.vehicle_model || "",
      vehicle_year: driver.vehicle_year ? String(driver.vehicle_year) : "",
      vehicle_color: driver.vehicle_color || "",
      vehicle_plate: driver.vehicle_plate || "",
      vehicle_photo_url: driver.vehicle_photo_url || "",
      is_active: driver.is_active
    })
  }

  async function handleUpdateDriver(e: React.FormEvent) {
    e.preventDefault()
    if (!editingDriver) return

    if (!isValidNicaraguaPhone(editingDriver.phone)) {
      toast.error("El telefono debe iniciar con +505 y tener 8 numeros despues.")
      return
    }

    if (!isValidCedula(editingDriver.cedula_number)) {
      toast.error("La cedula debe tener el formato 111-111111-1111A.")
      return
    }

    setIsSavingDriver(true)
    try {
      const response = await fetch(`/api/admin/drivers/${editingDriver.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingDriver,
          license_number: editingDriver.cedula_number
        })
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar conductor")
      }

      toast.success("Conductor actualizado")
      setEditingDriver(null)
      await fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al actualizar conductor")
    } finally {
      setIsSavingDriver(false)
    }
  }

  async function handleDeleteDriver(driver: Driver) {
    const name = driver.profiles?.full_name || "este conductor"
    if (!confirm(`Seguro que deseas eliminar a ${name} del listado operativo?`)) return

    setDeletingDriverId(driver.id)
    try {
      const response = await fetch(`/api/admin/drivers/${driver.id}`, { method: "DELETE" })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar conductor")
      }

      toast.success("Conductor eliminado del listado operativo")
      await fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al eliminar conductor")
    } finally {
      setDeletingDriverId(null)
    }
  }

  function copyPassword() {
    navigator.clipboard.writeText(driverCreated?.password || newDriverPassword)
    setCopiedPassword(true)
    setTimeout(() => setCopiedPassword(false), 2000)
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: "bg-green-100 text-green-700",
      in_progress: "bg-blue-100 text-blue-700",
      pending: "bg-amber-100 text-amber-700",
      confirmed: "bg-cyan-100 text-cyan-700",
      cancelled: "bg-red-100 text-red-700",
      available: "bg-green-100 text-green-700",
      offline: "bg-gray-100 text-gray-700",
      busy: "bg-blue-100 text-blue-700"
    }
    return styles[status] || "bg-gray-100 text-gray-700"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      completed: "Completado",
      in_progress: "En curso",
      pending: "Pendiente",
      confirmed: "Confirmado",
      cancelled: "Cancelado",
      available: "Disponible",
      offline: "Desconectado",
      busy: "Ocupado"
    }
    return labels[status] || status
  }

  const filteredTrips = trips.filter(trip => {
    const passengerName = trip.passenger?.full_name || ""
    const matchesSearch = passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          trip.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || trip.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Check if user is admin
  if (profile && profile.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Acceso Denegado</h2>
            <p className="text-gray-500 mb-4">No tienes permisos para acceder al panel de administracion.</p>
            <Link href="/">
              <Button>Volver al inicio</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="relative w-12 h-12">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-04-03%20at%201.01.53%20PM-Photoroom-fj1m5LpFsMIQWOVTdC2t55J8S3dCBm.svg"
              alt="Logo"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <p className="font-bold text-sm">PACIFIC COAST</p>
            <p className="text-xs text-white/70">Admin Dashboard</p>
          </div>
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => { setActiveTab("overview"); setMobileMenuOpen(false) }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "overview" ? "bg-[#1a5276] text-white" : "text-white/70 hover:bg-white/10"
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Resumen General
          </button>
          <button
            onClick={() => { setActiveTab("trips"); setMobileMenuOpen(false) }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "trips" ? "bg-[#1a5276] text-white" : "text-white/70 hover:bg-white/10"
            }`}
          >
            <Car className="w-5 h-5" />
            Viajes
          </button>
          <button
            onClick={() => { setActiveTab("drivers"); setMobileMenuOpen(false) }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "drivers" ? "bg-[#1a5276] text-white" : "text-white/70 hover:bg-white/10"
            }`}
          >
            <Users className="w-5 h-5" />
            Conductores
          </button>
          <button
            onClick={() => { setActiveTab("fuel"); setMobileMenuOpen(false) }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "fuel" ? "bg-[#1a5276] text-white" : "text-white/70 hover:bg-white/10"
            }`}
          >
            <Fuel className="w-5 h-5" />
            Gasolina
          </button>
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center font-bold">
            {profile?.full_name?.charAt(0) || "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm truncate">{profile?.full_name || "Administrador"}</p>
            <p className="text-xs text-white/50 truncate">{profile?.email}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {isSigningOut ? "Cerrando..." : "Cerrar Sesion"}
        </Button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#0d2d44] text-white z-50 hidden lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-[#0d2d44] text-white border-none">
          <SheetTitle className="sr-only">Menu de administrador</SheetTitle>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </Button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-[#1a5276]">
                  {activeTab === "overview" && "Resumen General"}
                  {activeTab === "trips" && "Gestion de Viajes"}
                  {activeTab === "drivers" && "Conductores"}
                  {activeTab === "fuel" && "Gasolina"}
                </h1>
                <p className="text-xs lg:text-sm text-gray-500 hidden sm:block">
                  {currentDateLabel}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs lg:text-sm text-gray-500 truncate">Ingresos Hoy</p>
                        <p className="text-xl lg:text-3xl font-bold text-[#1a5276]">${stats.todayEarnings.toLocaleString()}</p>
                      </div>
                      <div className="p-2 lg:p-4 bg-green-100 rounded-full shrink-0">
                        <DollarSign className="w-5 h-5 lg:w-8 lg:h-8 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs lg:text-sm text-gray-500 truncate">Viajes Hoy</p>
                        <p className="text-xl lg:text-3xl font-bold text-[#1a5276]">{stats.todayTrips}</p>
                      </div>
                      <div className="p-2 lg:p-4 bg-blue-100 rounded-full shrink-0">
                        <Car className="w-5 h-5 lg:w-8 lg:h-8 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs lg:text-sm text-gray-500 truncate">Conductores</p>
                        <p className="text-xl lg:text-3xl font-bold text-[#1a5276]">{stats.activeDrivers}</p>
                        <p className="text-xs text-gray-500">de {stats.totalDrivers} totales</p>
                      </div>
                      <div className="p-2 lg:p-4 bg-amber-100 rounded-full shrink-0">
                        <Users className="w-5 h-5 lg:w-8 lg:h-8 text-amber-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs lg:text-sm text-gray-500 truncate">Calificacion</p>
                        <p className="text-xl lg:text-3xl font-bold text-[#1a5276]">{stats.avgRating || "-"}</p>
                        <p className="text-xs text-gray-500">promedio</p>
                      </div>
                      <div className="p-2 lg:p-4 bg-purple-100 rounded-full shrink-0">
                        <Star className="w-5 h-5 lg:w-8 lg:h-8 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Trips */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Ultimos Viajes</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("trips")}>
                    Ver todos
                  </Button>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pasajero</TableHead>
                        <TableHead className="hidden sm:table-cell">Destino</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Monto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                            Cargando...
                          </TableCell>
                        </TableRow>
                      ) : trips.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                            No hay viajes registrados
                          </TableCell>
                        </TableRow>
                      ) : (
                        trips.slice(0, 5).map((trip) => (
                          <TableRow key={trip.id}>
                            <TableCell className="font-medium">
                              {trip.passenger?.full_name || "Sin asignar"}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell truncate max-w-[200px]">
                              {trip.destination_address}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusBadge(trip.status)}>
                                {getStatusLabel(trip.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-semibold">
                              ${trip.final_price || trip.estimated_price || 0}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Trips Tab */}
          {activeTab === "trips" && (
            <div className="space-y-4">
              {/* Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Buscar por pasajero..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[140px]">
                          <Filter className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="completed">Completados</SelectItem>
                          <SelectItem value="in_progress">En curso</SelectItem>
                          <SelectItem value="pending">Pendientes</SelectItem>
                          <SelectItem value="cancelled">Cancelados</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon" onClick={fetchData}>
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trips Table */}
              <Card>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pasajero</TableHead>
                        <TableHead className="hidden md:table-cell">Conductor</TableHead>
                        <TableHead className="hidden lg:table-cell">Ruta</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Monto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            Cargando...
                          </TableCell>
                        </TableRow>
                      ) : filteredTrips.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            No se encontraron viajes
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTrips.map((trip) => (
                          <TableRow key={trip.id}>
                            <TableCell className="font-medium">
                              {trip.passenger?.full_name || "Sin asignar"}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {trip.driver?.profiles?.full_name || "-"}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell max-w-[200px]">
                              <div className="text-sm">
                                <p className="truncate">{trip.origin_address}</p>
                                <p className="text-gray-500 truncate">→ {trip.destination_address}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusBadge(trip.status)}>
                                {getStatusLabel(trip.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-semibold">
                              ${trip.final_price || trip.estimated_price || 0}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Fuel Tab */}
          {activeTab === "fuel" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <p className="text-xs lg:text-sm text-gray-500">Gasto gasolina</p>
                    <p className="text-xl lg:text-3xl font-bold text-red-700">${fuelSummary.totalFuel.toFixed(2)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <p className="text-xs lg:text-sm text-gray-500">Ingresos</p>
                    <p className="text-xl lg:text-3xl font-bold text-green-700">${fuelSummary.totalEarnings.toFixed(2)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <p className="text-xs lg:text-sm text-gray-500">Neto estimado</p>
                    <p className="text-xl lg:text-3xl font-bold text-[#1a5276]">${fuelSummary.totalNet.toFixed(2)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 lg:p-6">
                    <p className="text-xs lg:text-sm text-gray-500">Viajes completados</p>
                    <p className="text-xl lg:text-3xl font-bold text-[#1a5276]">{fuelSummary.totalTrips}</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Gastos e ingresos por conductor y dia</CardTitle>
                  <Button variant="outline" size="sm" onClick={fetchFuelReport}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualizar
                  </Button>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Conductor</TableHead>
                        <TableHead>Gasolina</TableHead>
                        <TableHead>Galones</TableHead>
                        <TableHead className="hidden lg:table-cell">Consumo</TableHead>
                        <TableHead>Ingresos</TableHead>
                        <TableHead>Neto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            Cargando...
                          </TableCell>
                        </TableRow>
                      ) : fuelRecords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            No hay registros de gasolina o ingresos completados.
                          </TableCell>
                        </TableRow>
                      ) : (
                        fuelRecords.map((record) => (
                          <TableRow key={record.key}>
                            <TableCell className="font-medium">
                              {new Date(`${record.date}T00:00:00`).toLocaleDateString("es-NI")}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{record.driverName}</p>
                                <p className="text-xs text-gray-500">{record.driverEmail}</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold text-red-700">
                              ${record.fuelAmount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p>{record.gallons.toFixed(2)} gal</p>
                                <p className="text-gray-500">${record.pricePerGallon.toFixed(2)}/gal</p>
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div className="text-sm">
                                <p>{record.consumedGallons.toFixed(2)} gal usados</p>
                                <p className="text-gray-500">{record.kmDriven.toFixed(2)} km</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold text-green-700">
                              ${record.earnings.toFixed(2)}
                              <p className="text-xs text-gray-500">{record.completedTrips} viajes</p>
                            </TableCell>
                            <TableCell className={record.netIncome >= 0 ? "font-bold text-[#1a5276]" : "font-bold text-red-700"}>
                              ${record.netIncome.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Drivers Tab */}
          {activeTab === "drivers" && (
            <div className="space-y-4">
              {/* Header with Create Button */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Lista de Conductores</h2>
                  <p className="text-sm text-gray-500">{drivers.length} conductores registrados</p>
                </div>
                <Dialog 
                  open={isCreateDriverOpen} 
                  onOpenChange={(open) => {
                    setIsCreateDriverOpen(open)
                    if (!open) resetCreateDriverForm()
                  }}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-[#1a5276] hover:bg-[#0d2d44] w-full sm:w-auto">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Crear Conductor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    {driverCreated ? (
                      <>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-green-600">
                            <Check className="w-5 h-5" />
                            Conductor Creado
                          </DialogTitle>
                          <DialogDescription>
                            Guarda estas credenciales, la contraseña no se podra recuperar.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="space-y-3">
                              <div>
                                <Label className="text-xs text-gray-500">Correo electronico</Label>
                                <p className="font-mono text-sm">{driverCreated.email}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-500">Contraseña</Label>
                                <div className="flex items-center gap-2">
                                  <p className="font-mono text-sm flex-1">{driverCreated.password}</p>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={copyPassword}
                                  >
                                    {copiedPassword ? (
                                      <Check className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            onClick={() => {
                              setIsCreateDriverOpen(false)
                              resetCreateDriverForm()
                            }}
                            className="w-full"
                          >
                            Cerrar
                          </Button>
                        </DialogFooter>
                      </>
                    ) : (
                      <form onSubmit={handleCreateDriver}>
                        <DialogHeader>
                          <DialogTitle>Crear Nuevo Conductor</DialogTitle>
                          <DialogDescription>
                            Ingresa los datos del conductor. La contraseña se genera automaticamente.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Correo electronico *</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="conductor@ejemplo.com"
                              value={newDriverEmail}
                              onChange={(e) => setNewDriverEmail(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="name">Nombre completo *</Label>
                            <Input
                              id="name"
                              placeholder="Juan Perez"
                              value={newDriverName}
                              onChange={(e) => setNewDriverName(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Telefono</Label>
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="+505 8888-8888"
                              value={newDriverPhone}
                              onChange={(e) => setNewDriverPhone(formatNicaraguaPhone(e.target.value))}
                              inputMode="numeric"
                              maxLength={12}
                              pattern="\+505[0-9]{8}"
                              required
                            />
                            <p className="text-xs text-gray-500">Formato: +505 seguido de 8 numeros.</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="driverPhoto">Foto del conductor</Label>
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-14 rounded-full bg-gray-100 border overflow-hidden flex items-center justify-center shrink-0">
                                {newDriverPhotoUrl ? (
                                  <img src={newDriverPhotoUrl} alt="Foto conductor" className="w-full h-full object-cover" />
                                ) : (
                                  <Camera className="w-6 h-6 text-gray-400" />
                                )}
                              </div>
                              <Input
                                id="driverPhoto"
                                type="url"
                                placeholder="https://.../foto-conductor.jpg"
                                value={newDriverPhotoUrl}
                                onChange={(e) => setNewDriverPhotoUrl(e.target.value)}
                              />
                            </div>
                            <p className="text-xs text-gray-500">
                              Pega la URL de una foto clara para que el pasajero pueda reconocerlo.
                            </p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="cedula">Numero de cedula *</Label>
                              <Input
                                id="cedula"
                                placeholder="001-000000-0000A"
                                value={newDriverCedula}
                                onChange={(e) => setNewDriverCedula(formatCedula(e.target.value))}
                                maxLength={16}
                                pattern="[0-9]{3}-[0-9]{6}-[0-9]{4}[A-Z]"
                                required
                              />
                              <p className="text-xs text-gray-500">Formato: 111-111111-1111A.</p>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="address">Direccion *</Label>
                              <Input
                                id="address"
                                placeholder="Rivas, Nicaragua"
                                value={newDriverAddress}
                                onChange={(e) => setNewDriverAddress(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="vehicleBrand">Marca del carro</Label>
                              <Input
                                id="vehicleBrand"
                                placeholder="Toyota"
                                value={newDriverVehicleBrand}
                                onChange={(e) => setNewDriverVehicleBrand(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="vehicleModel">Modelo *</Label>
                              <Input
                                id="vehicleModel"
                                placeholder="Corolla"
                                value={newDriverVehicleModel}
                                onChange={(e) => setNewDriverVehicleModel(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="vehicleYear">Ano</Label>
                              <Input
                                id="vehicleYear"
                                type="number"
                                min="1980"
                                max="2100"
                                placeholder="2020"
                                value={newDriverVehicleYear}
                                onChange={(e) => setNewDriverVehicleYear(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="vehicleColor">Color *</Label>
                              <Input
                                id="vehicleColor"
                                placeholder="Blanco"
                                value={newDriverVehicleColor}
                                onChange={(e) => setNewDriverVehicleColor(e.target.value)}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="vehiclePlate">Placa *</Label>
                              <Input
                                id="vehiclePlate"
                                placeholder="M 123-456"
                                value={newDriverVehiclePlate}
                                onChange={(e) => setNewDriverVehiclePlate(e.target.value.toUpperCase())}
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password">Contraseña generada</Label>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <Input
                                  id="password"
                                  type={showPassword ? "text" : "password"}
                                  value={newDriverPassword}
                                  onChange={(e) => setNewDriverPassword(e.target.value)}
                                  className="pr-10 font-mono"
                                />
                                <button
                                  type="button"
                                  className="absolute right-3 top-1/2 -translate-y-1/2"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="w-4 h-4 text-gray-400" />
                                  ) : (
                                    <Eye className="w-4 h-4 text-gray-400" />
                                  )}
                                </button>
                              </div>
                              <Button 
                                type="button" 
                                variant="outline"
                                onClick={() => setNewDriverPassword(generatePassword())}
                              >
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500">
                              Guarda esta contraseña, el conductor la necesitara para iniciar sesion.
                            </p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCreateDriverOpen(false)}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={
                              isCreatingDriver ||
                              !newDriverEmail ||
                              !newDriverName ||
                              !newDriverPhone ||
                              !newDriverCedula ||
                              !newDriverAddress ||
                              !newDriverVehicleModel ||
                              !newDriverVehicleColor ||
                              !newDriverVehiclePlate
                            }
                            className="bg-[#1a5276] hover:bg-[#0d2d44]"
                          >
                            {isCreatingDriver ? "Creando..." : "Crear Conductor"}
                          </Button>
                        </DialogFooter>
                      </form>
                    )}
                  </DialogContent>
                </Dialog>
              </div>

              {/* Drivers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {isLoading ? (
                  <Card className="col-span-full">
                    <CardContent className="p-8 text-center text-gray-500">
                      Cargando conductores...
                    </CardContent>
                  </Card>
                ) : drivers.length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="p-8 text-center">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No hay conductores registrados</p>
                      <Button 
                        onClick={() => setIsCreateDriverOpen(true)}
                        className="bg-[#1a5276] hover:bg-[#0d2d44]"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Crear primer conductor
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  drivers.map((driver) => (
                    <Card key={driver.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#1a5276] rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden shrink-0">
                              {driver.profiles?.avatar_url ? (
                                <img src={driver.profiles.avatar_url} alt={driver.profiles?.full_name || "Conductor"} className="w-full h-full object-cover" />
                              ) : (
                                driver.profiles?.full_name?.charAt(0) || "?"
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold truncate">
                                {driver.profiles?.full_name || "Sin nombre"}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {driver.profiles?.email}
                              </p>
                            </div>
                          </div>
                          <Badge className={getStatusBadge(driver.status)}>
                            {getStatusLabel(driver.status)}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 mb-3">
                          <p className="truncate">
                            {driver.vehicle_brand || "Vehiculo"} {driver.vehicle_model || ""} {driver.vehicle_color ? `| ${driver.vehicle_color}` : ""}
                          </p>
                          <p className="font-mono">{driver.vehicle_plate || "Sin placa"}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center border-t pt-3">
                          <div>
                            <p className="text-lg font-bold text-[#1a5276]">{driver.total_trips}</p>
                            <p className="text-xs text-gray-500">Viajes</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-[#1a5276]">{driver.rating || "-"}</p>
                            <p className="text-xs text-gray-500">Rating</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-[#1a5276]">
                              {driver.is_active ? "Si" : "No"}
                            </p>
                            <p className="text-xs text-gray-500">Activo</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-t pt-3 mt-3">
                          <Button variant="outline" size="sm" onClick={() => openEditDriver(driver)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-200 text-red-700 hover:bg-red-50"
                            disabled={deletingDriverId === driver.id}
                            onClick={() => handleDeleteDriver(driver)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {deletingDriverId === driver.id ? "..." : "Eliminar"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          <Dialog open={!!editingDriver} onOpenChange={(open) => !open && setEditingDriver(null)}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleUpdateDriver}>
                <DialogHeader>
                  <DialogTitle>Editar Conductor</DialogTitle>
                  <DialogDescription>
                    Actualiza los datos personales, foto y vehiculo del conductor.
                  </DialogDescription>
                </DialogHeader>
                {editingDriver && (
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Correo electronico</Label>
                        <Input
                          type="email"
                          value={editingDriver.email}
                          onChange={(e) => setEditingDriver({ ...editingDriver, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nombre completo</Label>
                        <Input
                          value={editingDriver.full_name}
                          onChange={(e) => setEditingDriver({ ...editingDriver, full_name: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Telefono</Label>
                        <Input
                          value={editingDriver.phone}
                          onChange={(e) => setEditingDriver({ ...editingDriver, phone: formatNicaraguaPhone(e.target.value) })}
                          inputMode="numeric"
                          maxLength={12}
                          pattern="\+505[0-9]{8}"
                          required
                        />
                        <p className="text-xs text-gray-500">Formato: +505 seguido de 8 numeros.</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Cedula</Label>
                        <Input
                          value={editingDriver.cedula_number}
                          onChange={(e) => setEditingDriver({ ...editingDriver, cedula_number: formatCedula(e.target.value) })}
                          maxLength={16}
                          pattern="[0-9]{3}-[0-9]{6}-[0-9]{4}[A-Z]"
                          required
                        />
                        <p className="text-xs text-gray-500">Formato: 111-111111-1111A.</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Direccion</Label>
                      <Input
                        value={editingDriver.address}
                        onChange={(e) => setEditingDriver({ ...editingDriver, address: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Foto del conductor</Label>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-gray-100 border overflow-hidden flex items-center justify-center shrink-0">
                          {editingDriver.avatar_url ? (
                            <img src={editingDriver.avatar_url} alt="Foto conductor" className="w-full h-full object-cover" />
                          ) : (
                            <Camera className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <Input
                          type="url"
                          placeholder="https://.../foto-conductor.jpg"
                          value={editingDriver.avatar_url}
                          onChange={(e) => setEditingDriver({ ...editingDriver, avatar_url: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Marca</Label>
                        <Input
                          value={editingDriver.vehicle_brand}
                          onChange={(e) => setEditingDriver({ ...editingDriver, vehicle_brand: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Modelo</Label>
                        <Input
                          value={editingDriver.vehicle_model}
                          onChange={(e) => setEditingDriver({ ...editingDriver, vehicle_model: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Ano</Label>
                        <Input
                          type="number"
                          min="1980"
                          max="2100"
                          value={editingDriver.vehicle_year}
                          onChange={(e) => setEditingDriver({ ...editingDriver, vehicle_year: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Color</Label>
                        <Input
                          value={editingDriver.vehicle_color}
                          onChange={(e) => setEditingDriver({ ...editingDriver, vehicle_color: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Placa</Label>
                        <Input
                          value={editingDriver.vehicle_plate}
                          onChange={(e) => setEditingDriver({ ...editingDriver, vehicle_plate: e.target.value.toUpperCase() })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditingDriver(null)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSavingDriver} className="bg-[#1a5276] hover:bg-[#0d2d44]">
                    {isSavingDriver ? "Guardando..." : "Guardar cambios"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  )
}
