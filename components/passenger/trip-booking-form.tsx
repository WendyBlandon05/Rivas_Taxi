"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MapPin, Calendar, Clock, Users, Car, FileText, Tag, Percent, Loader2, Map } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { LocationPicker } from "@/components/passenger/location-picker"
import { PhoneInput } from "@/components/ui/phone-input"
import { NameInput } from "@/components/ui/name-input"
import type { TripData } from "@/app/trips/page"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"

interface Location {
  lat: number
  lng: number
  address: string
}

interface Destination {
  id: string
  name: string
  distance_km: number
  price_usd: number
  latitude: number
  longitude: number
}

const SERVICE_TYPES = [
  { id: "turistico", nameKey: "booking.service.turistico.name", descriptionKey: "booking.service.turistico.description" },
  { id: "interdepartamental", nameKey: "booking.service.interdepartamental.name", descriptionKey: "booking.service.interdepartamental.description" },
  { id: "local", nameKey: "booking.service.local.name", descriptionKey: "booking.service.local.description" },
  { id: "programada", nameKey: "booking.service.programada.name", descriptionKey: "booking.service.programada.description" }
]

const PRICE_PER_KM = 1.5 // USD per km

interface TripBookingFormProps {
  onBook: (data: TripData) => void
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function isValidFullName(value: string) {
  const trimmed = value.trim()
  return trimmed.length >= 3 && !/\d/.test(trimmed) && trimmed.split(/\s+/).filter(Boolean).length >= 2
}

function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, "")
  return digits.length >= 8
}

