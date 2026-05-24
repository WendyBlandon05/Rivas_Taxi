"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Car, CheckCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "No pudimos enviar el correo de recuperacion")
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos enviar el correo de recuperacion")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a5276] via-[#2874a6] to-[#1a5276] flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
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
            <CardTitle className="text-2xl text-[#1a5276]">Recuperar contrasena</CardTitle>
            <CardDescription>
              Escribe tu correo y te enviaremos un enlace para crear una nueva contrasena.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-lg text-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Revisa tu correo</p>
                    <p>Si existe una cuenta con ese email, recibiras un enlace para restablecer tu contrasena.</p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electronico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      id="email"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a5276] focus:border-transparent pl-10"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-[#1a5276] hover:bg-[#154360] text-white" disabled={isLoading}>
                  {isLoading ? "Enviando..." : "Enviar enlace"}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/login" className="mx-auto inline-flex items-center gap-2 text-sm text-[#1a5276] hover:underline">
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesion
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
