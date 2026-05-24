"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import dynamic from "next/dynamic"
import { MapPin, Navigation, Search, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/language-context"

// Dynamically import react-leaflet components with SSR disabled
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
)

// Rivas, Nicaragua coordinates (default center)
const RIVAS_CENTER: [number, number] = [11.4392, -85.8346]

interface Location {
  lat: number
  lng: number
  address: string
}

interface LocationPickerProps {
  type: "origin" | "destination"
  value: Location | null
  onChange: (location: Location) => void
  label: string
  placeholder?: string
}

// Map click handler - loaded dynamically inside
function MapClickHandlerComponent({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const { useMapEvents } = require("react-leaflet")
  useMapEvents({
    click: (e: { latlng: { lat: number; lng: number } }) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    }
  })
  return null
}

// Recenter map component
function RecenterMapComponent({ center }: { center: [number, number] }) {
  const { useMap } = require("react-leaflet")
  const map = useMap()
  
  useEffect(() => {
    map.setView(center, 15)
  }, [map, center])
  
  return null
}

export function LocationPicker({ type, value, onChange, label, placeholder }: LocationPickerProps) {
  const { language, t } = useLanguage()
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isGeolocating, setIsGeolocating] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>(RIVAS_CENTER)
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(
    value ? [value.lat, value.lng] : null
  )
  const [selectedAddress, setSelectedAddress] = useState(value?.address || "")
  const [leafletIcon, setLeafletIcon] = useState<unknown>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load Leaflet CSS and create icon only on client
  useEffect(() => {
    if (typeof window !== "undefined" && isMapOpen) {
      import("leaflet/dist/leaflet.css")
      import("leaflet").then((L) => {
        const color = type === "origin" ? "#22c55e" : "#ef4444"
        const icon = L.divIcon({
          className: "custom-marker",
          html: `<div style="
            background-color: ${color};
            width: 28px;
            height: 28px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
          "><div style="
            width: 10px;
            height: 10px;
            background: white;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
          popupAnchor: [0, -28]
        })
        setLeafletIcon(icon)
      })
    }
  }, [isMapOpen, type])

  // Reverse geocode to get address from coordinates
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": language
          }
        }
      )
      const data = await response.json()
      return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    } catch (error) {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
  }, [language])

  // Search for places using Nominatim
  const searchPlaces = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ni&limit=5`,
        {
          headers: {
            "Accept-Language": language
          }
        }
      )
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [language])

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchPlaces(searchQuery)
      }, 500)
    } else {
      setSearchResults([])
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, searchPlaces])

  // Get current location
  const getCurrentLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert(t("booking.noGeolocation"))
      return
    }

    setIsGeolocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setSelectedPosition([latitude, longitude])
        setMapCenter([latitude, longitude])
        
        const address = await reverseGeocode(latitude, longitude)
        setSelectedAddress(address)
        onChange({ lat: latitude, lng: longitude, address })
        setIsGeolocating(false)
      },
      () => {
        alert(t("booking.locationError"))
        setIsGeolocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }, [onChange, reverseGeocode, t])

  // Handle map click
  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setSelectedPosition([lat, lng])
    const address = await reverseGeocode(lat, lng)
    setSelectedAddress(address)
    onChange({ lat, lng, address })
  }, [onChange, reverseGeocode])

  // Handle search result selection
  const handleSelectResult = useCallback((result: { display_name: string; lat: string; lon: string }) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    setSelectedPosition([lat, lng])
    setMapCenter([lat, lng])
    setSelectedAddress(result.display_name)
    onChange({ lat, lng, address: result.display_name })
    setSearchQuery("")
    setSearchResults([])
  }, [onChange])

  const iconColor = type === "origin" ? "text-green-500" : "text-red-500"
  const buttonColor = type === "origin" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {/* Display selected location or button to open map */}
      <div className="relative">
        <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${iconColor} pointer-events-none z-10`} />
        <div 
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-10 pr-24 cursor-pointer hover:border-gray-400 transition-colors items-center"
          onClick={() => setIsMapOpen(true)}
        >
          {value ? (
            <span className="truncate">{value.address}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder || t("booking.selectOnMap")}</span>
          )}
        </div>
        <Button
          type="button"
          size="sm"
          className={`absolute right-1 top-1/2 -translate-y-1/2 ${buttonColor} text-white`}
          onClick={() => setIsMapOpen(true)}
        >
          <MapPin className="w-4 h-4 mr-1" />
          {t("booking.map")}
        </Button>
      </div>

      {/* Map Modal */}
      {isMapOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className={`${type === "origin" ? "bg-green-600" : "bg-red-600"} text-white px-4 py-3 flex items-center justify-between`}>
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {type === "origin" ? t("booking.selectOrigin") : t("booking.selectDestination")}
              </h3>
              <button 
                onClick={() => setIsMapOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search and Current Location */}
            <div className="p-4 border-b space-y-3 relative">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={t("booking.searchAddress")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="absolute left-4 right-4 top-full mt-1 bg-white border rounded-lg shadow-lg z-[60] max-h-48 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 border-b last:border-b-0 flex items-start gap-2"
                      onClick={() => handleSelectResult(result)}
                    >
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{result.display_name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Current Location Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={isGeolocating}
                className="w-full"
              >
                {isGeolocating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4 mr-2" />
                )}
                {isGeolocating ? t("booking.gettingLocation") : t("booking.useCurrentLocation")}
              </Button>
            </div>

            {/* Map */}
            <div className="flex-1 min-h-[300px] relative">
              {typeof window !== "undefined" && (
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  style={{ height: "100%", width: "100%", minHeight: "300px" }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  <MapClickHandlerComponent onLocationSelect={handleMapClick} />
                  
                  {selectedPosition && leafletIcon && (
                    <>
                      <RecenterMapComponent center={selectedPosition} />
                      <Marker position={selectedPosition} icon={leafletIcon as L.Icon} />
                    </>
                  )}
                </MapContainer>
              )}

              {/* Instructions */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-[500]">
                <p className="text-sm text-gray-600 text-center">
                  <MapPin className={`w-4 h-4 inline mr-1 ${iconColor}`} />
                  {t("booking.mapInstructions")}
                </p>
              </div>
            </div>

            {/* Selected Location Display */}
            {selectedPosition && selectedAddress && (
              <div className="p-4 border-t bg-gray-50">
                <div className="flex items-start gap-2">
                  <MapPin className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{t("booking.selectedLocation")}</p>
                    <p className="text-sm text-gray-600 truncate">{selectedAddress}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="p-4 border-t flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsMapOpen(false)}
              >
                {t("booking.cancel")}
              </Button>
              <Button
                type="button"
                className={buttonColor}
                onClick={() => setIsMapOpen(false)}
                disabled={!selectedPosition}
              >
                {t("booking.confirmLocation")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
