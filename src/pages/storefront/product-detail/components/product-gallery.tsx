import { useState } from "react"
import type { SyntheticEvent } from "react"
import { ChevronLeft, ChevronRight, Expand } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface ProductGalleryProps {
  name: string
  images: string[]
  activeImage: string
  fallbackImage?: string
  onImageChange: (image: string) => void
}

export function ProductGallery({ name, images, activeImage, fallbackImage, onImageChange }: ProductGalleryProps) {
  const [zoom, setZoom] = useState(false)
  const index = Math.max(0, images.indexOf(activeImage))
  const move = (offset: number) => onImageChange(images[(index + offset + images.length) % images.length])
  const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget
    const placeholder = "/storefront/product-placeholder.svg"
    if (image.src.endsWith(placeholder)) return
    image.src = fallbackImage && image.src !== new URL(fallbackImage, window.location.origin).href ? fallbackImage : placeholder
  }
  return <div className="pd-gallery grid min-w-0">
    <div className="pd-thumbnails flex" role="group" aria-label="Product images">
      {images.map((image, imageIndex) => <Button variant="ghost" className="pd-thumbnail shrink-0 rounded-none" key={image} aria-label={`View image ${imageIndex + 1}`} aria-pressed={image === activeImage} onClick={() => onImageChange(image)}><img src={image} alt={`${name} — view ${imageIndex + 1}`} className="size-full object-contain" onError={handleImageError} /></Button>)}
    </div>
    <div className="pd-main-image relative min-w-0 bg-white">
      <Button variant="ghost" className="pd-image-zoom size-full rounded-none p-0" aria-label={`Zoom ${name}`} onClick={() => setZoom(true)}><img src={activeImage} alt={name} className="aspect-square w-full object-contain" fetchPriority="high" onError={handleImageError} /></Button>
      <Button variant="ghost" size="icon" className="pd-expand absolute" aria-label="Open full-size product image" onClick={() => setZoom(true)}><Expand /></Button>
      {images.length > 1 && <><Button variant="ghost" size="icon" className="pd-image-prev absolute" aria-label="Previous product image" onClick={() => move(-1)}><ChevronLeft /></Button><Button variant="ghost" size="icon" className="pd-image-next absolute" aria-label="Next product image" onClick={() => move(1)}><ChevronRight /></Button></>}
    </div>
    <Dialog open={zoom} onOpenChange={setZoom}>
      <DialogContent className="pd-lightbox max-w-[92vw] rounded-none bg-white p-6 text-black sm:max-w-[850px]">
        <DialogTitle className="sr-only">{name} full-size image</DialogTitle>
        <DialogDescription className="sr-only">Use the arrows to view another product image. Press Escape to close.</DialogDescription>
        <img src={activeImage} alt={`${name} enlarged`} className="mx-auto max-h-[75vh] w-full object-contain" onError={handleImageError} />
        {images.length > 1 && <div className="flex items-center justify-center gap-5"><Button variant="outline" size="icon" aria-label="Previous enlarged image" onClick={() => move(-1)}><ChevronLeft /></Button><span className="text-xs text-neutral-500">{index + 1} / {images.length}</span><Button variant="outline" size="icon" aria-label="Next enlarged image" onClick={() => move(1)}><ChevronRight /></Button></div>}
      </DialogContent>
    </Dialog>
  </div>
}
