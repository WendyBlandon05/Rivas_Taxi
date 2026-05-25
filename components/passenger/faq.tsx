"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useLanguage } from "@/contexts/language-context"

const faqs = [
  {
    id: "1",
    question: { es: "COMO PUEDO RESERVAR UN VIAJE?", en: "HOW CAN I BOOK A RIDE?" },
    answer: {
      es: "Puede reservar su viaje por el asistente virtual o mediante nuestro formulario en linea indicando origen, destino y horario deseado.",
      en: "You can book through the virtual assistant or with our online form by entering pickup, destination and preferred time.",
    },
  },
  {
    id: "2",
    question: { es: "ATIENDEN TRASLADOS FUERA DE RIVAS?", en: "DO YOU OFFER RIDES OUTSIDE RIVAS?" },
    answer: {
      es: "Si, realizamos traslados a cualquier destino de Nicaragua incluyendo Managua, Granada, Leon, Masaya y mas. Consulte nuestras tarifas para viajes largos.",
      en: "Yes, we offer transfers to destinations across Nicaragua, including Managua, Granada, Leon, Masaya and more. Ask us about long-distance rates.",
    },
  },
  {
    id: "3",
    question: { es: "ES NECESARIO REALIZAR DEPOSITO PARA VIAJES LARGOS?", en: "IS A DEPOSIT REQUIRED FOR LONG RIDES?" },
    answer: {
      es: "Para viajes de larga distancia, solicitamos un deposito del 50% para confirmar la reserva. El resto se paga al finalizar el servicio.",
      en: "For long-distance rides, we request a 50% deposit to confirm the booking. The rest is paid after the service.",
    },
  },
  {
    id: "4",
    question: { es: "PUEDEN RECOGERME EN HOTELES, TERMINALES O AEROPUERTOS?", en: "CAN YOU PICK ME UP AT HOTELS, TERMINALS OR AIRPORTS?" },
    answer: {
      es: "Por supuesto, ofrecemos servicio de recogida en hoteles, terminales de buses, aeropuertos y cualquier ubicacion acordada dentro de nuestra area de cobertura.",
      en: "Of course. We offer pickup from hotels, bus terminals, airports and any agreed location within our coverage area.",
    },
  },
  {
    id: "5",
    question: { es: "QUE METODOS DE PAGO ACEPTAN?", en: "WHAT PAYMENT METHODS DO YOU ACCEPT?" },
    answer: {
      es: "Aceptamos efectivo en cordobas y dolares, transferencias bancarias, pagos con tarjeta de credito/debito y pagos digitales.",
      en: "We accept cash in cordobas and dollars, bank transfers, credit/debit cards and digital payments.",
    },
  },
]

export function FAQ() {
  const { language } = useLanguage()

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1a5276]">
            {language === "en" ? "FREQUENTLY ASKED QUESTIONS" : "PREGUNTAS FRECUENTES"}
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="border-0 bg-[#1a5276] rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-6 py-4 text-white hover:no-underline hover:bg-[#154360] data-[state=open]:bg-[#154360]">
                <span className="text-left font-semibold">{faq.question[language]}</span>
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4 bg-white text-gray-700 border-l-4 border-[#1a5276]">
                {faq.answer[language]}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
