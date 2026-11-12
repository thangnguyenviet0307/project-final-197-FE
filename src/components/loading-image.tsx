import { useContext, useState, type ComponentProps } from 'react';
import { cn } from 'cn';
import { StorefrontUiContext } from '@/context/storefront-ui-context';
import './ui/skeleton.css';

/** Keeps the caller's image dimensions/layout and retires the pulse on load/error. */
export function LoadingImage({
  src,
  alt,
  className,
  onLoad,
  onError,
  ...props
}: ComponentProps<'img'>) {
  const [settledSrc, setSettledSrc] = useState<string | undefined>();
  const storefront = useContext(StorefrontUiContext);
  const pending = !!src && settledSrc !== src;
  return (
    <img
      {...props}
      src={src}
      alt={alt}
      aria-busy={pending}
      data-slot={pending ? 'skeleton' : undefined}
      data-loading-area={
        pending ? (storefront ? 'storefront' : 'admin') : undefined
      }
      className={cn(
        className,
        pending && 'bg-muted animate-pulse motion-reduce:animate-none'
      )}
      onLoad={(event) => {
        setSettledSrc(src);
        onLoad?.(event);
      }}
      onError={(event) => {
        setSettledSrc(src);
        onError?.(event);
      }}
    />
  );
}
