import { cn } from 'cn';
import { useContext } from 'react';
import { StorefrontUiContext } from '@/context/storefront-ui-context';
import './skeleton.css';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  const storefront = useContext(StorefrontUiContext);
  return (
    <div
      data-slot="skeleton"
      data-loading-area={storefront ? 'storefront' : 'admin'}
      className={cn(
        'bg-muted animate-pulse rounded-md motion-reduce:animate-none',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