function getTomorrowDateInput() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const year = tomorrow.getFullYear()
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0")
  const day = String(tomorrow.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function TripBookingForm({ onBook }: TripBookingFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile, isLoading: authLoading } = useAuth()
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [couponCode, setCouponCode] = useState("")
  const [couponApplied, setCouponApplied] = useState<string | null>(null)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState("")
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [submitError, setSubmitError] = useState("")
  
  const [name, setName] = useState("")
  const [nameValid, setNameValid] = useState(false)
  const [phone, setPhone] = useState("")
  const [phoneValid, setPhoneValid] = useState(false)
  const [originLocation, setOriginLocation] = useState<Location | null>(null)
  const [destinationLocation, setDestinationLocation] = useState<Location | null>(null)
  const [date, setDate] = useState("")
  const [minTripDate, setMinTripDate] = useState("")
  const [time, setTime] = useState("")
  const [passengers, setPassengers] = useState("1")
  const [serviceType, setServiceType] = useState("")
  const [notes, setNotes] = useState("")

  // Cargar datos del perfil de la cuenta o localStorage
  useEffect(() => {
    const profileName = profile?.full_name?.trim()
    const profilePhone = profile?.phone?.trim()

    if (profileName) {
      setName(profileName)
      setNameValid(isValidFullName(profileName))
    }

    if (profilePhone) {
      setPhone(profilePhone)
      setPhoneValid(isValidPhone(profilePhone))
    }

    if (profileName || profilePhone) return

    const savedName = localStorage.getItem("userName")
    const savedPhone = localStorage.getItem("userPhone")
    if (savedName) {
      setName(savedName)
      setNameValid(isValidFullName(savedName))
    }
    if (savedPhone) {
      setPhone(savedPhone)
      setPhoneValid(isValidPhone(savedPhone))
    }
  }, [profile])

  useEffect(() => {
    const tomorrow = getTomorrowDateInput()
    setMinTripDate(tomorrow)
    setDate((currentDate) => currentDate || tomorrow)
  }, [])

  // Cargar tipo de servicio desde URL params
  useEffect(() => {
    const serviceParam = searchParams.get("service")
    if (serviceParam && SERVICE_TYPES.find(s => s.id === serviceParam)) {
      setServiceType(serviceParam)
    } else {
      setServiceType("turistico")
    }
  }, [searchParams])

  // Calculate distance and price based on selected locations
  const tripDetails = useMemo(() => {
    if (!originLocation || !destinationLocation) return null
    
    const distanceKm = calculateDistance(
      originLocation.lat, 
      originLocation.lng, 
      destinationLocation.lat, 
      destinationLocation.lng
    )
    
    // Minimum fare + distance-based pricing
    const baseFare = 5 // Minimum fare in USD
    const distancePrice = distanceKm * PRICE_PER_KM
    const estimatedPrice = Math.max(baseFare, baseFare + distancePrice)
    
    return {
      distanceKm: Math.round(distanceKm * 10) / 10,
      estimatedPrice: Math.round(estimatedPrice * 100) / 100
    }
  }, [originLocation, destinationLocation])

  const finalPrice = useMemo(() => {
    if (!tripDetails) return null
    const discount = tripDetails.estimatedPrice * (couponDiscount / 100)
    return Math.round((tripDetails.estimatedPrice - discount) * 100) / 100
  }, [tripDetails, couponDiscount])

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase()
    if (!code) return
    
    setValidatingCoupon(true)
    setCouponError("")
    
    try {
      const response = await fetch("/api/discount-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      })
      
      const data = await response.json()
      
      if (response.ok && data.valid) {
        const discountPercentage = Number(data.discount_percentage ?? data.discountPercentage ?? 0)
        setCouponApplied(code)
        setCouponDiscount(discountPercentage)
        setCouponError("")
      } else {
        setCouponError(data.error || "Cupon invalido o expirado")
        setCouponApplied(null)
        setCouponDiscount(0)
      }
    } catch (error) {
      setCouponError("Error al validar el cupon")
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setCouponCode("")
    setCouponApplied(null)
    setCouponDiscount(0)
    setCouponError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (authLoading) {
      setSubmitError("Estamos verificando tu sesion. Intenta de nuevo en un momento.")
      return
    }

    if (!user) {
      setSubmitError("Para tu mayor seguridad debes registrarte o iniciar sesion antes de reservar un viaje.")
      router.push("/register?reason=booking")
      return
    }
    
    // Validate all required fields
    if (!nameValid) {
      setSubmitError("Por favor ingresa un nombre valido (nombre y apellido, solo letras)")
      return
    }
    
    if (!phoneValid) {
      setSubmitError("Por favor ingresa un numero de telefono valido con el codigo de pais correcto")
      return
    }
    
    if (!originLocation || !destinationLocation) {
      setSubmitError("Por favor selecciona el punto de origen y destino en el mapa")
      return
    }
    
    setIsLoading(true)
    setSubmitError("")
    
    try {
      // Save user info to localStorage
      localStorage.setItem("userName", name)
      localStorage.setItem("userPhone", phone)
      
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType,
          origin: originLocation.address,
          originLat: originLocation.lat,
          originLng: originLocation.lng,
          destination: destinationLocation.address,
          destinationLat: destinationLocation.lat,
          destinationLng: destinationLocation.lng,
          distanceKm: tripDetails?.distanceKm || 0,
          priceUsd: tripDetails?.estimatedPrice || 0,
          discountCode: couponApplied,
          discountAmount: couponApplied ? (tripDetails?.estimatedPrice || 0) * (couponDiscount / 100) : 0,
          finalPrice: finalPrice || tripDetails?.estimatedPrice || 0,
          passengers: parseInt(passengers),
          tripDate: date,
          tripTime: time,
          notes: notes || null,
          passengerName: name,
          passengerPhone: phone,
          passengerEmail: user.email || profile?.email
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Error al crear el viaje")
      }
      
      // Call onBook with the trip data including driver info
      onBook({
        id: data.trip.id,
        confirmationCode: data.trip.confirmation_code || data.confirmation_code,
        name,
        phone,
        origin: originLocation.address,
        destination: destinationLocation.address,
        date,
        time,
        passengers: parseInt(passengers),
        serviceType,
        notes,
        priceUsd: tripDetails?.estimatedPrice || 0,
        finalPrice: finalPrice || tripDetails?.estimatedPrice || 0,
        distanceKm: tripDetails?.distanceKm || 0,
        status: data.trip.status,
        driver: data.trip.driver,
        driverAssigned: data.driverAssigned
      })
      
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Error al crear el viaje")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="shadow-lg rounded-lg overflow-hidden bg-white border">
        <div className="bg-[#1a5276] text-white px-6 py-4">
          <h2 className="flex items-center gap-2 font-semibold text-xl">
            <Car className="w-6 h-6" />
            {t("booking.formTitle")}
          </h2>
          <p className="text-sm text-blue-100 mt-1 flex items-center gap-1">
            <Map className="w-4 h-4" />
            {t("booking.formSubtitle")}
          </p>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {submitError}
              </div>
            )}

            {/* Service Type Selection */}
            <div className="space-y-4">
              <h3 className="font-semibold text-[#1a5276] border-b pb-2">{t("booking.serviceType")}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {SERVICE_TYPES.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setServiceType(service.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      serviceType === service.id
                        ? "border-amber-500 bg-amber-50 text-[#1a5276]"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    <Car className={`w-6 h-6 mx-auto mb-1 ${serviceType === service.id ? "text-amber-500" : "text-gray-400"}`} />
                    <p className="text-xs font-medium leading-tight">{t(service.nameKey)}</p>
                  </button>
                ))}
              </div>
              {serviceType && (
                <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                  {t(SERVICE_TYPES.find(s => s.id === serviceType)?.descriptionKey || "")}
                </p>
              )}
            </div>

            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-[#1a5276] border-b pb-2">{t("booking.personalInfo")}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NameInput
                  value={name}
                  onChange={(value, isValid) => {
                    setName(value)
                    setNameValid(isValid)
                  }}
                  required
                  label={t("booking.fullName")}
                  placeholder="Juan Perez"
                />

                <div className="space-y-2">
                  <Label>{t("booking.phone")} <span className="text-red-500">*</span></Label>
                  <PhoneInput
                    value={phone}
                    onChange={(value, isValid) => {
                      setPhone(value)
                      setPhoneValid(isValid)
                    }}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Trip Details with Map Selection */}
            <div className="space-y-4">
              <h3 className="font-semibold text-[#1a5276] border-b pb-2 flex items-center gap-2">
                <Map className="w-4 h-4" />
                {t("booking.locations")}
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                {/* Origin Location Picker */}
                <LocationPicker
                  type="origin"
                  value={originLocation}
                  onChange={setOriginLocation}
                  label={t("booking.origin")}
                  placeholder={t("booking.originPlaceholder")}
                />

                {/* Destination Location Picker */}
                <LocationPicker
                  type="destination"
                  value={destinationLocation}
                  onChange={setDestinationLocation}
                  label={t("booking.destination")}
                  placeholder={t("booking.destinationPlaceholder")}
                />
              </div>

              {/* Show distance and route info when both locations are selected */}
              {tripDetails && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-700 font-medium flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {t("booking.distance")}
                    </span>
                    <span className="font-bold text-blue-900">{tripDetails.distanceKm} km</span>
                  </div>
                </div>
              )}

              {/* Date, Time, Passengers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="date">{t("booking.date")}</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                    <input
                      id="date"
                      type="date"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pl-10"
                      min={minTripDate}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">{t("booking.time")}</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                    <input
                      id="time"
                      type="time"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pl-10"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passengers">{t("booking.passengers")}</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                    <Select value={passengers} onValueChange={setPassengers}>
                      <SelectTrigger className="pl-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? t("booking.passengerSingular") : t("booking.passengerPlural")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Coupon Code */}
            <div className="space-y-4">
              <h3 className="font-semibold text-[#1a5276] border-b pb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                {t("booking.coupon")}
              </h3>
              
              {couponApplied ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Percent className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-700">
                      {t("booking.coupon")} {couponApplied} {t("booking.couponApplied")} - {couponDiscount}% {t("booking.discount")}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    {t("booking.remove")}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                    <input
                      type="text"
                      placeholder={t("booking.couponPlaceholder")}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pl-10 uppercase"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim() || validatingCoupon}
                  >
                    {validatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : t("booking.apply")}
                  </Button>
                </div>
              )}
              {couponError && (
                <p className="text-red-500 text-sm">{couponError}</p>
              )}
              <p className="text-xs text-gray-500">
                {t("booking.availableCoupons")} BIENVENIDO10, PACIFIC15, VERANO20, TURISTA10, AEROPUERTO15
              </p>
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">{t("booking.notes")}</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                <Textarea
                  id="notes"
                  placeholder={t("booking.notesPlaceholder")}
                  className="pl-10 min-h-[100px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Price Estimate */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t("booking.estimatedPrice")}</p>
                  {tripDetails ? (
                    couponApplied ? (
                      <div>
                        <p className="text-xl text-gray-400 line-through">
                          ${tripDetails.estimatedPrice.toFixed(2)} USD
                        </p>
                        <p className="text-3xl font-bold text-green-600">
                          ${finalPrice?.toFixed(2)} USD
                        </p>
                        <p className="text-xs text-green-600">
                          {t("booking.saved")} ${(tripDetails.estimatedPrice - (finalPrice || 0)).toFixed(2)} USD
                        </p>
                      </div>
                    ) : (
                      <p className="text-3xl font-bold text-[#1a5276]">
                        ${tripDetails.estimatedPrice.toFixed(2)} USD
                      </p>
                    )
                  ) : (
                    <p className="text-lg text-gray-400">
                      {t("booking.selectLocations")}
                    </p>
                  )}
                </div>
                <Car className="w-12 h-12 text-amber-500" />
              </div>
              {tripDetails && (
                <p className="text-xs text-gray-500 mt-2">
                  {t("booking.baseFare")} $5.00 + ${PRICE_PER_KM.toFixed(2)}/km
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-[#1a5276] hover:bg-[#154360] text-white py-6 text-lg"
              disabled={isLoading || !originLocation || !destinationLocation}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t("booking.processing")}
                </>
              ) : (
                <>
                  <Car className="w-5 h-5 mr-2" />
                  {t("booking.confirm")}
                </>
              )}
            </Button>

            <p className="text-xs text-center text-gray-500">
              {t("booking.terms")}
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
