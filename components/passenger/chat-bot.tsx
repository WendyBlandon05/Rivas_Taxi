"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Bot,
  CalendarPlus,
  ListChecks,
  LogIn,
  MessageCircle,
  PhoneCall,
  Route,
  Send,
  Ticket,
  User,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import type { Language } from "@/contexts/language-context"

type ActionIcon = "reserve" | "phone" | "coupon" | "route" | "login" | "trips"

interface QuickAction {
  label: string
  prompt?: string
  href?: string
  icon?: ActionIcon
}

interface Message {
  id: number
  text: string
  isBot: boolean
  timestamp: Date
  actions?: QuickAction[]
}

const BASE_FARE = 5
const PRICE_PER_KM = 1.5
const WHATSAPP_URL = "https://wa.me/50577502626"

const DISTANCES: Record<string, Record<string, number>> = {
  aeropuerto: {
    "san juan del sur": 140,
    "playa maderas": 145,
    "playa gigante": 150,
    tola: 135,
    rivas: 120,
    granada: 45,
    managua: 12,
  },
  managua: {
    "san juan del sur": 130,
    "playa maderas": 135,
    "playa gigante": 140,
    tola: 125,
    rivas: 110,
    granada: 50,
    aeropuerto: 12,
  },
  rivas: {
    "san juan del sur": 28,
    "playa maderas": 35,
    "playa gigante": 40,
    tola: 20,
    granada: 75,
    managua: 110,
    aeropuerto: 120,
  },
  granada: {
    "san juan del sur": 85,
    "playa maderas": 90,
    "playa gigante": 95,
    rivas: 75,
    managua: 50,
    aeropuerto: 45,
  },
}

function buildInitialMessage(language: Language): Message {
  return {
    id: 1,
    text: language === "en"
      ? "Hi! I'm Kimi, the Pacific Coast Taxi virtual assistant. I can help you quote, book, see coupons or check your rides."
      : "Hola! Soy Kimi, el asistente virtual de Pacific Coast Taxi. Puedo ayudarte a cotizar, reservar, ver cupones o consultar tus viajes.",
    isBot: true,
    timestamp: new Date(),
    actions: [
      { label: language === "en" ? "Book" : "Reservar", href: "/trips", icon: "reserve" },
      { label: language === "en" ? "Prices" : "Precios", prompt: language === "en" ? "I want prices" : "Quiero saber precios", icon: "route" },
      { label: language === "en" ? "Coupons" : "Cupones", prompt: language === "en" ? "What coupons are available?" : "Que cupones hay?", icon: "coupon" },
      { label: "WhatsApp", href: WHATSAPP_URL, icon: "phone" },
    ],
  }
}

function calculatePrice(origin: string, destination: string) {
  const originKey = Object.keys(DISTANCES).find((key) => origin.toLowerCase().includes(key))
  if (!originKey) return null

  const destinations = DISTANCES[originKey]
  const destKey = Object.keys(destinations).find((key) => destination.toLowerCase().includes(key))
  if (!destKey) return null

  const distance = destinations[destKey]
  const price = Math.round((BASE_FARE + distance * PRICE_PER_KM) * 100) / 100
  return { origin: originKey, destination: destKey, distance, price }
}

function getKnownPlace(message: string, options: string[]) {
  return options.find((place) => message.includes(place))
}

function getActionIcon(icon?: ActionIcon) {
  switch (icon) {
    case "reserve":
      return <CalendarPlus className="w-3 h-3" />
    case "phone":
      return <PhoneCall className="w-3 h-3" />
    case "coupon":
      return <Ticket className="w-3 h-3" />
    case "login":
      return <LogIn className="w-3 h-3" />
    case "trips":
      return <ListChecks className="w-3 h-3" />
    case "route":
    default:
      return <Route className="w-3 h-3" />
  }
}

function bookingActions(isLoggedIn: boolean, language: Language): QuickAction[] {
  if (isLoggedIn) {
    return [
      { label: language === "en" ? "Book now" : "Reservar ahora", href: "/trips", icon: "reserve" },
      { label: language === "en" ? "My trips" : "Mis viajes", href: "/my-trips", icon: "trips" },
    ]
  }

  return [
    { label: language === "en" ? "Log in" : "Iniciar sesion", href: "/login", icon: "login" },
    { label: language === "en" ? "Sign up" : "Registrarme", href: "/register?reason=booking", icon: "reserve" },
  ]
}

