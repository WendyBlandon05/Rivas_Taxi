"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Message {
  id: number
  text: string
  isBot: boolean
  timestamp: Date
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    text: "Hola! Soy el asistente virtual de Pacific Coast Taxi. ¿En que puedo ayudarte hoy?",
    isBot: true,
    timestamp: new Date()
  }
]

// Distance data in km from different origins
const DISTANCES: Record<string, Record<string, number>> = {
  "aeropuerto": {
    "san juan del sur": 140,
    "playa maderas": 145,
    "playa gigante": 150,
    "tola": 135,
    "rivas": 120,
    "granada": 45,
    "managua": 12
  },
  "managua": {
    "san juan del sur": 130,
    "playa maderas": 135,
    "playa gigante": 140,
    "tola": 125,
    "rivas": 110,
    "granada": 50,
    "aeropuerto": 12
  },
  "rivas": {
    "san juan del sur": 28,
    "playa maderas": 35,
    "playa gigante": 40,
    "tola": 20,
    "granada": 75,
    "managua": 110,
    "aeropuerto": 120
  },
  "granada": {
    "san juan del sur": 85,
    "playa maderas": 90,
    "playa gigante": 95,
    "rivas": 75,
    "managua": 50,
    "aeropuerto": 45
  }
}

const PRICE_PER_KM = 5 // $5 por kilometro

function calculatePrice(origin: string, destination: string): { distance: number; price: number } | null {
  const originKey = Object.keys(DISTANCES).find(key => origin.toLowerCase().includes(key))
  if (!originKey) return null
  
  const destinations = DISTANCES[originKey]
  const destKey = Object.keys(destinations).find(key => destination.toLowerCase().includes(key))
  if (!destKey) return null
  
  const distance = destinations[destKey]
  return { distance, price: distance * PRICE_PER_KM }
}

