"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Car, Eye, EyeOff, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres")
      return
    }

    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden")
      return
    }

    setIsLoading(true)

    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setIsLoading(false)
      return
    }

    setSuccess(true)
    setIsLoading(false)
    setTimeout(() => router.push("/login"), 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a5276] via-[#2874a6] to-[#1a5276] flex items-center justify-center p-4">
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
            <CardTitle className="text-2xl text-[#1a5276]">Nueva contrasena</CardTitle>
            <CardDescription>Escribe una contrasena nueva para recuperar el acceso a tu cuenta.</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                Contrasena actualizada. Te estamos llevando al inicio de sesion.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="password">Nueva contrasena</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a5276] focus:border-transparent pl-10 pr-10"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
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
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar contrasena</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a5276] focus:border-transparent pl-10"
                      required
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-[#1a5276] hover:bg-[#154360] text-white" disabled={isLoading}>
                  {isLoading ? "Actualizando..." : "Actualizar contrasena"}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/login" className="mx-auto text-sm text-[#1a5276] hover:underline">
              Volver al inicio de sesion
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
