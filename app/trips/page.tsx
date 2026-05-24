"use client"

import { Suspense, useState } from "react"
import { Header } from "@/components/passenger/header"
import { Footer } from "@/components/passenger/footer"
import { TripBookingForm } from "@/components/passenger/trip-booking-form"
import { TripConfirmation } from "@/components/passenger/trip-confirmation"
import { ChatBot } from "@/components/passenger/chat-bot"
import { MyTrips } from "@/components/passenger/my-trips"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PlusCircle, List, Lock, LogIn, UserPlus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"

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
  const { user, isLoading: authLoading } = useAuth()
  const { t } = useLanguage()
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
    if (!user) return
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
              {isBooked ? t("trips.bookedTitle") : t("trips.centerTitle")}
            </h1>
            <p className="text-gray-600">
              {isBooked 
                ? t("trips.bookedDescription")
                : user
                  ? t("trips.userDescription")
                  : t("trips.guestDescription")
              }
            </p>
          </div>

          {authLoading ? (
            <Card className="max-w-2xl mx-auto text-center">
              <CardContent className="p-8">
                <p className="text-gray-600">{t("trips.checkingSession")}</p>
              </CardContent>
            </Card>
          ) : !user ? (
            <Card className="max-w-2xl mx-auto text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-[#1a5276]" />
                </div>
                <h2 className="text-2xl font-bold text-[#1a5276] mb-2">{t("trips.loginRequiredTitle")}</h2>
                <p className="text-gray-600 mb-6">
                  {t("trips.loginRequiredDescription")}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/login">
                    <Button className="bg-[#1a5276] hover:bg-[#154360] text-white w-full sm:w-auto">
                      <LogIn className="w-4 h-4 mr-2" />
                      {t("trips.login")}
                    </Button>
                  </Link>
                  <Link href="/register?reason=booking">
                    <Button variant="outline" className="w-full sm:w-auto">
                      <UserPlus className="w-4 h-4 mr-2" />
                      {t("trips.register")}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : isBooked && tripData ? (
            <div>
              <TripConfirmation tripData={tripData} onNewTrip={handleNewTrip} />
              {user && (
                <div className="text-center mt-6">
                  <button
                    onClick={handleViewTrips}
                    className="text-[#1a5276] hover:underline font-medium"
                  >
                    {t("trips.viewAll")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className={`grid w-full max-w-md mx-auto ${user ? "grid-cols-2" : "grid-cols-1"} mb-8`}>
                <TabsTrigger value="book" className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" />
                  {t("trips.newTrip")}
                </TabsTrigger>
                {user && (
                  <TabsTrigger value="my-trips" className="flex items-center gap-2">
                    <List className="w-4 h-4" />
                    {t("trips.myTrips")}
                  </TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="book">
                <Suspense fallback={<div className="text-center text-gray-500">{t("trips.loadingForm")}</div>}>
                  <TripBookingForm onBook={handleBooking} />
                </Suspense>
              </TabsContent>
              
              {user && (
                <TabsContent value="my-trips">
                  <MyTrips key={refreshTrips} onNewTrip={() => setActiveTab("book")} />
                </TabsContent>
              )}
            </Tabs>
          )}
        </div>
      </div>

      <Footer />
      <ChatBot />
    </main>
  )
}
