import Image from "next/image"

type BrandLogoProps = {
  className?: string
}

export function BrandLogo({ className = "h-12 w-12" }: BrandLogoProps) {
  return (
    <Image
      src="/apple-icon.png"
      alt="Pacific Coast Taxi"
      width={180}
      height={180}
      className={`shrink-0 object-contain ${className}`}
    />
  )
}