function getBotResponse(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  // Check for price/trip queries with origin and destination
  if ((lowerMessage.includes("viaje") || lowerMessage.includes("cuanto") || lowerMessage.includes("precio") || lowerMessage.includes("costo")) && 
      (lowerMessage.includes("desde") || lowerMessage.includes("de ") || lowerMessage.includes("del "))) {
    
    // Try to extract origin and destination
    let origin = ""
    let destination = ""
    
    // Common origins
    if (lowerMessage.includes("aeropuerto") || lowerMessage.includes("augusto cesar") || lowerMessage.includes("sandino")) {
      origin = "aeropuerto"
    } else if (lowerMessage.includes("managua")) {
      origin = "managua"
    } else if (lowerMessage.includes("granada")) {
      origin = "granada"
    } else if (lowerMessage.includes("rivas")) {
      origin = "rivas"
    }
    
    // Common destinations
    if (lowerMessage.includes("san juan del sur") || lowerMessage.includes("san juan")) {
      destination = "san juan del sur"
    } else if (lowerMessage.includes("maderas")) {
      destination = "playa maderas"
    } else if (lowerMessage.includes("gigante")) {
      destination = "playa gigante"
    } else if (lowerMessage.includes("tola")) {
      destination = "tola"
    } else if (lowerMessage.includes("granada")) {
      destination = "granada"
    } else if (lowerMessage.includes("managua")) {
      destination = "managua"
    } else if (lowerMessage.includes("rivas")) {
      destination = "rivas"
    }
    
    if (origin && destination) {
      const result = calculatePrice(origin, destination)
      if (result) {
        return `El viaje desde ${origin.charAt(0).toUpperCase() + origin.slice(1)} hasta ${destination.charAt(0).toUpperCase() + destination.slice(1)} tiene una distancia aproximada de ${result.distance} km.\n\nTarifa: $${result.price} USD\n(Calculado a $${PRICE_PER_KM} por kilometro)\n\nEste precio incluye:\n- Vehiculo con aire acondicionado\n- Conductor profesional verificado\n- Seguro de pasajeros\n- Seguimiento GPS\n\n¿Te gustaria reservar este viaje?`
      }
    }
    
    return "Para darte una cotizacion exacta, necesito saber:\n\n1. ¿Desde donde sales? (Aeropuerto, Managua, Granada, Rivas)\n2. ¿A donde vas? (San Juan del Sur, Playa Maderas, etc.)\n\nNuestra tarifa es de $5 USD por kilometro."
  }
  
  // Greeting
  if (lowerMessage.includes("hola") || lowerMessage.includes("buenos") || lowerMessage.includes("buenas") || lowerMessage.includes("nuevo cliente")) {
    return "Hola! Bienvenido a Pacific Coast Taxi. ¿Como puedo ayudarte? Puedes preguntarme sobre precios, destinos, reservaciones o cualquier otra consulta."
  }
  
  // Prices
  if (lowerMessage.includes("precio") || lowerMessage.includes("tarifa") || lowerMessage.includes("costo") || lowerMessage.includes("cuanto")) {
    return "Nuestras tarifas se calculan a $5 USD por kilometro.\n\nEjemplos de precios:\n- Rivas a San Juan del Sur (28km): $140\n- Aeropuerto a San Juan del Sur (140km): $700\n- Managua a Granada (50km): $250\n- Rivas a Playa Maderas (35km): $175\n\n¿Desde donde y hacia donde necesitas viajar?"
  }
  
  // Booking
  if (lowerMessage.includes("reservar") || lowerMessage.includes("reserva") || lowerMessage.includes("agendar")) {
    return "Para reservar un viaje, puedes:\n\n1. Usar el boton 'Reservar Ahora' en nuestra pagina\n2. Llamarnos al +505 7750-2626\n3. Escribirnos por WhatsApp\n\n¿Te gustaria que te ayude con la reservacion?"
  }
  
  // Destinations
  if (lowerMessage.includes("destino") || lowerMessage.includes("donde") || lowerMessage.includes("lugares")) {
    return "Cubrimos toda la zona de Rivas y mas:\n\n- San Juan del Sur\n- Playa Maderas\n- Playa Gigante\n- Tola\n- Granada\n- Managua\n- Aeropuerto Internacional\n\n¿A donde necesitas ir?"
  }
  
  // Payment
  if (lowerMessage.includes("pago") || lowerMessage.includes("pagar") || lowerMessage.includes("efectivo") || lowerMessage.includes("tarjeta")) {
    return "Aceptamos varios metodos de pago:\n\n- Efectivo (cordobas y dolares)\n- Transferencia bancaria\n- Tarjetas de credito/debito\n- Pagos digitales\n\nPara viajes largos solicitamos 50% de anticipo."
  }
  
  // Safety
  if (lowerMessage.includes("segur") || lowerMessage.includes("confiable")) {
    return "Tu seguridad es nuestra prioridad. Todos nuestros vehiculos:\n\n- Tienen seguro de pasajeros\n- Cuentan con aire acondicionado\n- Son conducidos por profesionales verificados\n- Incluyen seguimiento GPS en tiempo real"
  }
  
  // Contact
  if (lowerMessage.includes("telefono") || lowerMessage.includes("whatsapp") || lowerMessage.includes("contacto") || lowerMessage.includes("llamar")) {
    return "Puedes contactarnos:\n\n- WhatsApp: +505 7750-2626\n- Telefono: +505 7750-2626\n- Disponibles 24/7\n\n¿Necesitas que te ayude con algo mas?"
  }
  
  // Thanks
  if (lowerMessage.includes("gracias") || lowerMessage.includes("thank")) {
    return "De nada! Estoy aqui para ayudarte. Si tienes mas preguntas, no dudes en consultarme. ¡Que tengas un excelente viaje!"
  }
  
  // Default response
  return "Gracias por tu mensaje. Puedo ayudarte con:\n\n- Cotizaciones de viajes\n- Informacion de destinos\n- Reservaciones\n- Metodos de pago\n\nPor ejemplo, preguntame: '¿Cuanto cuesta un viaje del aeropuerto a San Juan del Sur?'\n\nO contactanos directamente al +505 7750-2626"
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue
    if (!textToSend.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now(),
      text: textToSend,
      isBot: false,
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    try {
      // Simulate bot thinking
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const botResponse: Message = {
        id: Date.now() + 1,
        text: getBotResponse(textToSend),
        isBot: true,
        timestamp: new Date()
      }

      setMessages((prev) => [...prev, botResponse])
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "Lo siento, hubo un error. Por favor intenta de nuevo o contactanos al +505 7750-2626",
        isBot: true,
        timestamp: new Date()
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage()
  }

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#1a5276] hover:bg-[#154360] text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen ? "scale-0" : "scale-100"
        }`}
        aria-label="Abrir chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 z-50 w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="bg-[#1a5276] text-white p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-[#1a5276]" />
            </div>
            <div>
              <h3 className="font-bold">Asistente Virtual</h3>
              <p className="text-xs text-white/80">Pacific Coast Taxi</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Cerrar chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl ${
                  message.isBot
                    ? "bg-gray-100 text-gray-800 rounded-tl-none"
                    : "bg-[#1a5276] text-white rounded-tr-none"
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.isBot && (
                    <Bot className="w-4 h-4 mt-0.5 text-[#1a5276] flex-shrink-0" />
                  )}
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  {!message.isBot && (
                    <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  )}
                </div>
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

        {/* Quick Actions */}
        <div className="px-4 pb-2 flex-shrink-0">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {["Precios", "Destinos", "Reservar", "Contacto"].map((action) => (
              <button
                key={action}
                onClick={() => handleSendMessage(action)}
                disabled={isTyping}
                className="px-3 py-1 text-xs bg-amber-100 text-[#1a5276] rounded-full whitespace-nowrap hover:bg-amber-200 transition-colors disabled:opacity-50"
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        {/* Input - Always visible */}
        <form onSubmit={handleSubmit} className="p-4 border-t flex-shrink-0 bg-white">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe tu mensaje..."
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