function getBotResponse(message: string, isLoggedIn: boolean, language: Language): { text: string; actions?: QuickAction[] } {
  const lowerMessage = message.toLowerCase()
  const allPlaces = ["aeropuerto", "managua", "granada", "rivas", "san juan del sur", "playa maderas", "playa gigante", "tola"]
  const isEnglish = language === "en"
  const asksPrice = ["viaje", "cuanto", "precio", "costo", "tarifa", "cotizar", "ride", "price", "cost", "fare", "quote"].some((word) => lowerMessage.includes(word))

  if (asksPrice) {
    const origin = getKnownPlace(lowerMessage, allPlaces)
    const destination = allPlaces.find((place) => lowerMessage.includes(place) && place !== origin)

    if (origin && destination) {
      const result = calculatePrice(origin, destination)
      if (result) {
        return {
          text: isEnglish
            ? `The ride from ${result.origin} to ${result.destination} is approximately ${result.distance} km.\n\nEstimate: $${result.price.toFixed(2)} USD\nBase fare: $${BASE_FARE.toFixed(2)} + $${PRICE_PER_KM.toFixed(2)}/km.\n\nThe final price is confirmed in the map booking form.`
            : `El viaje desde ${result.origin} hasta ${result.destination} tiene una distancia aproximada de ${result.distance} km.\n\nEstimado: $${result.price.toFixed(2)} USD\nTarifa base: $${BASE_FARE.toFixed(2)} + $${PRICE_PER_KM.toFixed(2)}/km.\n\nEl precio final se confirma en el formulario con el mapa.`,
          actions: bookingActions(isLoggedIn, language),
        }
      }
    }

    return {
      text: isEnglish
        ? `To quote a ride, I need pickup and destination. Example: "How much from Rivas to San Juan del Sur?"\n\nFare: base $${BASE_FARE.toFixed(2)} + $${PRICE_PER_KM.toFixed(2)}/km.`
        : `Para cotizar necesito origen y destino. Ejemplo: "Cuanto cuesta de Rivas a San Juan del Sur".\n\nTarifa: base $${BASE_FARE.toFixed(2)} + $${PRICE_PER_KM.toFixed(2)}/km.`,
      actions: [
        { label: isEnglish ? "Rivas to San Juan" : "Rivas a San Juan", prompt: isEnglish ? "How much from Rivas to San Juan del Sur?" : "Cuanto cuesta de Rivas a San Juan del Sur?", icon: "route" },
        { label: isEnglish ? "Airport to San Juan" : "Aeropuerto a San Juan", prompt: isEnglish ? "How much from the airport to San Juan del Sur?" : "Cuanto cuesta del aeropuerto a San Juan del Sur?", icon: "route" },
        { label: isEnglish ? "Quote on map" : "Cotizar en mapa", href: "/trips", icon: "reserve" },
      ],
    }
  }

  if (["hola", "buenos", "buenas", "saludos", "hello", "hi", "hey"].some((word) => lowerMessage.includes(word))) {
    return {
      text: isEnglish
        ? `Hi! ${isLoggedIn ? "You are already logged in." : "To book, please log in or sign up for safety."}\n\nI can help with prices, destinations, coupons, bookings and WhatsApp contact.`
        : `Hola! ${isLoggedIn ? "Ya tienes sesion iniciada." : "Para reservar debes iniciar sesion o registrarte por seguridad."}\n\nPuedo ayudarte con precios, destinos, cupones, reservas y contacto por WhatsApp.`,
      actions: [
        { label: isEnglish ? "Book" : "Reservar", href: "/trips", icon: "reserve" },
        { label: isEnglish ? "Prices" : "Precios", prompt: isEnglish ? "I want prices" : "Quiero saber precios", icon: "route" },
        { label: "WhatsApp", href: WHATSAPP_URL, icon: "phone" },
      ],
    }
  }

  if (["reservar", "reserva", "agendar", "programar", "book", "booking", "schedule"].some((word) => lowerMessage.includes(word))) {
    return {
      text: isEnglish
        ? isLoggedIn
          ? "You can book from the ride center. The system will ask for pickup, destination, date from tomorrow onward, time and number of passengers."
          : "For your safety, please log in or sign up before booking. That keeps your ride associated with your account."
        : isLoggedIn
        ? "Puedes reservar desde el centro de viajes. El sistema te pedira origen, destino, fecha desde manana, hora y cantidad de pasajeros."
        : "Para tu seguridad, antes de reservar debes iniciar sesion o registrarte. Asi tu viaje queda asociado a tu cuenta.",
      actions: bookingActions(isLoggedIn, language),
    }
  }

  if (["destino", "donde", "lugares", "playas", "destination", "where", "places", "beaches"].some((word) => lowerMessage.includes(word))) {
    return {
      text: isEnglish
        ? "We cover Rivas and main destinations:\n\n- San Juan del Sur\n- Playa Maderas\n- Playa Gigante\n- Tola\n- Granada\n- Managua\n- International Airport\n\nYou can also choose exact pickup and destination on the map."
        : "Cubrimos Rivas y destinos principales:\n\n- San Juan del Sur\n- Playa Maderas\n- Playa Gigante\n- Tola\n- Granada\n- Managua\n- Aeropuerto Internacional\n\nTambien puedes escoger origen y destino exactos en el mapa.",
      actions: [
        { label: isEnglish ? "Open form" : "Ver formulario", href: "/trips", icon: "reserve" },
        { label: isEnglish ? "Ask price" : "Pedir precio", prompt: isEnglish ? "How much from Rivas to Playa Maderas?" : "Cuanto cuesta de Rivas a Playa Maderas?", icon: "route" },
      ],
    }
  }

  if (["cupon", "descuento", "promo", "coupon", "discount"].some((word) => lowerMessage.includes(word))) {
    return {
      text: isEnglish
        ? "Available coupons to try in the form:\n\n- BIENVENIDO10\n- PACIFIC15\n- VERANO20\n- TURISTA10\n- AEROPUERTO15\n\nThe discount is calculated before confirming the booking."
        : "Cupones disponibles para probar en el formulario:\n\n- BIENVENIDO10\n- PACIFIC15\n- VERANO20\n- TURISTA10\n- AEROPUERTO15\n\nEl descuento se calcula antes de confirmar la reserva.",
      actions: [{ label: isEnglish ? "Book with coupon" : "Reservar con cupon", href: "/trips", icon: "coupon" }],
    }
  }

  if (["mis viajes", "estado", "mi reserva", "historial"].some((word) => lowerMessage.includes(word))) {
    return {
      text: isLoggedIn
        ? isEnglish ? "You can see your rides, statuses and details in My Trips." : "Puedes ver tus viajes, estados y detalles en la seccion Mis viajes."
        : isEnglish ? "To check your rides, log in with the email used to book." : "Para consultar tus viajes debes iniciar sesion con el correo usado al reservar.",
      actions: isLoggedIn
        ? [{ label: isEnglish ? "View my trips" : "Ver mis viajes", href: "/my-trips", icon: "trips" }]
        : [{ label: isEnglish ? "Log in" : "Iniciar sesion", href: "/login", icon: "login" }],
    }
  }

  if (["pago", "pagar", "efectivo", "tarjeta", "transferencia"].some((word) => lowerMessage.includes(word))) {
    return {
      text: isEnglish
        ? "We accept cash, transfers and digital payments. For long rides, the administrator may coordinate an advance payment with you for safety."
        : "Aceptamos efectivo, transferencia y pagos digitales. Para viajes largos, el administrador puede coordinar anticipo contigo por seguridad.",
      actions: [{ label: "WhatsApp", href: WHATSAPP_URL, icon: "phone" }],
    }
  }

  if (["seguro", "segura", "seguridad", "confiable"].some((word) => lowerMessage.includes(word))) {
    return {
      text: isEnglish
        ? "Your safety is a priority. That is why bookings require login, drivers are registered by the administrator, and your ride history stays in your account."
        : "Tu seguridad es prioridad. Por eso pedimos iniciar sesion para reservar, asignamos conductores registrados por el administrador y guardamos el historial del viaje en tu cuenta.",
      actions: bookingActions(isLoggedIn, language),
    }
  }

  if (["telefono", "whatsapp", "contacto", "llamar"].some((word) => lowerMessage.includes(word))) {
    return {
      text: isEnglish
        ? "You can contact us by WhatsApp or phone:\n\n+505 7750-2626\n\nI can also help you here with prices, destinations and bookings."
        : "Puedes contactarnos por WhatsApp o telefono:\n\n+505 7750-2626\n\nTambien puedo ayudarte aqui con precios, destinos y reservas.",
      actions: [{ label: isEnglish ? "Open WhatsApp" : "Abrir WhatsApp", href: WHATSAPP_URL, icon: "phone" }],
    }
  }

  if (["gracias", "thank"].some((word) => lowerMessage.includes(word))) {
    return {
      text: isEnglish
        ? "You are welcome! I am here whenever you need to quote or book a ride."
        : "De nada! Estoy aqui para ayudarte cuando necesites cotizar o reservar un viaje.",
      actions: [{ label: isEnglish ? "Book" : "Reservar", href: "/trips", icon: "reserve" }],
    }
  }

  return {
    text: isEnglish
      ? "I can help with quotes, destinations, coupons, bookings, your trips or WhatsApp contact.\n\nTry asking: \"How much from Rivas to San Juan del Sur?\""
      : "Puedo ayudarte con cotizaciones, destinos, cupones, reservas, tus viajes o contacto por WhatsApp.\n\nPrueba preguntando: \"Cuanto cuesta de Rivas a San Juan del Sur?\"",
    actions: [
      { label: isEnglish ? "Prices" : "Precios", prompt: isEnglish ? "I want prices" : "Quiero saber precios", icon: "route" },
      { label: isEnglish ? "Book" : "Reservar", href: "/trips", icon: "reserve" },
      { label: "WhatsApp", href: WHATSAPP_URL, icon: "phone" },
    ],
  }
}

