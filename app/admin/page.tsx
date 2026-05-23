"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  Users, Car, DollarSign, TrendingUp, 
  Star, Bell, Settings, LogOut,
  Search, Filter, Download, RefreshCw, Plus, Menu, X, Eye, EyeOff, Copy, Check, UserPlus
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
  SheetTrigger,
} from "@/components/ui/sheet"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface Trip {
  id: string
  passenger: { full_name: string } | null
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
  } | null
  status: "available" | "busy" | "offline"
  total_trips: number
  rating: number
  is_active: boolean
}

interface Stats {
  todayEarnings: number
  todayTrips: number
  activeDrivers: number
  totalDrivers: number
  avgRating: number
}

function generatePassword(length: number = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%"
  let password = ""
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export default function AdminDashboard() {
  const { user, profile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<"overview" | "trips" | "drivers">("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [trips, setTrips] = useState<Trip[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [stats, setStats] = useState<Stats>({
    todayEarnings: 0,
    todayTrips: 0,
    activeDrivers: 0,
    totalDrivers: 0,
    avgRating: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Create driver form state
  const [isCreateDriverOpen, setIsCreateDriverOpen] = useState(false)
  const [newDriverEmail, setNewDriverEmail] = useState("")
  const [newDriverName, setNewDriverName] = useState("")
  const [newDriverPhone, setNewDriverPhone] = useState("")
  const [newDriverPassword, setNewDriverPassword] = useState(() => generatePassword())
  const [showPassword, setShowPassword] = useState(false)
  const [isCreatingDriver, setIsCreatingDriver] = useState(false)
  const [copiedPassword, setCopiedPassword] = useState(false)
  const [driverCreated, setDriverCreated] = useState<{ email: string; password: string } | null>(null)

  const supabase = createClient()

  useEffect(() => {
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
          passenger:profiles!trips_passenger_id_fkey(full_name),
          driver:drivers!trips_driver_id_fkey(id, profiles(full_name))
        `)
        .order("created_at", { ascending: false })
        .limit(50)

      if (tripsData) {
        setTrips(tripsData as unknown as Trip[])
      }

      // Fetch drivers
      const { data: driversData } = await supabase
        .from("drivers")
        .select(`
          id,
          status,
          total_trips,
          rating,
          is_active,
          profiles(full_name, email)
        `)
        .order("total_trips", { ascending: false })

      if (driversData) {
        setDrivers(driversData as unknown as Driver[])
        
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
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateDriver(e: React.FormEvent) {
    e.preventDefault()
    setIsCreatingDriver(true)

    try {
      const response = await fetch("/api/admin/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newDriverEmail,
          password: newDriverPassword,
          full_name: newDriverName,
          phone: newDriverPhone
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
    setNewDriverPassword(generatePassword())
    setShowPassword(false)
    setCopiedPassword(false)
    setDriverCreated(null)
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
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesion
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
                </h1>
                <p className="text-xs lg:text-sm text-gray-500 hidden sm:block">
                  {new Date().toLocaleDateString('es-NI', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
                  <DialogContent className="sm:max-w-md">
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
                              onChange={(e) => setNewDriverPhone(e.target.value)}
                            />
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
                            disabled={isCreatingDriver || !newDriverEmail || !newDriverName}
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
                            <div className="w-12 h-12 bg-[#1a5276] rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {driver.profiles?.full_name?.charAt(0) || "?"}
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
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
