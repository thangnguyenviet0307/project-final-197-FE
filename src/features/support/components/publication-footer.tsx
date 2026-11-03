import type { Publication } from "@/features/support/types/managed-document"

export function PublicationFooter({ publication }: { publication: Publication }) {
  const date = (value: string) => new Date(value).toLocaleString("vi-VN")
  return <footer className="mt-8 border-t pt-4 text-sm text-gray-500">
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2"><span className="font-semibold text-gray-800">Thông tin cửa hàng</span>
      {publication.publishedAt && <><span aria-hidden="true">•</span><span>Ngày đăng: <time dateTime={publication.publishedAt}>{date(publication.publishedAt)}</time></span></>}
      <span aria-hidden="true">•</span><span>{publication.views.toLocaleString("vi-VN")} lượt xem</span>
    </div>
    {publication.updatedAt && <p className="mt-2">Cập nhật: <time dateTime={publication.updatedAt}>{date(publication.updatedAt)}</time></p>}
  </footer>
}
