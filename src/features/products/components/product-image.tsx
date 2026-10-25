import { useState } from "react"
import { ImageOff } from "lucide-react"
import { cn } from "@/utils/utils"

export function ProductImage({ src, alt, className }: { src?: string | null; alt: string; className?: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  if (!src || failedSrc === src) return <span role="img" aria-label={alt ? `${alt}: ảnh không khả dụng` : "Ảnh không khả dụng"}
    className={cn("inline-flex shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground", className)}><ImageOff className="size-6" /></span>
  return <img src={src} alt={alt} loading="lazy" className={cn("rounded-md object-contain", className)} onError={() => setFailedSrc(src)} />
}
