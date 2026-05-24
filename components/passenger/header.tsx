"use client"

import { useState } from "react"
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
import { useLanguage } from "@/contexts/language-context"

export function Header() {
  const router = useRouter()
  const { user, profile, signOut, isLoading } = useAuth()
  const { language, toggleLanguage, t } = useLanguage()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  
  const isLoggedIn = !!user
  const userName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ""}`.trim()
    : user?.email?.split("@")[0] 
    || ""

  const handleLogout = async () => {
    await signOut()
    router.replace("/")
    router.refresh()
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
                {t("nav.home")}
              </Link>
              <Link href="/about" className="text-white hover:text-amber-400 transition-colors font-medium">
                {t("nav.about")}
              </Link>
              <Link href="#servicios" className="text-white hover:text-amber-400 transition-colors font-medium">
                {t("nav.services")}
              </Link>
              <button
                type="button"
                onClick={toggleLanguage}
                className="text-white hover:text-amber-400 transition-colors font-bold border border-white/40 rounded-full px-3 py-1 text-sm"
                aria-label={t("language.label")}
              >
                {language === "es" ? "EN" : "ES"}
              </button>
              
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold px-4 py-2 rounded-full flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {userName || t("nav.account")}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/my-trips" className="cursor-pointer">
                        <Car className="w-4 h-4 mr-2" />
                        {t("nav.myTrips")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowReviewForm(true)} className="cursor-pointer">
                      <Star className="w-4 h-4 mr-2 text-amber-500" />
                      {t("nav.review")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      {t("nav.logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold px-4 py-2 rounded-full flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    {t("nav.login")}
                  </Button>
                </Link>
              )}
              
              <Link href="/trips?service=turistico">
                <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2 rounded-full">
                  {t("nav.book")}
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
                  {t("nav.home")}
                </Link>
                <Link 
                  href="/about" 
                  className="text-white hover:text-amber-400 transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("nav.about")}
                </Link>
                <Link 
                  href="#servicios" 
                  className="text-white hover:text-amber-400 transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("nav.services")}
                </Link>
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="text-white hover:text-amber-400 transition-colors font-bold py-2 text-left"
                  aria-label={t("language.label")}
                >
                  {t("language.label")}: {language === "es" ? "English" : "Español"}
                </button>
                
                {isLoggedIn ? (
                  <>
                    <Link 
                      href="/my-trips" 
                      className="text-white hover:text-amber-400 transition-colors font-medium py-2 flex items-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Car className="w-4 h-4" />
                      {t("nav.myTrips").toUpperCase()}
                    </Link>
                    <button
                      onClick={() => {
                        setShowReviewForm(true)
                        setIsMenuOpen(false)
                      }}
                      className="text-white hover:text-amber-400 transition-colors font-medium py-2 flex items-center gap-2 text-left"
                    >
                      <Star className="w-4 h-4 text-amber-400" />
                      {t("nav.review").toUpperCase()}
                    </button>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors font-medium py-2 flex items-center gap-2 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      {t("nav.logout").toUpperCase()}
                    </button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold px-6 py-2 rounded-full w-full flex items-center justify-center gap-2">
                      <LogIn className="w-4 h-4" />
                      {t("nav.login")}
                    </Button>
                  </Link>
                )}
                
                <Link href="/trips?service=turistico" onClick={() => setIsMenuOpen(false)}>
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2 rounded-full w-full">
                    {t("nav.book")}
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
