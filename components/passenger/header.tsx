"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, Car, LogIn, Star, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ReviewForm } from "./review-form"
import { useAuth } from "@/contexts/auth-context"

export function Header() {
  const router = useRouter()
  const { user, profile, signOut, isLoading } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  
  // Also check localStorage for guest users who booked without account
  const [guestName, setGuestName] = useState("")
  
  useEffect(() => {
    const savedName = localStorage.getItem("userName")
    if (savedName) setGuestName(savedName)
  }, [])

  const isLoggedIn = !!user || !!guestName
  const userName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ""}`.trim()
    : user?.email?.split("@")[0] 
    || guestName 
    || ""

  const handleLogout = async () => {
    await signOut()
    localStorage.removeItem("userName")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userPhone")
    setGuestName("")
    router.push("/")
  }

  const handleReviewSubmit = (review: { rating: number; comment: string }) => {
    console.log("Review submitted:", review)
    // Here you would send the review to your backend
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a5276]/95 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-amber-500 rounded-full flex items-center justify-center">
                <Car className="w-7 h-7 md:w-8 md:h-8 text-white" />
              </div>
              <span className="text-white font-bold text-lg md:text-xl tracking-wide">
                PACIFIC COAST TAXI
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-white hover:text-amber-400 transition-colors font-medium">
                INICIO
              </Link>
              <Link href="/about" className="text-white hover:text-amber-400 transition-colors font-medium">
                NOSOTROS
              </Link>
              <Link href="#servicios" className="text-white hover:text-amber-400 transition-colors font-medium">
                SERVICIOS
              </Link>
              
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold px-4 py-2 rounded-full flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {userName || "Mi Cuenta"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/my-trips" className="cursor-pointer">
                        <Car className="w-4 h-4 mr-2" />
                        Mis Viajes
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowReviewForm(true)} className="cursor-pointer">
                      <Star className="w-4 h-4 mr-2 text-amber-500" />
                      Dejar Resena
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Cerrar Sesion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold px-4 py-2 rounded-full flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    INICIAR SESION
                  </Button>
                </Link>
              )}
              
              <Link href="/trips?service=turistico">
                <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2 rounded-full">
                  RESERVA TU VIAJE
                </Button>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden py-4 border-t border-white/20">
              <div className="flex flex-col gap-4">
                <Link 
                  href="/" 
                  className="text-white hover:text-amber-400 transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  INICIO
                </Link>
                <Link 
                  href="/about" 
                  className="text-white hover:text-amber-400 transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  NOSOTROS
                </Link>
                <Link 
                  href="#servicios" 
                  className="text-white hover:text-amber-400 transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  SERVICIOS
                </Link>
                
                {isLoggedIn ? (
                  <>
                    <Link 
                      href="/my-trips" 
                      className="text-white hover:text-amber-400 transition-colors font-medium py-2 flex items-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Car className="w-4 h-4" />
                      MIS VIAJES
                    </Link>
                    <button
                      onClick={() => {
                        setShowReviewForm(true)
                        setIsMenuOpen(false)
                      }}
                      className="text-white hover:text-amber-400 transition-colors font-medium py-2 flex items-center gap-2 text-left"
                    >
                      <Star className="w-4 h-4 text-amber-400" />
                      DEJAR RESENA
                    </button>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors font-medium py-2 flex items-center gap-2 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      CERRAR SESION
                    </button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold px-6 py-2 rounded-full w-full flex items-center justify-center gap-2">
                      <LogIn className="w-4 h-4" />
                      INICIAR SESION
                    </Button>
                  </Link>
                )}
                
                <Link href="/trips?service=turistico" onClick={() => setIsMenuOpen(false)}>
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2 rounded-full w-full">
                    RESERVA TU VIAJE
                  </Button>
                </Link>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Review Form Modal */}
      <ReviewForm 
        isOpen={showReviewForm} 
        onClose={() => setShowReviewForm(false)}
        onSubmit={handleReviewSubmit}
      />
    </>
  )
}
