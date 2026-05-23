"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

export function TermsPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    // Check if terms have been accepted
    const hasAcceptedTerms = localStorage.getItem("hasAcceptedTerms")
    
    if (!hasAcceptedTerms) {
      // Show popup after promotions popup (5 seconds delay)
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    if (accepted) {
      localStorage.setItem("hasAcceptedTerms", "true")
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-[#1a5276] text-xl font-bold">
            Terminos y Condiciones
          </DialogTitle>
          <DialogDescription>
            Por favor, lea y acepte nuestros terminos y condiciones para continuar.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-64 rounded-md border p-4">
          <div className="space-y-4 text-sm text-gray-600">
            <h4 className="font-semibold text-[#1a5276]">1. Servicio de Transporte</h4>
            <p>
              Pacific Coast Taxi ofrece servicios de transporte turistico y local en el departamento 
              de Rivas, Nicaragua. Nos comprometemos a proporcionar un servicio seguro, puntual y 
              de calidad.
            </p>

            <h4 className="font-semibold text-[#1a5276]">2. Reservaciones</h4>
            <p>
              Las reservaciones pueden realizarse a traves de nuestro sitio web, aplicacion movil 
              o llamada telefonica. Una vez confirmada la reserva, el usuario recibira un correo 
              de confirmacion con los detalles del viaje.
            </p>

            <h4 className="font-semibold text-[#1a5276]">3. Cancelaciones</h4>
            <p>
              Las cancelaciones deben realizarse con al menos 2 horas de anticipacion para 
              viajes locales y 24 horas para viajes interdepartamentales. Cancelaciones 
              tardias pueden incurrir en cargos.
            </p>

            <h4 className="font-semibold text-[#1a5276]">4. Pagos</h4>
            <p>
              Aceptamos pagos en efectivo (cordobas y dolares), transferencias bancarias y 
              tarjetas de credito/debito. Para viajes largos, se requiere un deposito del 
              50% al momento de la reserva.
            </p>

            <h4 className="font-semibold text-[#1a5276]">5. Responsabilidades del Usuario</h4>
            <p>
              El usuario se compromete a proporcionar informacion veridica, estar puntual 
              en el punto de recogida y respetar las normas de conducta durante el viaje.
            </p>

            <h4 className="font-semibold text-[#1a5276]">6. Equipaje</h4>
            <p>
              Cada pasajero puede llevar hasta 2 maletas de tamano estandar. Equipaje adicional 
              o de gran tamano debe notificarse al momento de la reserva y puede tener costos 
              adicionales.
            </p>

            <h4 className="font-semibold text-[#1a5276]">7. Seguridad</h4>
            <p>
              Todos nuestros vehiculos cuentan con seguro de pasajeros, aire acondicionado 
              y conductores profesionales verificados. La seguridad de nuestros clientes es 
              nuestra prioridad.
            </p>

            <h4 className="font-semibold text-[#1a5276]">8. Privacidad</h4>
            <p>
              La informacion personal proporcionada sera utilizada unicamente para la 
              prestacion del servicio y no sera compartida con terceros sin consentimiento.
            </p>

            <h4 className="font-semibold text-[#1a5276]">9. Contacto</h4>
            <p>
              Para cualquier consulta, queja o sugerencia, puede contactarnos a traves de 
              nuestros canales oficiales: telefono, correo electronico o redes sociales.
            </p>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col gap-4 sm:flex-col">
          <div className="flex items-center gap-2">
            <Checkbox
              id="terms"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked === true)}
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              He leido y acepto los terminos y condiciones
            </label>
          </div>
          <Button
            onClick={handleAccept}
            disabled={!accepted}
            className="w-full bg-[#1a5276] hover:bg-[#154360] text-white"
          >
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
