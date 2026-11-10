import { LayoutGrid } from 'lucide-react';
import { CatalogImage } from '@/components/catalog-image';
import { cn } from '@/utils/utils';

export const catalogOptionGrid =
  'grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4';

export function CatalogOptionContent({
  name,
  image,
  all = false,
}: {
  name: string;
  image?: string;
  all?: boolean;
}) {
  return (
    <span className="flex min-w-0 flex-1 items-center gap-3" title={name}>
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white text-gray-500"
      >
        {all ? (
          <LayoutGrid className="size-5" />
        ) : (
          <CatalogImage
            src={image}
            alt=""
            className="size-9 rounded-lg border-0 bg-white object-contain object-center text-gray-500"
          />
        )}
      </span>
      <span className="line-clamp-2 min-w-0 text-left text-sm leading-5 font-medium break-words">
        {name}
      </span>
    </span>
  );
}

export function CatalogFilterOption({
  name,
  image,
  all,
  selected,
  onClick,
  compact = false,
}: {
  name: string;
  image?: string;
  all?: boolean;
  selected: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'flex h-16 w-full min-w-0 items-center rounded-xl border px-3 text-gray-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d9210]',
        compact &&
          'h-12 w-auto max-w-full gap-2 rounded-lg px-2.5 [&_img]:size-7 [&_span[aria-hidden]]:size-7',
        selected
          ? 'border-[#4d9210] bg-[#e9f5e0] text-[#397a16] ring-1 ring-[#4d9210]'
          : 'border-gray-200 bg-white hover:border-[#9acb74] hover:text-[#397a16]'
      )}
    >
      <CatalogOptionContent name={name} image={image} all={all} />
    </button>
  );
}
