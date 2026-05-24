import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/auth-context'
import { LanguageProvider } from '@/contexts/language-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pacific Coast Taxi - Viaja Seguro por Nicaragua',
  description: 'Servicio de taxi turistico en Rivas, Nicaragua. Viajes seguros a San Juan del Sur, playas del Pacifico y destinos turisticos. Reservas rapidas y conductores confiables.',
  keywords: ['taxi', 'nicaragua', 'rivas', 'san juan del sur', 'transporte turistico', 'viajes', 'playas'],
  authors: [{ name: 'Pacific Coast Taxi' }],
  openGraph: {
    title: 'Pacific Coast Taxi - Viaja Seguro por Nicaragua',
    description: 'Servicio de taxi turistico en Rivas, Nicaragua. Reservas rapidas y conductores confiables.',
    type: 'website',
    locale: 'es_NI',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a5276',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_ID

  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background" suppressHydrationWarning>
        {gaMeasurementId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}');
              `}
            </Script>
          </>
        )}
        <LanguageProvider>
          <AuthProvider>
            {children}
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </LanguageProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
