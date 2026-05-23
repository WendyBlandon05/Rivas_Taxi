import { Header } from "@/components/passenger/header"
import { Hero } from "@/components/passenger/hero"
import { Testimonials } from "@/components/passenger/testimonials"
import { RecentTrips } from "@/components/passenger/recent-trips"
import { FAQ } from "@/components/passenger/faq"
import { Services } from "@/components/passenger/services"
import { Footer } from "@/components/passenger/footer"
import { PromotionsPopup } from "@/components/passenger/promotions-popup"
import { TermsPopup } from "@/components/passenger/terms-popup"
import { ChatBot } from "@/components/passenger/chat-bot"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Services />
      <Testimonials />
      <RecentTrips />
      <FAQ />
      <Footer />
      <PromotionsPopup />
      <TermsPopup />
      <ChatBot />
    </main>
  )
}
