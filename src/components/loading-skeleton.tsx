import { Skeleton } from '@/components/ui/skeleton';
import { cn } from 'cn';
import { useContext } from 'react';
import { StorefrontUiContext } from '@/context/storefront-ui-context';

type LoadingVariant =
  | 'inline'
  | 'options'
  | 'chips'
  | 'categories'
  | 'list'
  | 'form'
  | 'text'
  | 'article'
  | 'articles'
  | 'products'
  | 'product'
  | 'preview'
  | 'table'
  | 'chat'
  | 'stats';

/** Initial data placeholders only; keep populated content during background refetches. */
export function LoadingSkeleton({
  label = 'Đang tải nội dung…',
  variant = 'list',
  className,
  count,
}: {
  label?: string;
  variant?: LoadingVariant;
  className?: string;
  count?: number;
}) {
  const storefront = useContext(StorefrontUiContext);
  const area = storefront ? 'storefront' : 'admin';
  if (variant === 'inline')
    return (
      <span
        role="status"
        data-loading-area={area}
        aria-label={label}
        aria-busy="true"
        className={cn('inline-flex max-w-full items-center gap-2', className)}
      >
        <span className="sr-only">{label}</span>
        <span
          aria-hidden="true"
          data-slot="skeleton"
          className="bg-muted inline-block h-4 w-24 animate-pulse rounded motion-reduce:animate-none"
        />
        <span
          aria-hidden="true"
          data-slot="skeleton"
          className="bg-muted inline-block h-4 w-12 animate-pulse rounded motion-reduce:animate-none"
        />
      </span>
    );
  const lines = (count: number) =>
    Array.from({ length: count }, (_, i) => (
      <Skeleton
        key={i}
        className={cn('h-4', i === count - 1 ? 'w-2/3' : 'w-full')}
      />
    ));
  const cards = variant === 'products' || variant === 'articles';
  return (
    <div
      role="status"
      data-loading-area={area}
      aria-label={label}
      aria-busy="true"
      className={cn('w-full min-w-0 py-3 text-left', className)}
    >
      <span className="sr-only">{label}</span>
      <div
        aria-hidden="true"
        className={cn(
          'space-y-4',
          cards && 'grid grid-cols-2 gap-4 space-y-0',
          variant === 'products' && 'lg:grid-cols-4',
          variant === 'articles' && 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
        )}
      >
        {cards ? (
          Array.from(
            { length: count ?? (variant === 'products' ? 8 : 6) },
            (_, i) => (
              <div
                key={i}
                className="border-border bg-background overflow-hidden rounded-xl border"
              >
                <Skeleton
                  className={cn(
                    'w-full rounded-none',
                    variant === 'products' ? 'aspect-[4/3]' : 'aspect-video'
                  )}
                />
                <div className="space-y-3 p-4">
                  <Skeleton className="h-3 w-2/3" />
                  {lines(2)}
                  <Skeleton className="mt-4 h-5 w-24" />
                </div>
              </div>
            )
          )
        ) : variant === 'preview' ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-16 shrink-0" />
              <Skeleton className="h-5 flex-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              ))}
            </div>
          </div>
        ) : variant === 'product' ? (
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-2xl" />
              <div className="flex gap-3">
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} className="size-16" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-8 w-4/5" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-10 w-36" />
              {lines(4)}
              <div className="flex gap-3">
                <Skeleton className="h-12 w-28" />
                <Skeleton className="h-12 flex-1" />
              </div>
              {lines(3)}
            </div>
          </div>
        ) : variant === 'article' || variant === 'text' ? (
          <div className="mx-auto max-w-4xl space-y-6">
            <Skeleton className="h-9 w-4/5" />
            <Skeleton className="h-4 w-1/3" />
            {variant === 'article' && (
              <Skeleton className="aspect-video w-full rounded-xl" />
            )}
            <div className="space-y-3">{lines(6)}</div>
            <Skeleton className="h-7 w-1/2" />
            <div className="space-y-3">{lines(5)}</div>
          </div>
        ) : variant === 'form' ? (
          <div className="space-y-6">
            <Skeleton className="h-7 w-40" />
            <div className="grid gap-5 sm:grid-cols-2">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-28" />
          </div>
        ) : variant === 'stats' ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="space-y-3 rounded-xl border p-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : variant === 'chips' ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-10 w-28 rounded-xl" />
            ))}
          </div>
        ) : variant === 'categories' ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 12 }, (_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : variant === 'chat' ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton
                key={i}
                className={cn(
                  'h-16 w-4/5 rounded-2xl',
                  i % 2 === 0 && 'ml-auto'
                )}
              />
            ))}
          </div>
        ) : variant === 'options' ? (
          <div className="space-y-3 px-3 py-2">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-4 shrink-0" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : variant === 'table' ? (
          <div className="overflow-hidden rounded-lg border">
            <div className="grid grid-cols-4 gap-4 border-b p-3">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-4 w-3/4" />
              ))}
            </div>
            {Array.from({ length: count ?? 5 }, (_, i) => (
              <div
                key={i}
                className="grid grid-cols-4 items-center gap-4 border-b p-3 last:border-0"
              >
                {Array.from({ length: 4 }, (_, j) => (
                  <Skeleton
                    key={j}
                    className={cn('h-5 w-4/5', j === 3 && 'w-16')}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-lg border p-4"
              >
                <Skeleton className="size-12 shrink-0" />
                <div className="flex-1 space-y-3">{lines(2)}</div>
                <Skeleton className="hidden h-7 w-20 sm:block" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
