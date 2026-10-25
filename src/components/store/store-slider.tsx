
import { useState, type ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface StoreSliderProps {
  children: ReactNode[]
  className?: string
}

export function StoreSlider({
  children,
  className = "",
}: StoreSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const totalSlides = children.length

  if (totalSlides === 0) return null

  const nextSlide = () => {
    setActiveIndex((current) => (current + 1) % totalSlides)
  }

  const previousSlide = () => {
    setActiveIndex(
      (current) => (current - 1 + totalSlides) % totalSlides
    )
  }

  return (
    <section
      aria-label="Trình chiếu cửa hàng"
      className={`relative w-full overflow-hidden ${className}`}
    >
      {/* Slide content */}
      <div className="relative">
        {children.map((slide, index) => (
          <div
            key={index}
            hidden={index !== activeIndex}
            className="w-full"
          >
            {slide}
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      {totalSlides > 1 && (
        <>
          <button
            type="button"
            onClick={previousSlide}
            aria-label="Slide trước"
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 text-black shadow transition hover:bg-[#55b000] hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Slide tiếp theo"
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 text-black shadow transition hover:bg-[#55b000] hover:text-white"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Pagination dots */}
      {totalSlides > 1 && (
        <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {children.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Chuyển đến slide ${index + 1}`}
              aria-current={activeIndex === index ? "true" : undefined}
              className={`h-2.5 rounded-full transition-all ${
                activeIndex === index
                  ? "w-7 bg-[#55b000]"
                  : "w-2.5 bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
