import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/utils/utils';

export function CatalogImage({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  const classes = cn(
    'size-12 shrink-0 rounded-lg border object-contain',
    className
  );
  if (!src || failed === src || !/^https?:\/\//i.test(src))
    return (
      <span
        role="img"
        aria-label={`${alt}: ảnh không khả dụng`}
        className={cn(
          classes,
          'bg-muted text-muted-foreground inline-flex items-center justify-center'
        )}
      >
        <ImageOff className="size-5" />
      </span>
    );
  return (
    <img
      src={src}
      alt={alt}
      className={classes}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(src)}
    />
  );
}
