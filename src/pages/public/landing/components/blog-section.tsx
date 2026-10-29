"use client"

import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePublicArticles } from "@/features/storefront/hooks/use-public-articles"
import { getApiError } from "@/services/api"

export function BlogSection() {
  const blogs = usePublicArticles("blog")

  return (
    <section id="blog" className="py-24 sm:py-32 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Bài viết mới nhất
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Từ chuyên mục tin tức
          </h2>
          <p className="text-lg text-muted-foreground">
            Cập nhật xu hướng, kinh nghiệm và kiến thức từ đội ngũ chuyên gia.
          </p>
        </div>

        {/* Blog Grid */}
        {blogs.isPending ? (
          <p role="status" className="text-center text-sm text-muted-foreground">Đang tải bài viết...</p>
        ) : blogs.isError ? (
          <div role="alert" className="space-y-3 text-center text-sm text-muted-foreground">
            <p>Không thể tải bài viết. {getApiError(blogs.error).message}</p>
            <button type="button" className="font-medium text-primary underline" onClick={() => void blogs.refetch()}>Thử tải lại</button>
          </div>
        ) : blogs.data.data.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">Chưa có bài blog được xuất bản.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {blogs.data.data.map((blog) => (
              <Card key={blog._id} className="overflow-hidden py-0">
                <div className="aspect-video bg-muted">
                  {blog.imageUrl && <img src={blog.imageUrl} alt={blog.title} className="size-full object-cover" loading="lazy" decoding="async" />}
                </div>
                <CardHeader className="gap-3 px-6 pt-6">
                  <p className="text-xs tracking-widest text-muted-foreground uppercase">{blog.category}</p>
                  <CardTitle className="text-xl font-bold">{blog.title}</CardTitle>
                  <CardDescription className="text-base">{blog.excerpt}</CardDescription>
                </CardHeader>
                <CardFooter className="px-6 pb-6">
                  <Link to={`/bai-viet/${encodeURIComponent(blog.slug)}`} className="inline-flex items-center gap-2 text-primary hover:underline">
                    Tìm hiểu thêm
                    <ArrowRight className="size-4" />
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
