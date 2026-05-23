"use client"

import { useState, useMemo } from "react"
import { User, AlertCircle } from "lucide-react"

interface NameInputProps {
  value: string
  onChange: (value: string, isValid: boolean) => void
  required?: boolean
  className?: string
  placeholder?: string
  label?: string
  minLength?: number
}

export function NameInput({ 
  value, 
  onChange, 
  required = true, 
  className = "",
  placeholder = "Juan Perez",
  label,
  minLength = 3
}: NameInputProps) {
  const [touched, setTouched] = useState(false)

  // Validation
  const validation = useMemo(() => {
    const trimmed = value.trim()
    
    if (!trimmed && required) {
      return { isValid: false, message: "El nombre es obligatorio" }
    }
    
    if (trimmed && trimmed.length < minLength) {
      return { isValid: false, message: `El nombre debe tener al menos ${minLength} caracteres` }
    }
    
    // Check for numbers
    if (/\d/.test(trimmed)) {
      return { isValid: false, message: "El nombre no puede contener numeros" }
    }
    
    // Check for special characters (allow letters, spaces, accents, hyphens, apostrophes)
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-']+$/.test(trimmed) && trimmed.length > 0) {
      return { isValid: false, message: "El nombre solo puede contener letras" }
    }
    
    // Check for at least first and last name (two words)
    const words = trimmed.split(/\s+/).filter(w => w.length > 0)
    if (words.length < 2) {
      return { isValid: false, message: "Ingresa tu nombre completo (nombre y apellido)" }
    }
    
    return { isValid: true, message: "" }
  }, [value, required, minLength])

  // Handle input - filter out numbers as user types
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    // Remove numbers and special characters, keep letters, spaces, accents, hyphens, apostrophes
    const filtered = input.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-']/g, "")
    
    // Prevent multiple consecutive spaces
    const cleaned = filtered.replace(/\s{2,}/g, " ")
    
    onChange(cleaned, validation.isValid)
  }

  // Handle paste - clean pasted content
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text")
    const filtered = pasted.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-']/g, "").replace(/\s{2,}/g, " ")
    onChange(filtered, false)
  }

  // Handle key press - prevent number input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Block numbers
    if (/\d/.test(e.key)) {
      e.preventDefault()
    }
    // Block special characters except allowed ones
    if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-']/.test(e.key) && e.key.length === 1) {
      e.preventDefault()
    }
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
        <input
          type="text"
          placeholder={placeholder}
          className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pl-10 ${
            touched && !validation.isValid ? "border-red-500 focus-visible:ring-red-500" : "border-input"
          }`}
          value={value}
          onChange={handleChange}
          onPaste={handlePaste}
          onKeyPress={handleKeyPress}
          onBlur={() => setTouched(true)}
          required={required}
          autoComplete="name"
        />
        {touched && !validation.isValid && (
          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
        )}
      </div>
      
      {/* Validation message */}
      {touched && !validation.isValid && (
        <p className="text-red-500 text-xs flex items-center gap-1">
          {validation.message}
        </p>
      )}
      
      {/* Helper text when not touched */}
      {!touched && (
        <p className="text-gray-500 text-xs">
          Ingresa tu nombre y apellido (solo letras)
        </p>
      )}
    </div>
  )
}
