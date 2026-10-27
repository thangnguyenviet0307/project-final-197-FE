import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

export function SectionHeading({
  eyebrow,
  title,
  description,
  to,
  linkLabel = "Khám phá",
  light = false,
}: {
  eyebrow: string
  title: string
  description?: string
  to?: string
  linkLabel?: string
  light?: boolean
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:mb-9 sm:flex-row sm:items-end">
      <div>
        <p className={`mb-2 text-xs font-bold uppercase tracking-[0.2em] ${light ? "text-lime-300" : "text-[#57952b]"}`}>
          {eyebrow}
        </p>
        <h2 className={`text-2xl font-bold tracking-tight sm:text-3xl ${light ? "text-white" : "text-gray-950"}`}>
          {title}
        </h2>
        {description && (
          <p className={`mt-2 max-w-2xl text-sm leading-6 ${light ? "text-white/65" : "text-gray-500"}`}>
            {description}
          </p>
        )}
      </div>
      {to && (
        <Link to={to} className={`inline-flex w-fit items-center gap-2 text-sm font-semibold transition hover:gap-3 ${light ? "text-white" : "text-gray-700"}`}>
          {linkLabel} <ArrowRight size={16} />
        </Link>
      )}
    </div>
  )
}
