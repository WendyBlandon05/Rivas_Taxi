"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

export type Language = "es" | "en"

type Dictionary = Record<string, { es: string; en: string }>

const dictionary: Dictionary = {
  "nav.home": { es: "INICIO", en: "HOME" },
  "nav.about": { es: "NOSOTROS", en: "ABOUT" },
  "nav.services": { es: "SERVICIOS", en: "SERVICES" },
  "nav.login": { es: "INICIAR SESION", en: "LOG IN" },
  "nav.book": { es: "RESERVA TU VIAJE", en: "BOOK YOUR RIDE" },
  "nav.account": { es: "Mi Cuenta", en: "My Account" },
  "nav.myTrips": { es: "Mis Viajes", en: "My Trips" },
  "nav.review": { es: "Dejar Resena", en: "Leave Review" },
  "nav.logout": { es: "Cerrar Sesion", en: "Log Out" },
  "language.label": { es: "Idioma", en: "Language" },

  "hero.title1": { es: "VIAJA SEGURO", en: "TRAVEL SAFELY" },
  "hero.title2": { es: "POR LA COSTA DEL", en: "ALONG THE" },
  "hero.title3": { es: "PACIFICO", en: "PACIFIC COAST" },
  "hero.title4": { es: "NICARAGUENSE", en: "OF NICARAGUA" },
  "hero.subtitle": {
    es: "RESERVAS RAPIDAS, CONDUCTORES CONFIABLES Y ATENCION INMEDIATA.",
    en: "FAST BOOKING, TRUSTED DRIVERS AND IMMEDIATE SUPPORT.",
  },
  "hero.bookNow": { es: "RESERVAR AHORA", en: "BOOK NOW" },
  "hero.viewServices": { es: "VER SERVICIOS", en: "VIEW SERVICES" },

  "services.title": { es: "NUESTROS SERVICIOS DE TRANSPORTE", en: "OUR TRANSPORTATION SERVICES" },
  "services.subtitle": {
    es: "OPCIONES SEGURAS Y COMODAS PARA CLIENTES NACIONALES Y EXTRANJEROS.",
    en: "SAFE AND COMFORTABLE OPTIONS FOR LOCAL AND INTERNATIONAL CLIENTS.",
  },
  "services.urbano.title": { es: "TRANSPORTE URBANO", en: "URBAN TRANSPORT" },
  "services.urbano.description": {
    es: "VIAJES EN EL DEPARTAMENTO DE RIVAS Y ALREDEDORES.",
    en: "RIDES WITHIN RIVAS AND SURROUNDING AREAS.",
  },
  "services.turistico.title": { es: "SERVICIO TURISTICO", en: "TOURIST SERVICE" },
  "services.turistico.description": {
    es: "RECORRIDOS A DESTINOS VACACIONALES DEL PACIFICO NICARAGUENSE.",
    en: "TRIPS TO VACATION DESTINATIONS ALONG NICARAGUA'S PACIFIC COAST.",
  },
  "services.empresarial.title": { es: "TRANSPORTE EMPRESARIAL", en: "BUSINESS TRANSPORT" },
  "services.empresarial.description": {
    es: "CONTRATACIONES DE TRASLADO PARA EMPRESAS, EVENTOS Y PERSONAL.",
    en: "TRANSPORT BOOKINGS FOR COMPANIES, EVENTS AND STAFF.",
  },

  "trips.bookedTitle": { es: "Viaje Reservado", en: "Ride Booked" },
  "trips.centerTitle": { es: "Centro de Viajes", en: "Ride Center" },
  "trips.bookedDescription": {
    es: "Tu viaje ha sido confirmado. Revisa los detalles a continuacion.",
    en: "Your ride has been confirmed. Review the details below.",
  },
  "trips.userDescription": {
    es: "Reserva un nuevo viaje o consulta tus viajes anteriores.",
    en: "Book a new ride or check your previous rides.",
  },
  "trips.guestDescription": {
    es: "Inicia sesion para reservar un nuevo viaje.",
    en: "Log in to book a new ride.",
  },
  "trips.checkingSession": { es: "Verificando tu sesion...", en: "Checking your session..." },
  "trips.loginRequiredTitle": { es: "Inicia sesion para reservar", en: "Log in to book" },
  "trips.loginRequiredDescription": {
    es: "Para tu mayor seguridad debes iniciar sesion o crear una cuenta antes de completar una reservacion.",
    en: "For your safety, please log in or create an account before completing a booking.",
  },
  "trips.login": { es: "Iniciar sesion", en: "Log in" },
  "trips.register": { es: "Registrarme", en: "Sign up" },
  "trips.viewAll": { es: "Ver todos mis viajes", en: "View all my trips" },
  "trips.newTrip": { es: "Nuevo Viaje", en: "New Ride" },
  "trips.myTrips": { es: "Mis Viajes", en: "My Trips" },
  "trips.loadingForm": { es: "Cargando formulario...", en: "Loading form..." },

  "booking.formTitle": { es: "Formulario de Reservacion", en: "Booking Form" },
  "booking.formSubtitle": { es: "Selecciona origen y destino en el mapa", en: "Select pickup and destination on the map" },
  "booking.serviceType": { es: "Tipo de Servicio", en: "Service Type" },
  "booking.personalInfo": { es: "Informacion Personal", en: "Personal Information" },
  "booking.fullName": { es: "Nombre Completo", en: "Full Name" },
  "booking.phone": { es: "Telefono", en: "Phone" },
  "booking.locations": { es: "Ubicaciones del Viaje", en: "Ride Locations" },
  "booking.origin": { es: "Punto de Origen", en: "Pickup Location" },
  "booking.originPlaceholder": { es: "Selecciona tu ubicacion de recogida...", en: "Select your pickup location..." },
  "booking.destination": { es: "Destino", en: "Destination" },
  "booking.destinationPlaceholder": { es: "Selecciona tu destino...", en: "Select your destination..." },
  "booking.distance": { es: "Distancia estimada:", en: "Estimated distance:" },
  "booking.date": { es: "Fecha", en: "Date" },
  "booking.time": { es: "Hora", en: "Time" },
  "booking.passengers": { es: "Pasajeros", en: "Passengers" },
  "booking.passengerSingular": { es: "pasajero", en: "passenger" },
  "booking.passengerPlural": { es: "pasajeros", en: "passengers" },
  "booking.coupon": { es: "Cupon de Descuento", en: "Discount Coupon" },
  "booking.couponApplied": { es: "aplicado", en: "applied" },
  "booking.discount": { es: "de descuento", en: "discount" },
  "booking.remove": { es: "Quitar", en: "Remove" },
  "booking.couponPlaceholder": { es: "Ingresa tu codigo de cupon", en: "Enter your coupon code" },
  "booking.apply": { es: "Aplicar", en: "Apply" },
  "booking.availableCoupons": { es: "Cupones disponibles:", en: "Available coupons:" },
  "booking.notes": { es: "Notas Adicionales (opcional)", en: "Additional Notes (optional)" },
  "booking.notesPlaceholder": {
    es: "Equipaje extra, necesidades especiales, instrucciones de recogida...",
    en: "Extra luggage, special needs, pickup instructions...",
  },
  "booking.estimatedPrice": { es: "Precio estimado:", en: "Estimated price:" },
  "booking.saved": { es: "Ahorraste", en: "You saved" },
  "booking.selectLocations": { es: "Selecciona origen y destino", en: "Select pickup and destination" },
  "booking.baseFare": { es: "Tarifa base", en: "Base fare" },
  "booking.processing": { es: "Procesando...", en: "Processing..." },
  "booking.confirm": { es: "Confirmar Reservacion", en: "Confirm Booking" },
  "booking.terms": {
    es: "Al confirmar, aceptas nuestros terminos y condiciones de servicio.",
    en: "By confirming, you accept our terms and conditions of service.",
  },
  "booking.service.urbano.name": { es: "Transporte Urbano", en: "Urban Transport" },
  "booking.service.urbano.description": { es: "Viajes en el departamento de Rivas y alrededores", en: "Rides within Rivas and surrounding areas" },
  "booking.service.turistico.name": { es: "Servicio Turistico", en: "Tourist Service" },
  "booking.service.turistico.description": { es: "Recorridos a destinos vacacionales y turisticos", en: "Trips to vacation and tourist destinations" },
  "booking.service.empresarial.name": { es: "Transporte Empresarial", en: "Business Transport" },
  "booking.service.empresarial.description": { es: "Traslados para empresas, eventos y personal", en: "Transport for companies, events and staff" },
  "booking.nameRequired": { es: "El nombre es obligatorio", en: "Name is required" },
  "booking.nameMin": { es: "El nombre debe tener al menos", en: "Name must have at least" },
  "booking.characters": { es: "caracteres", en: "characters" },
  "booking.nameNoNumbers": { es: "El nombre no puede contener numeros", en: "Name cannot contain numbers" },
  "booking.nameOnlyLetters": { es: "El nombre solo puede contener letras", en: "Name can only contain letters" },
  "booking.nameComplete": { es: "Ingresa tu nombre completo (nombre y apellido)", en: "Enter your full name (first and last name)" },
  "booking.nameHelp": { es: "Ingresa tu nombre y apellido (solo letras)", en: "Enter your first and last name (letters only)" },
  "booking.phoneRequired": { es: "El telefono es obligatorio", en: "Phone number is required" },
  "booking.phoneMissing": { es: "Faltan", en: "Missing" },
  "booking.phoneExtra": { es: "Sobran", en: "Extra" },
  "booking.digits": { es: "digitos", en: "digits" },
  "booking.phoneRequires": { es: "requiere", en: "requires" },
  "booking.formatFor": { es: "Formato para", en: "Format for" },
  "booking.map": { es: "Mapa", en: "Map" },
  "booking.selectOnMap": { es: "Seleccionar en el mapa...", en: "Select on map..." },
  "booking.selectOrigin": { es: "Seleccionar Punto de Origen", en: "Select Pickup Location" },
  "booking.selectDestination": { es: "Seleccionar Destino", en: "Select Destination" },
  "booking.searchAddress": { es: "Buscar direccion...", en: "Search address..." },
  "booking.noGeolocation": { es: "Tu navegador no soporta geolocalizacion", en: "Your browser does not support geolocation" },
  "booking.locationError": {
    es: "No se pudo obtener tu ubicacion. Por favor selecciona manualmente en el mapa.",
    en: "Could not get your location. Please select it manually on the map.",
  },
  "booking.gettingLocation": { es: "Obteniendo ubicacion...", en: "Getting location..." },
  "booking.useCurrentLocation": { es: "Usar mi ubicacion actual", en: "Use my current location" },
  "booking.mapInstructions": {
    es: "Haz clic en el mapa para seleccionar la ubicacion",
    en: "Click on the map to select the location",
  },
  "booking.selectedLocation": { es: "Ubicacion seleccionada:", en: "Selected location:" },
  "booking.cancel": { es: "Cancelar", en: "Cancel" },
  "booking.confirmLocation": { es: "Confirmar ubicacion", en: "Confirm location" },

  "chat.open": { es: "Abrir chat", en: "Open chat" },
  "chat.close": { es: "Cerrar chat", en: "Close chat" },
  "chat.placeholder": { es: "Escribe tu mensaje...", en: "Type your message..." },

  "footer.description": {
    es: "Tu servicio de transporte de confianza en la costa del Pacifico de Nicaragua. Viaja seguro con nosotros.",
    en: "Your trusted transportation service on Nicaragua's Pacific coast. Travel safely with us.",
  },
  "footer.quickLinks": { es: "Enlaces Rapidos", en: "Quick Links" },
  "footer.home": { es: "Inicio", en: "Home" },
  "footer.about": { es: "Sobre Nosotros", en: "About Us" },
  "footer.services": { es: "Servicios", en: "Services" },
  "footer.book": { es: "Reservar Viaje", en: "Book a Ride" },
  "footer.contact": { es: "Contacto", en: "Contact" },
  "footer.ourServices": { es: "Nuestros Servicios", en: "Our Services" },
  "footer.privateTours": { es: "Tours Privados", en: "Private Tours" },
  "footer.pacificCoast": { es: "Costa del Pacifico", en: "Pacific Coast" },
  "footer.available": { es: "24/7 Disponible", en: "Available 24/7" },
  "footer.whatsapp": { es: "Escribenos", en: "Message Us" },
  "footer.rights": { es: "Todos los derechos reservados.", en: "All rights reserved." },
  "footer.privacy": { es: "Politica de Privacidad", en: "Privacy Policy" },
  "footer.terms": { es: "Terminos y Condiciones", en: "Terms and Conditions" },
}

interface LanguageContextValue {
  language: Language
  setLanguage: (language: Language) => void
  toggleLanguage: () => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("es")

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("pct-language")
    if (savedLanguage === "es" || savedLanguage === "en") {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage)
    window.localStorage.setItem("pct-language", nextLanguage)
    document.documentElement.lang = nextLanguage
  }

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage,
    toggleLanguage: () => setLanguage(language === "es" ? "en" : "es"),
    t: (key: string) => dictionary[key]?.[language] ?? key,
  }), [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}
