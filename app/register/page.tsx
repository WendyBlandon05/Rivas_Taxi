"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/contexts/auth-context"

export default function RegisterPage() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    password: "",
    confirmPassword: ""
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (formData.password !== formData.confirmPassword) {
      setError("Las contrasenas no coinciden")
      return
    }
    
    if (formData.password.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres")
      return
    }
    
    if (!acceptedTerms) {
      setError("Debes aceptar los terminos y condiciones")
      return
    }
    
    setIsLoading(true)
    
    try {
      const { error: signUpError } = await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        role: "passenger"
      })
      
      if (signUpError) {
        setError(signUpError.message)
        setIsLoading(false)
        return
      }
      
      setSuccess(true)
    } catch (err) {
      setError("Error al crear la cuenta. Intenta de nuevo.")
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a5276] via-[#2874a6] to-[#1a5276] flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center">
              <Car className="w-8 h-8 text-white" />
            </div>
            <span className="text-white font-bold text-xl">PACIFIC COAST TAXI</span>
          </Link>
        </div>

        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-[#1a5276]">Crear Cuenta</CardTitle>
            <CardDescription>
              Registrate para comenzar a usar Pacific Coast Taxi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  <p className="font-semibold">Cuenta creada exitosamente!</p>
                  <p>Por favor revisa tu correo electronico para verificar tu cuenta.</p>
                  <Link href="/login" className="text-green-800 underline mt-2 inline-block">
                    Ir a iniciar sesion
                  </Link>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                      id="firstName"
                      placeholder="Juan"
                      className="pl-10"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    placeholder="Perez"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electronico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+505 8888-8888"
                    className="pl-10"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicacion</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <Input
                    id="location"
                    placeholder="Rivas, Nicaragua"
                    className="pl-10"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contrasena</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    className="pl-10 pr-10"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contrasena</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="********"
                    className="pl-10 pr-10"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                />
                <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                  Acepto los{" "}
                  <Link href="/terms" className="text-[#1a5276] hover:underline">
                    terminos y condiciones
                  </Link>{" "}
                  y la{" "}
                  <Link href="/privacy" className="text-[#1a5276] hover:underline">
                    politica de privacidad
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#1a5276] hover:bg-[#154360] text-white"
                disabled={isLoading || !acceptedTerms}
              >
                {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <p className="text-center text-sm text-gray-600">
              Ya tienes una cuenta?{" "}
              <Link href="/login" className="text-[#1a5276] font-semibold hover:underline">
                Inicia sesion aqui
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