export function ChatBot() {
  const router = useRouter()
  const { user } = useAuth()
  const { language, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(() => [buildInitialMessage(language)])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  useEffect(() => {
    setMessages([buildInitialMessage(language)])
  }, [language])

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue
    if (!textToSend.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now(),
      text: textToSend,
      isBot: false,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 450))
      const response = getBotResponse(textToSend, !!user, language)

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: response.text,
          isBot: true,
          timestamp: new Date(),
          actions: response.actions,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: language === "en"
            ? "Sorry, something went wrong. You can contact us at +505 7750-2626."
            : "Lo siento, hubo un error. Puedes contactarnos al +505 7750-2626.",
          isBot: true,
          timestamp: new Date(),
          actions: [{ label: "WhatsApp", href: WHATSAPP_URL, icon: "phone" }],
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleAction = (action: QuickAction) => {
    if (action.href) {
      if (action.href.startsWith("http")) {
        window.open(action.href, "_blank", "noopener,noreferrer")
      } else {
        router.push(action.href)
        setIsOpen(false)
      }
      return
    }

    if (action.prompt) {
      handleSendMessage(action.prompt)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage()
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#1a5276] hover:bg-[#154360] text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen ? "scale-0" : "scale-100"
        }`}
        aria-label={t("chat.open")}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <div
        className={`fixed bottom-6 right-6 z-50 w-[350px] max-w-[calc(100vw-2rem)] h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-[#1a5276] text-white p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-[#1a5276]" />
            </div>
            <div>
              <h3 className="font-bold">Kimi</h3>
              <p className="text-xs text-white/80">Pacific Coast Taxi</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label={t("chat.close")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[88%] p-3 rounded-2xl ${
                  message.isBot
                    ? "bg-gray-100 text-gray-800 rounded-tl-none"
                    : "bg-[#1a5276] text-white rounded-tr-none"
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.isBot && <Bot className="w-4 h-4 mt-0.5 text-[#1a5276] flex-shrink-0" />}
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  {!message.isBot && <User className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                </div>

                {message.isBot && message.actions && message.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {message.actions.map((action) => (
                      <button
                        key={`${message.id}-${action.label}`}
                        type="button"
                        onClick={() => handleAction(action)}
                        disabled={isTyping}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-white border border-[#1a5276]/20 text-[#1a5276] rounded-full hover:bg-blue-50 disabled:opacity-50"
                      >
                        {getActionIcon(action.icon)}
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 p-3 rounded-2xl rounded-tl-none">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-4 pb-2 flex-shrink-0">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { label: language === "en" ? "Prices" : "Precios", prompt: language === "en" ? "I want prices" : "Quiero saber precios" },
              { label: language === "en" ? "Destinations" : "Destinos", prompt: language === "en" ? "What destinations do you cover?" : "Que destinos cubren?" },
              { label: language === "en" ? "Book" : "Reservar", prompt: language === "en" ? "I want to book" : "Quiero reservar" },
              { label: language === "en" ? "Coupons" : "Cupones", prompt: language === "en" ? "What coupons are available?" : "Que cupones hay?" },
              { label: language === "en" ? "Contact" : "Contacto", prompt: language === "en" ? "I need WhatsApp contact" : "Necesito contacto por WhatsApp" },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => handleSendMessage(action.prompt)}
                disabled={isTyping}
                className="px-3 py-1 text-xs bg-amber-100 text-[#1a5276] rounded-full whitespace-nowrap hover:bg-amber-200 transition-colors disabled:opacity-50"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t flex-shrink-0 bg-white">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t("chat.placeholder")}
              className="flex-1"
              disabled={isTyping}
            />
            <Button
              type="submit"
              size="icon"
              className="bg-[#1a5276] hover:bg-[#154360]"
              disabled={isTyping || !inputValue.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
