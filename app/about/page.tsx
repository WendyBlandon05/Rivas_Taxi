"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Car, Users, MapPin, Shield, Clock, Heart, Star, ChevronRight } from "lucide-react"

const clientImages = [
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-EHWG1db9PxfOJaaYXVlOwC97Niy5gN.png",
    alt: "Grupo de mochileros europeos en San Juan del Sur"
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image.png-ytfrouaGOrHEnMPHqiOGQh420QwU2F.jpeg",
    alt: "Familia con nuestro conductor"
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-iYaEcg4IpYRxUUhdsGlLn9pb4Vl53A.png",
    alt: "Turistas en Hostel Pachamama"
  }
]

const values = [
  {
    icon: Shield,
    title: "Seguridad",
    description: "Tu bienestar es nuestra prioridad. Conductores verificados y vehiculos en optimas condiciones."
  },
  {
    icon: Clock,
    title: "Puntualidad",
    description: "Respetamos tu tiempo. Llegamos siempre a la hora acordada para que disfrutes al maximo."
  },
  {
    icon: Heart,
    title: "Pasion",
    description: "Amamos Nicaragua y queremos compartir su belleza contigo. Cada viaje es una experiencia unica."
  },
  {
    icon: Users,
    title: "Servicio Personalizado",
    description: "Nos adaptamos a tus necesidades. Tours a tu medida para grupos, familias o viajeros solos."
  }
]

const stats = [
  { number: "500+", label: "Viajes Realizados" },
  { number: "98%", label: "Clientes Satisfechos" },
  { number: "15+", label: "Destinos" },
  { number: "24/7", label: "Disponibilidad" }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1a5276] py-4 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
              <Car className="w-7 h-7 text-white" />
            </div>
            <span className="text-white font-bold text-xl">PACIFIC COAST TAXI</span>
          </Link>
          <Link href="/">
            <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section with Image Background */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={clientImages[0].src}
            alt="Turistas felices"
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a5276]/90 to-[#1a5276]/70" />
        </div>
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="max-w-2xl">
              <span className="inline-block bg-amber-500 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4">
                Desde 2025
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Conoce Nuestra Historia
              </h1>
              <p className="text-xl text-white/90 leading-relaxed">
                Somos una empresa nicaraguense nacida en Rivas, dedicada a mostrar las maravillas del Pacifico a viajeros de todo el mundo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1a5276] mb-6">
                Nuestra Historia
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  <span className="font-semibold text-[#1a5276]">Pacific Coast Taxi</span> nacio en 2025 en el corazon de Rivas, Nicaragua, con un sueno claro: ofrecer a los viajeros extranjeros una forma segura, comoda y autentica de explorar las joyas del Pacifico nicaraguense.
                </p>
                <p>
                  Desde nuestros inicios, nos hemos dedicado a crear experiencias memorables para mochileros, familias y aventureros que llegan a nuestras costas buscando playas paradisiacas, cultura vibrante y la calidez de nuestra gente.
                </p>
                <p>
                  Hoy, somos mas que un servicio de transporte. Somos embajadores de nuestra tierra, guias apasionados que conocen cada rincón de San Juan del Sur, Playa Maderas, Playa Gigante y todos los destinos que hacen de Rivas un lugar magico.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/trips">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-full flex items-center gap-2">
                    Reserva Tu Tour
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="border-2 border-[#1a5276] text-[#1a5276] hover:bg-[#1a5276] hover:text-white font-bold px-6 py-3 rounded-full">
                    Contactanos
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <img 
                      src={clientImages[1].src}
                      alt={clientImages[1].alt}
                      className="w-full h-48 object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <img 
                      src={clientImages[2].src}
                      alt={clientImages[2].alt}
                      className="w-full h-64 object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>
                <div className="pt-8">
                  <div className="rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <img 
                      src={clientImages[0].src}
                      alt={clientImages[0].alt}
                      className="w-full h-80 object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-amber-500/20 rounded-full -z-10" />
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#1a5276]/10 rounded-full -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[#1a5276]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-amber-400 mb-2">{stat.number}</div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a5276] mb-4">
              Nuestros Valores
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Cada viaje que realizamos esta guiado por principios que nos definen como empresa y como nicaraguenses orgullosos.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card 
                key={index} 
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-500 transition-colors duration-300">
                    <value.icon className="w-8 h-8 text-amber-500 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1a5276] mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a5276] mb-4">
              Destinos que Amamos
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Conocemos cada playa, cada atardecer y cada camino del Pacifico nicaraguense. Dejanos llevarte a descubrirlos.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "San Juan del Sur", desc: "La joya del surf y la vida nocturna" },
              { name: "Playa Maderas", desc: "Olas perfectas y tranquilidad" },
              { name: "Playa Gigante", desc: "Paraiso escondido para aventureros" },
              { name: "Granada", desc: "Historia colonial y arquitectura" },
              { name: "Ometepe", desc: "La isla de los volcanes gemelos" },
              { name: "Tours Personalizados", desc: "Tu aventura, a tu manera" }
            ].map((dest, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-amber-500 hover:border-[#1a5276]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-[#1a5276]">{dest.name}</h3>
                </div>
                <p className="text-gray-600 text-sm">{dest.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-[#1a5276] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img 
            src={clientImages[2].src}
            alt="Background"
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Listo para tu proxima aventura?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Ya sea que busques las mejores olas, atardeceres inolvidables o simplemente explorar Nicaragua, estamos aqui para llevarte.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/trips">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-4 rounded-full text-lg">
                Reservar Ahora
              </Button>
            </Link>
            <Link href="https://wa.me/50577502626" target="_blank">
              <Button variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold px-8 py-4 rounded-full text-lg">
                WhatsApp +505 7750-2626
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0d2f3f] py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold">Pacific Coast Taxi</span>
          </div>
          <p className="text-gray-400 text-sm">
            2025 Pacific Coast Taxi. Rivas, Nicaragua.
          </p>
          <div className="flex items-center gap-2 text-amber-400">
            <Star className="w-4 h-4 fill-amber-400" />
            <Star className="w-4 h-4 fill-amber-400" />
            <Star className="w-4 h-4 fill-amber-400" />
            <Star className="w-4 h-4 fill-amber-400" />
            <Star className="w-4 h-4 fill-amber-400" />
            <span className="text-white ml-2 text-sm">Clientes Felices</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
