"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, Car, Users, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const { signIn, user, profile, isLoading: authLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("passenger")
  
  // Form state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Redirect if already logged in
  useEffect(() => {
    if (user && profile && !authLoading) {
      if (profile.role === "admin") {
        router.push("/admin")
      } else if (profile.role === "driver") {
        router.push("/driver")
      } else {
        router.push("/")
      }
    }
  }, [user, profile, authLoading, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      const { error: signInError } = await signIn(email, password)
      
      if (signInError) {
        setError(signInError.message === "Invalid login credentials" 
          ? "Credenciales invalidas. Verifica tu correo y contrasena."
          : signInError.message)
        setIsLoading(false)
        return
      }
      
      // The useEffect will handle redirect based on role
    } catch (err) {
      setError("Error al iniciar sesion. Intenta de nuevo.")
      setIsLoading(false)
    }
  }

  // Show loading if checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a5276] via-[#2874a6] to-[#1a5276] flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    )
  }

  const LoginForm = ({ userType }: { userType: string }) => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor={`email-${userType}`}>Correo Electronico</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            id={`email-${userType}`}
            name="email"
            type="email"
            placeholder="correo@ejemplo.com"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a5276] focus:border-transparent pl-10"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`password-${userType}`}>Contrasena</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            id={`password-${userType}`}
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="********"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a5276] focus:border-transparent pl-10 pr-10"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="remember" className="rounded border-gray-300" />
          <span className="text-sm text-gray-600">Recordarme</span>
        </label>
        <Link href="/forgot-password" className="text-sm text-[#1a5276] hover:underline">
          Olvidaste tu contrasena?
        </Link>
      </div>

      <Button
        type="submit"
        className="w-full bg-[#1a5276] hover:bg-[#154360] text-white"
        disabled={isLoading}
      >
        {isLoading ? "Iniciando sesion..." : "Iniciar Sesion"}
      </Button>
    </form>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a5276] via-[#2874a6] to-[#1a5276] flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center">
              <Car className="w-9 h-9 text-white" />
            </div>
            <span className="text-white font-bold text-2xl">PACIFIC COAST TAXI</span>
          </Link>
        </div>

        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-[#1a5276]">Bienvenido</CardTitle>
            <CardDescription>
              Selecciona tu tipo de cuenta para iniciar sesion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setError("") }} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="passenger" className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Pasajero</span>
                </TabsTrigger>
                <TabsTrigger value="driver" className="flex items-center gap-1">
                  <Car className="w-4 h-4" />
                  <span className="hidden sm:inline">Conductor</span>
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="passenger">
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Inicia sesion con tu cuenta de pasajero para reservar viajes.
                  </p>
                </div>
                <LoginForm userType="passenger" />
              </TabsContent>

              <TabsContent value="driver">
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    Usa las credenciales proporcionadas por el administrador.
                  </p>
                </div>
                <LoginForm userType="driver" />
              </TabsContent>

              <TabsContent value="admin">
                <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-800">
                    Acceso restringido solo para administradores autorizados.
                  </p>
                </div>
                <LoginForm userType="admin" />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <p className="text-center text-sm text-gray-600">
              No tienes una cuenta?{" "}
              <Link href="/register" className="text-[#1a5276] font-semibold hover:underline">
                Registrate aqui
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="text-center text-white/60 text-sm mt-6">
          <Link href="/" className="hover:text-white transition-colors">
            Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  )
}
