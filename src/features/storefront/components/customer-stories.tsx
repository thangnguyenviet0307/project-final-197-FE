import { useRef } from "react"
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react"
import { SectionHeading } from "./section-heading"

const stories = [
  {
    name: "Minh Anh",
    city: "TP. Hồ Chí Minh",
    product: "Tai nghe Studio",
    quote: "Đeo lâu vẫn thoải mái, âm thanh nghe rõ và cân bằng. Mình dùng mỗi ngày khi làm việc.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=320&q=80",
  },
  {
    name: "Quốc Bảo",
    city: "Hà Nội",
    product: "Máy ảnh Compact",
    quote: "Máy nhỏ gọn, mang đi du lịch rất tiện. Phần tư vấn chọn thiết bị cũng dễ hiểu và hữu ích.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80",
  },
  {
    name: "Thu Hà",
    city: "Đà Nẵng",
    product: "Đồng hồ Active",
    quote: "Thiết kế đẹp, thao tác đơn giản. Mình thích việc xem nhanh hoạt động trong ngày.",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=320&q=80",
  },
]

export function CustomerStories() {
  const storiesTrack = useRef<HTMLDivElement>(null)

  function moveStories(direction: -1 | 1) {
    storiesTrack.current?.scrollBy({ left: direction * storiesTrack.current.clientWidth, behavior: "smooth" })
  }

  return (
    <section className="bg-[#f5f6f4] py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          eyebrow="Chia sẻ từ khách hàng"
          title="Khách hàng nói về chúng tôi"
        />
        <div ref={storiesTrack} className="grid auto-cols-[min(88%,390px)] grid-flow-col gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory md:auto-cols-[calc((100%-1rem)/2)] lg:auto-cols-[calc((100%-2rem)/3)]">
          {stories.map((story) => (
            <figure key={story.name} className="snap-start overflow-hidden border border-gray-100 bg-white">
              <div className="grid h-full grid-cols-[96px_1fr] sm:grid-cols-[112px_1fr]">
                <img src={story.image} alt={story.name} loading="lazy" className="h-full min-h-48 w-full object-cover" />
                <div className="flex flex-col p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-0.5 text-[#e6a72e]" aria-label="5 trên 5 sao">
                      {Array.from({ length: 5 }, (_, index) => <Star key={index} size={12} fill="currentColor" />)}
                    </div>
                    <Quote size={18} className="text-[#76ad45]" />
                  </div>
                  <blockquote className="mt-3 flex-1 text-xs leading-6 text-gray-600 sm:text-sm">“{story.quote}”</blockquote>
                  <figcaption className="mt-3 border-t border-gray-100 pt-3">
                    <p className="text-sm font-bold text-gray-900">{story.name}</p>
                    <p className="mt-1 text-xs text-gray-500">{story.city} <span className="px-1 text-gray-300">·</span> {story.product}</p>
                  </figcaption>
                </div>
              </div>
            </figure>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" aria-label="Đánh giá trước" onClick={() => moveStories(-1)} className="flex size-9 items-center justify-center border border-gray-300 bg-white text-gray-600 transition hover:border-[#57952b] hover:text-[#57952b]"><ChevronLeft size={17} /></button>
          <button type="button" aria-label="Đánh giá tiếp theo" onClick={() => moveStories(1)} className="flex size-9 items-center justify-center border border-gray-300 bg-white text-gray-600 transition hover:border-[#57952b] hover:text-[#57952b]"><ChevronRight size={17} /></button>
        </div>
      </div>
    </section>
  )
}
