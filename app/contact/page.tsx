"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Car, ArrowLeft, MapPin, Clock, Shield, MessageCircle, Phone, Mail } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

// WhatsApp icon component
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

export default function ContactPage() {
  const { language } = useLanguage()
  const whatsappNumber = "50577502626"
  const whatsappLink = `https://wa.me/${whatsappNumber}`

  const contactReasons = [
    {
      icon: MessageCircle,
      title: { es: "Consultas Generales", en: "General Questions" },
      description: {
        es: "Preguntanos sobre nuestros servicios, tarifas o disponibilidad.",
        en: "Ask us about our services, rates or availability.",
      },
    },
    {
      icon: MapPin,
      title: { es: "Rutas Especiales", en: "Special Routes" },
      description: {
        es: "Solicita cotizacion para destinos fuera de nuestra cobertura habitual.",
        en: "Request a quote for destinations outside our usual coverage area.",
      },
    },
    {
      icon: Clock,
      title: { es: "Reservas Urgentes", en: "Urgent Bookings" },
      description: {
        es: "Necesitas un viaje de ultimo momento? Estamos para ayudarte.",
        en: "Need a last-minute ride? We are here to help.",
      },
    },
    {
      icon: Shield,
      title: { es: "Reportar Incidentes", en: "Report Incidents" },
      description: {
        es: "Si tuviste algun problema durante tu viaje, cuentanos.",
        en: "If you had any issue during your ride, let us know.",
      },
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a5276] to-[#0d2d44]">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <Link href="/" className="inline-flex items-center gap-3 text-white hover:text-amber-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg">PACIFIC COAST TAXI</span>
          </div>
        </Link>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-[#25D366] rounded-full mb-6 shadow-lg shadow-green-500/30">
              <WhatsAppIcon className="w-14 h-14 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {language === "en" ? "Contact Us on WhatsApp" : "Contactanos por WhatsApp"}
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              {language === "en"
                ? "We are available 24/7 to help you. Message us and we will reply as soon as possible."
                : "Estamos disponibles 24/7 para atenderte. Escribenos y te responderemos lo mas pronto posible."}
            </p>
          </div>

          {/* WhatsApp Button */}
          <div className="text-center mb-16">
            <Link href={whatsappLink} target="_blank">
              <Button 
                size="lg" 
                className="bg-[#25D366] hover:bg-[#128C7E] text-white font-bold px-12 py-8 text-xl rounded-full shadow-xl shadow-green-500/30 transition-all duration-300 hover:scale-105"
              >
                <WhatsAppIcon className="w-8 h-8 mr-3" />
                +505 7750-2626
              </Button>
            </Link>
            <p className="text-gray-400 mt-4 text-sm">
              {language === "en" ? "Click to open WhatsApp directly" : "Haz clic para abrir WhatsApp directamente"}
            </p>
          </div>

          {/* Contact Reasons */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              {language === "en" ? "How can we help you?" : "Como podemos ayudarte?"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contactReasons.map((reason, index) => (
                <Card 
                  key={index} 
                  className="bg-white/10 border-0 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <reason.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-1">{reason.title[language]}</h3>
                        <p className="text-gray-300 text-sm">{reason.description[language]}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Additional Contact Info */}
          <Card className="bg-white/5 border-0 backdrop-blur-sm">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-white text-center mb-6">
                {language === "en" ? "Other Contact Options" : "Otras formas de contacto"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-14 h-14 bg-[#1a5276] rounded-full flex items-center justify-center mx-auto mb-3">
                    <Phone className="w-7 h-7 text-amber-400" />
                  </div>
                  <p className="text-white font-semibold">{language === "en" ? "Calls" : "Llamadas"}</p>
                  <p className="text-gray-400 text-sm">+505 7750-2626</p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 bg-[#1a5276] rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-7 h-7 text-amber-400" />
                  </div>
                  <p className="text-white font-semibold">Email</p>
                  <p className="text-gray-400 text-sm">info@pacificcoasttaxi.com</p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 bg-[#1a5276] rounded-full flex items-center justify-center mx-auto mb-3">
                    <MapPin className="w-7 h-7 text-amber-400" />
                  </div>
                  <p className="text-white font-semibold">{language === "en" ? "Location" : "Ubicacion"}</p>
                  <p className="text-gray-400 text-sm">Rivas, Nicaragua</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Notice */}
          <div className="mt-12 text-center">
            <Card className="bg-amber-500/20 border-amber-500/50 inline-block">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-amber-400" />
                  <p className="text-white">
                    <span className="font-semibold">
                      {language === "en" ? "In case of an emergency during a ride," : "En caso de emergencia durante un viaje,"}
                    </span>
                    <br className="md:hidden" />
                    <span className="text-gray-300">
                      {language === "en" ? " contact us immediately on WhatsApp." : " contactanos inmediatamente al WhatsApp."}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-12 border-t border-white/10">
        <div className="text-center text-gray-400 text-sm">
          <p>
            &copy; {new Date().getFullYear()} Pacific Coast Taxi.{" "}
            {language === "en" ? "All rights reserved." : "Todos los derechos reservados."}
          </p>
          <Link href="/" className="text-amber-400 hover:text-amber-300 mt-2 inline-block">
            {language === "en" ? "Back home" : "Volver al inicio"}
          </Link>
        </div>
      </footer>
    </div>
  )
}
