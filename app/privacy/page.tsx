"use client"

import Link from "next/link"
import { ArrowLeft, Car, FileText, Lock, ShieldCheck, UserCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { BrandLogo } from "@/components/brand-logo"
import { useLanguage } from "@/contexts/language-context"

const sections = [
  {
    icon: ShieldCheck,
    title: { es: "Uso de la información", en: "Use of information" },
    body: {
      es: "Pacific Coast Taxi utiliza los datos proporcionados únicamente para gestionar reservas, contactar al pasajero, asignar conductores y dar seguimiento al servicio solicitado.",
      en: "Pacific Coast Taxi uses the information provided only to manage bookings, contact passengers, assign drivers and follow up on requested services.",
    },
  },
  {
    icon: Lock,
    title: { es: "Protección de datos personales", en: "Personal data protection" },
    body: {
      es: "No vendemos, alquilamos ni compartimos datos personales con terceros para fines comerciales. La información se mantiene dentro del sistema para fines operativos y de seguridad.",
      en: "We do not sell, rent or share personal data with third parties for commercial purposes. Information is kept within the system for operational and safety purposes.",
    },
  },
  {
    icon: Car,
    title: { es: "Condiciones de reservación", en: "Booking conditions" },
    body: {
      es: "Al reservar un viaje, el usuario acepta brindar información real, seleccionar correctamente origen, destino, fecha y hora, y estar disponible para la coordinación del servicio.",
      en: "By booking a ride, users agree to provide real information, correctly select pickup, destination, date and time, and be available for service coordination.",
    },
  },
  {
    icon: UserCheck,
    title: { es: "Seguridad del pasajero", en: "Passenger safety" },
    body: {
      es: "El registro permite asociar cada viaje a una cuenta, mantener historial de reservas y mejorar la seguridad tanto del pasajero como del conductor asignado.",
      en: "Registration allows each ride to be linked to an account, keeps booking history and improves safety for both passengers and assigned drivers.",
    },
  },
]

export default function PrivacyPage() {
  const { language } = useLanguage()

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#1a5276] to-[#0d2d44] text-white">
      <header className="container mx-auto px-4 py-6">
        <Link href="/" className="inline-flex items-center gap-3 text-white hover:text-amber-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <div className="flex items-center gap-2">
            <BrandLogo className="h-10 w-10" />
            <span className="font-bold text-lg">PACIFIC COAST TAXI</span>
          </div>
        </Link>
      </header>

      <section className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500 shadow-lg shadow-amber-500/20">
              <FileText className="h-10 w-10" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold">
              {language === "en" ? "Privacy Policy" : "Política de Privacidad"}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-gray-300">
              {language === "en"
                ? "This page explains how Pacific Coast Taxi handles user information and the basic conditions accepted when registering or booking a ride."
                : "Esta página explica cómo Pacific Coast Taxi maneja la información de los usuarios y las condiciones básicas aceptadas al registrarse o reservar un viaje."}
            </p>
          </div>

          <Card className="mb-6 border-0 bg-white/10 text-white backdrop-blur">
            <CardContent className="p-6 md:p-8">
              <h2 className="mb-3 text-2xl font-bold text-amber-400">
                {language === "en" ? "Commitment to privacy" : "Compromiso con la privacidad"}
              </h2>
              <p className="leading-relaxed text-gray-200">
                {language === "en"
                  ? "The personal information requested in the system is used only to provide the transportation service, manage communication and improve operational control. Pacific Coast Taxi will not use customer data for purposes unrelated to the service."
                  : "La información personal solicitada en el sistema se utiliza únicamente para brindar el servicio de transporte, gestionar la comunicación y mejorar el control operativo. Pacific Coast Taxi no utilizará los datos de los clientes para fines ajenos al servicio."}
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-5 md:grid-cols-2">
            {sections.map((section) => (
              <Card key={section.title.es} className="border-0 bg-white text-slate-900 shadow-xl">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1a5276] text-white">
                    <section.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-[#1a5276]">{section.title[language]}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{section.body[language]}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6 border border-amber-500/40 bg-amber-500/15 text-white">
            <CardContent className="p-6 md:p-8">
              <h2 className="mb-3 text-xl font-bold text-amber-300">
                {language === "en" ? "Acceptance" : "Aceptación"}
              </h2>
              <p className="leading-relaxed text-gray-100">
                {language === "en"
                  ? "By creating an account or booking a ride, the user confirms that they have read and accepted this privacy policy and the basic service conditions described here."
                  : "Al crear una cuenta o reservar un viaje, el usuario confirma que ha leído y aceptado esta política de privacidad y las condiciones básicas del servicio descritas aquí."}
              </p>
            </CardContent>
          </Card>

          <div className="mt-10 text-center">
            <Link href="/" className="inline-flex rounded-full bg-amber-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-amber-600">
              {language === "en" ? "Back home" : "Volver al inicio"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
