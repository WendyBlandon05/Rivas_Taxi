"use client"

import { useState, useEffect, useMemo } from "react"
import { ChevronDown, Phone } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

// Country codes with phone number length requirements
const COUNTRY_CODES = [
  { code: "+505", country: "NI", name: "Nicaragua", flag: "🇳🇮", digits: 8, format: "0000-0000" },
  { code: "+506", country: "CR", name: "Costa Rica", flag: "🇨🇷", digits: 8, format: "0000-0000" },
  { code: "+503", country: "SV", name: "El Salvador", flag: "🇸🇻", digits: 8, format: "0000-0000" },
  { code: "+502", country: "GT", name: "Guatemala", flag: "🇬🇹", digits: 8, format: "0000-0000" },
  { code: "+504", country: "HN", name: "Honduras", flag: "🇭🇳", digits: 8, format: "0000-0000" },
  { code: "+507", country: "PA", name: "Panama", flag: "🇵🇦", digits: 8, format: "0000-0000" },
  { code: "+52", country: "MX", name: "Mexico", flag: "🇲🇽", digits: 10, format: "000-000-0000" },
  { code: "+1", country: "US", name: "Estados Unidos", flag: "🇺🇸", digits: 10, format: "000-000-0000" },
  { code: "+34", country: "ES", name: "Espana", flag: "🇪🇸", digits: 9, format: "000-000-000" },
  { code: "+57", country: "CO", name: "Colombia", flag: "🇨🇴", digits: 10, format: "000-000-0000" },
]

interface PhoneInputProps {
  value: string
  onChange: (value: string, isValid: boolean) => void
  required?: boolean
  className?: string
  error?: string
}

export function PhoneInput({ value, onChange, required = false, className = "", error }: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useLanguage()
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]) // Default Nicaragua
  const [phoneNumber, setPhoneNumber] = useState("")
  const [touched, setTouched] = useState(false)

  // Parse initial value if provided
  useEffect(() => {
    if (value) {
      // Try to detect country code from value
      const country = COUNTRY_CODES.find(c => value.startsWith(c.code))
      if (country) {
        setSelectedCountry(country)
        const numberPart = value.replace(country.code, "").replace(/\D/g, "")
        setPhoneNumber(numberPart)
      } else {
        // Just extract digits
        setPhoneNumber(value.replace(/\D/g, ""))
      }
    } else {
      setPhoneNumber("")
    }
  }, [value])

  // Format phone number for display
  const formattedNumber = useMemo(() => {
    if (!phoneNumber) return ""
    
    const digits = phoneNumber.replace(/\D/g, "")
    
    // Format based on country
    if (selectedCountry.digits === 8) {
      // Format: 0000-0000
      if (digits.length <= 4) return digits
      return `${digits.slice(0, 4)}-${digits.slice(4, 8)}`
    } else if (selectedCountry.digits === 9) {
      // Format: 000-000-000
      if (digits.length <= 3) return digits
      if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 9)}`
    } else {
      // Format: 000-000-0000
      if (digits.length <= 3) return digits
      if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`
    }
  }, [phoneNumber, selectedCountry])

  // Validation
  const validation = useMemo(() => {
    const digits = phoneNumber.replace(/\D/g, "")
    const isCorrectLength = digits.length === selectedCountry.digits
    const isEmpty = digits.length === 0
    
    if (isEmpty && required) {
      return { isValid: false, message: t("booking.phoneRequired") }
    }
    
    if (!isEmpty && digits.length < selectedCountry.digits) {
      return { 
        isValid: false, 
        message: `${t("booking.phoneMissing")} ${selectedCountry.digits - digits.length} ${t("booking.digits")}. ${selectedCountry.name} ${t("booking.phoneRequires")} ${selectedCountry.digits} ${t("booking.digits")}` 
      }
    }
    
    if (!isEmpty && digits.length > selectedCountry.digits) {
      return { 
        isValid: false, 
        message: `${t("booking.phoneExtra")} ${digits.length - selectedCountry.digits} ${t("booking.digits")}. ${selectedCountry.name} ${t("booking.phoneRequires")} ${selectedCountry.digits} ${t("booking.digits")}` 
      }
    }
    
    return { isValid: true, message: "" }
  }, [phoneNumber, selectedCountry, required, t])

  // Handle phone number input - only allow digits
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    // Remove all non-digit characters except dash (which we add for formatting)
    const digitsOnly = input.replace(/[^\d]/g, "")
    
    // Limit to max digits for country
    const limited = digitsOnly.slice(0, selectedCountry.digits)
    setPhoneNumber(limited)
    
    // Notify parent with full formatted value
    const fullNumber = `${selectedCountry.code} ${limited}`
    onChange(fullNumber, limited.length === selectedCountry.digits)
  }

  // Handle country change
  const handleCountryChange = (country: typeof COUNTRY_CODES[0]) => {
    setSelectedCountry(country)
    setIsOpen(false)
    
    // Revalidate with new country requirements
    const digits = phoneNumber.replace(/\D/g, "").slice(0, country.digits)
    setPhoneNumber(digits)
    
    const fullNumber = `${country.code} ${digits}`
    onChange(fullNumber, digits.length === country.digits)
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex">
        {/* Country Code Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 h-10 px-3 border border-r-0 rounded-l-md bg-gray-50 hover:bg-gray-100 transition-colors min-w-[100px]"
          >
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="text-sm font-medium">{selectedCountry.code}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          
          {isOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                {COUNTRY_CODES.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountryChange(country)}
                    className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left ${
                      selectedCountry.code === country.code ? "bg-blue-50" : ""
                    }`}
                  >
                    <span className="text-lg">{country.flag}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{country.name}</p>
                      <p className="text-xs text-gray-500">{country.code} ({country.digits} {t("booking.digits")})</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        
        {/* Phone Number Input */}
        <div className="relative flex-1">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="tel"
            inputMode="numeric"
            placeholder={selectedCountry.format}
            className={`flex h-10 w-full rounded-r-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pl-10 ${
              touched && !validation.isValid ? "border-red-500 focus-visible:ring-red-500" : "border-input"
            }`}
            value={formattedNumber}
            onChange={handlePhoneChange}
            onBlur={() => setTouched(true)}
            required={required}
          />
        </div>
      </div>
      
      {/* Validation message */}
      {touched && !validation.isValid && (
        <p className="text-red-500 text-xs flex items-center gap-1">
          {validation.message}
        </p>
      )}
      
      {/* Helper text */}
      {!touched && (
        <p className="text-gray-500 text-xs">
          {t("booking.formatFor")} {selectedCountry.name}: {selectedCountry.code} {selectedCountry.format}
        </p>
      )}
      
      {/* External error */}
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  )
}
