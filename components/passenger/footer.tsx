"use client"

import Link from "next/link"
import { Facebook, MapPin, Phone, Mail, Clock, Car } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

// TikTok icon component since it's not in Lucide
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
    </svg>
  )
}

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-[#0d2d44] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                <Car className="w-7 h-7 text-white" />
              </div>
              <span className="font-bold text-lg">PACIFIC COAST TAXI</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              {t("footer.description")}
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              <Link 
                href="https://www.facebook.com/share/1ELPyg2ra8/" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#1a5276] rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </Link>
              <Link 
                href="https://www.tiktok.com/@pacific.coast.tax?_r=1&_t=ZS-96dNPChLfTV" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#1a5276] rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-amber-400">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t("footer.home")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t("footer.about")}
                </Link>
              </li>
              <li>
                <Link href="/#servicios" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t("footer.services")}
                </Link>
              </li>
              <li>
                <Link href="/trips" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t("footer.book")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t("footer.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-amber-400">{t("footer.ourServices")}</h3>
            <ul className="space-y-2">
              <li className="text-gray-400 text-sm">{t("services.urbano.title")}</li>
              <li className="text-gray-400 text-sm">{t("services.turistico.title")}</li>
              <li className="text-gray-400 text-sm">{t("services.empresarial.title")}</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-amber-400">{t("footer.contact")}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  Rivas, Nicaragua<br />
                  {t("footer.pacificCoast")}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <Link href="/contact" className="text-gray-400 hover:text-amber-400 text-sm transition-colors">
                  +505 7750-2626
                </Link>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm">info@pacificcoasttaxi.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm">{t("footer.available")}</span>
              </li>
            </ul>
            {/* WhatsApp Button */}
            <Link 
              href="/contact" 
              className="mt-4 inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {t("footer.whatsapp")}
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} Pacific Coast Taxi. {t("footer.rights")}
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                {t("footer.privacy")}
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                {t("footer.terms")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
