"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/passenger/header"
import { Footer } from "@/components/passenger/footer"
import { TripBookingForm } from "@/components/passenger/trip-booking-form"
import { TripConfirmation } from "@/components/passenger/trip-confirmation"
import { ChatBot } from "@/components/passenger/chat-bot"
import { MyTrips } from "@/components/passenger/my-trips"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, List } from "lucide-react"

export interface TripData {
  id?: string
  confirmationCode?: string
  origin: string
  destination: string
  date: string
  time: string
  passengers: number
  serviceType: string
  notes: string
  phone: string
  name: string
  priceUsd?: number
  finalPrice?: number
  distanceKm?: number
  status?: string
  driverAssigned?: boolean
  driver?: {
    id: string
    vehicle_brand: string
    vehicle_model: string
    vehicle_color: string
    vehicle_plate: string
    rating: number
    total_trips: number
    profile?: {
      full_name: string
      phone: string
    }
  }
}

export default function TripsPage() {
  const [tripData, setTripData] = useState<TripData | null>(null)
  const [isBooked, setIsBooked] = useState(false)
  const [activeTab, setActiveTab] = useState("book")
  const [refreshTrips, setRefreshTrips] = useState(0)

  const handleBooking = (data: TripData) => {
    setTripData(data)
    setIsBooked(true)
    setRefreshTrips(prev => prev + 1)
  }

  const handleNewTrip = () => {
    setTripData(null)
    setIsBooked(false)
    setActiveTab("book")
  }

  const handleViewTrips = () => {
    setActiveTab("my-trips")
    setIsBooked(false)
    setTripData(null)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 pt-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#1a5276] mb-2">
              {isBooked ? "Viaje Reservado" : "Centro de Viajes"}
            </h1>
            <p className="text-gray-600">
              {isBooked 
                ? "Tu viaje ha sido confirmado. Revisa los detalles a continuacion."
                : "Reserva un nuevo viaje o consulta tus viajes anteriores."
              }
            </p>
          </div>

          {isBooked && tripData ? (
            <div>
              <TripConfirmation tripData={tripData} onNewTrip={handleNewTrip} />
              <div className="text-center mt-6">
                <button
                  onClick={handleViewTrips}
                  className="text-[#1a5276] hover:underline font-medium"
                >
                  Ver todos mis viajes
                </button>
              </div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                <TabsTrigger value="book" className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" />
                  Nuevo Viaje
                </TabsTrigger>
                <TabsTrigger value="my-trips" className="flex items-center gap-2">
                  <List className="w-4 h-4" />
                  Mis Viajes
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="book">
                <TripBookingForm onBook={handleBooking} />
              </TabsContent>
              
              <TabsContent value="my-trips">
                <MyTrips key={refreshTrips} onNewTrip={() => setActiveTab("book")} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      <Footer />
      <ChatBot />
    </main>
  )
}
