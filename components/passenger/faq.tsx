"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    id: "1",
    question: "¿COMO PUEDO RESERVAR UN VIAJE?",
    answer: "Puede reservar su viaje por el asistente virtual o mediante nuestro formulario en linea indicando origen, destino y horario deseado."
  },
  {
    id: "2",
    question: "¿ATIENDEN TRASLADOS FUERA DE RIVAS?",
    answer: "Si, realizamos traslados a cualquier destino de Nicaragua incluyendo Managua, Granada, Leon, Masaya y mas. Consulte nuestras tarifas para viajes interdepartamentales."
  },
  {
    id: "3",
    question: "¿ES NECESARIO REALIZAR DEPOSITO PARA VIAJES LARGOS?",
    answer: "Para viajes interdepartamentales o de larga distancia, solicitamos un deposito del 50% para confirmar la reserva. El resto se paga al finalizar el servicio."
  },
  {
    id: "4",
    question: "¿PUEDEN RECOGERME EN HOTELES, TERMINALES O AEROPUERTOS?",
    answer: "Por supuesto, ofrecemos servicio de recogida en hoteles, terminales de buses, aeropuertos y cualquier ubicacion acordada dentro de nuestra area de cobertura."
  },
  {
    id: "5",
    question: "¿QUE METODOS DE PAGO ACEPTAN?",
    answer: "Aceptamos efectivo en cordobas y dolares, transferencias bancarias, y pagos con tarjeta de credito/debito. Tambien aceptamos pagos digitales."
  }
]

export function FAQ() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1a5276]">
            PREGUNTAS FRECUENTES
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
                <span className="text-left font-semibold">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4 bg-white text-gray-700 border-l-4 border-[#1a5276]">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
