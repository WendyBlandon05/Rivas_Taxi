import type { Language } from "@/contexts/language-context"

export const BCN_USD_TO_NIO_2026 = 36.6243

export function usdToNio(amountUsd: number) {
  return Math.round(amountUsd * BCN_USD_TO_NIO_2026 * 100) / 100
}

export function formatTripCurrency(amountUsd: number | null | undefined, language: Language) {
  const safeAmount = Number(amountUsd || 0)

  if (language === "es") {
    return `C$${usdToNio(safeAmount).toFixed(2)} NIO`
  }

  return `$${safeAmount.toFixed(2)} USD`
}

export function formatTripRate(amountUsd: number, language: Language) {
  if (language === "es") {
    return `C$${usdToNio(amountUsd).toFixed(2)}`
  }

  return `$${amountUsd.toFixed(2)}`
}
