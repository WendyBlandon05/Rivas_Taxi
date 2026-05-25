"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Car, Users, MapPin, Shield, Clock, Heart, Star, ChevronRight } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

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
  { icon: Shield, title: { es: "Seguridad", en: "Safety" }, description: { es: "Tu bienestar es nuestra prioridad. Conductores verificados y vehiculos en optimas condiciones.", en: "Your well-being is our priority. Verified drivers and vehicles in excellent condition." } },
  { icon: Clock, title: { es: "Puntualidad", en: "Punctuality" }, description: { es: "Respetamos tu tiempo. Llegamos siempre a la hora acordada para que disfrutes al maximo.", en: "We respect your time. We arrive at the agreed time so you can enjoy every moment." } },
  { icon: Heart, title: { es: "Pasion", en: "Passion" }, description: { es: "Amamos Nicaragua y queremos compartir su belleza contigo. Cada viaje es una experiencia unica.", en: "We love Nicaragua and want to share its beauty with you. Every ride is a unique experience." } },
  { icon: Users, title: { es: "Servicio Personalizado", en: "Personalized Service" }, description: { es: "Nos adaptamos a tus necesidades. Tours a tu medida para grupos, familias o viajeros solos.", en: "We adapt to your needs with custom rides for groups, families or solo travelers." } },
]

const stats = [
  { number: "500+", label: { es: "Viajes Realizados", en: "Completed Rides" } },
  { number: "98%", label: { es: "Clientes Satisfechos", en: "Satisfied Customers" } },
  { number: "15+", label: { es: "Destinos", en: "Destinations" } },
  { number: "24/7", label: { es: "Disponibilidad", en: "Availability" } },
]

const destinations = [
  { name: "San Juan del Sur", desc: { es: "La joya del surf y la vida nocturna", en: "The jewel of surf and nightlife" } },
  { name: "Playa Maderas", desc: { es: "Olas perfectas y tranquilidad", en: "Perfect waves and quiet moments" } },
  { name: "Playa Gigante", desc: { es: "Paraiso escondido para aventureros", en: "A hidden paradise for adventurers" } },
  { name: "Granada", desc: { es: "Historia colonial y arquitectura", en: "Colonial history and architecture" } },
  { name: "Ometepe", desc: { es: "La isla de los volcanes gemelos", en: "The island of twin volcanoes" } },
  { name: { es: "Tours Personalizados", en: "Custom Tours" }, desc: { es: "Tu aventura, a tu manera", en: "Your adventure, your way" } },
]

export default function AboutPage() {
  const { language } = useLanguage()

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
              {language === "en" ? "Back Home" : "Volver al Inicio"}
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
                {language === "en" ? "Since 2025" : "Desde 2025"}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {language === "en" ? "Meet Our Story" : "Conoce Nuestra Historia"}
              </h1>
              <p className="text-xl text-white/90 leading-relaxed">
                {language === "en"
                  ? "We are a Nicaraguan company born in Rivas, dedicated to helping travelers discover the Pacific coast."
                  : "Somos una empresa nicaraguense nacida en Rivas, dedicada a mostrar las maravillas del Pacifico a viajeros de todo el mundo."}
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
                {language === "en" ? "Our Story" : "Nuestra Historia"}
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                {language === "en" ? (
                  <>
                    <p><span className="font-semibold text-[#1a5276]">Pacific Coast Taxi</span> was born in 2025 in the heart of Rivas, Nicaragua, with a clear purpose: to offer travelers a safe, comfortable and authentic way to explore Nicaragua's Pacific coast.</p>
                    <p>From the beginning, we have focused on creating memorable experiences for backpackers, families and adventurers looking for beaches, culture and the warmth of our people.</p>
                    <p>Today, we are more than transportation. We are local hosts who know San Juan del Sur, Playa Maderas, Playa Gigante and the destinations that make Rivas special.</p>
                  </>
                ) : (
                  <>
                    <p><span className="font-semibold text-[#1a5276]">Pacific Coast Taxi</span> nacio en 2025 en el corazon de Rivas, Nicaragua, con un sueno claro: ofrecer a los viajeros extranjeros una forma segura, comoda y autentica de explorar las joyas del Pacifico nicaraguense.</p>
                    <p>Desde nuestros inicios, nos hemos dedicado a crear experiencias memorables para mochileros, familias y aventureros que llegan a nuestras costas buscando playas paradisiacas, cultura vibrante y la calidez de nuestra gente.</p>
                    <p>Hoy, somos mas que un servicio de transporte. Somos embajadores de nuestra tierra, guias apasionados que conocen cada rincon de San Juan del Sur, Playa Maderas, Playa Gigante y todos los destinos que hacen de Rivas un lugar magico.</p>
                  </>
                )}
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/trips">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-full flex items-center gap-2">
                    {language === "en" ? "Book Your Tour" : "Reserva Tu Tour"}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="border-2 border-[#1a5276] text-[#1a5276] hover:bg-[#1a5276] hover:text-white font-bold px-6 py-3 rounded-full">
                    {language === "en" ? "Contact Us" : "Contactanos"}
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
                <div className="text-white/80">{stat.label[language]}</div>
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
              {language === "en" ? "Our Values" : "Nuestros Valores"}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {language === "en"
                ? "Every ride is guided by principles that define us as a company and as proud Nicaraguans."
                : "Cada viaje que realizamos esta guiado por principios que nos definen como empresa y como nicaraguenses orgullosos."}
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
                  <h3 className="text-xl font-bold text-[#1a5276] mb-2">{value.title[language]}</h3>
                  <p className="text-gray-600 text-sm">{value.description[language]}</p>
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
              {language === "en" ? "Destinations We Love" : "Destinos que Amamos"}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {language === "en"
                ? "We know the beaches, sunsets and roads of Nicaragua's Pacific coast. Let us take you there."
                : "Conocemos cada playa, cada atardecer y cada camino del Pacifico nicaraguense. Dejanos llevarte a descubrirlos."}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {destinations.map((dest, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-amber-500 hover:border-[#1a5276]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-[#1a5276]">{typeof dest.name === "string" ? dest.name : dest.name[language]}</h3>
                </div>
                <p className="text-gray-600 text-sm">{dest.desc[language]}</p>
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
            {language === "en" ? "Ready for your next adventure?" : "Listo para tu proxima aventura?"}
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            {language === "en"
              ? "Whether you are looking for waves, unforgettable sunsets or a better way to explore Nicaragua, we are here to take you."
              : "Ya sea que busques las mejores olas, atardeceres inolvidables o simplemente explorar Nicaragua, estamos aqui para llevarte."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/trips">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-4 rounded-full text-lg">
                {language === "en" ? "Book Now" : "Reservar Ahora"}
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
            <span className="text-white ml-2 text-sm">{language === "en" ? "Happy Customers" : "Clientes Felices"}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
