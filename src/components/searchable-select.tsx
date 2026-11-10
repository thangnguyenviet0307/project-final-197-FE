import { useState, type Ref } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { searchText } from '@/utils/search-text';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from '@/components/ui/command';

export function SearchableSelect({
  id,
  value,
  options,
  onChange,
  onBlur,
  invalid,
  describedBy,
  required,
  ref,
  searchLabel = 'Tìm lựa chọn',
}: {
  id: string;
  value: string;
  options: { value: string; label: string; disabled?: boolean }[];
  onChange: (value: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
  describedBy?: string;
  required?: boolean;
  searchLabel?: string;
  ref?: Ref<HTMLButtonElement>;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setSearch('');
          onBlur?.();
        }
      }}
    >
      <PopoverTrigger
        render={
          <Button
            id={id}
            ref={ref}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-required={required}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className="w-full justify-between font-normal"
          />
        }
      >
        <span className="truncate">
          {options.find((option) => option.value === value)?.label ?? 'Chọn…'}
        </span>
        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        aria-label={searchLabel}
        className="w-[var(--anchor-width)] p-0"
      >
        <Command shouldFilter={false} label={searchLabel}>
          <CommandInput
            placeholder="Tìm kiếm…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>Không tìm thấy lựa chọn.</CommandEmpty>
            {options
              .filter((option) =>
                searchText(option.label).includes(searchText(search))
              )
              .map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                    setSearch('');
                    onBlur?.();
                  }}
                >
                  <Check
                    className={`size-4 ${option.value === value ? 'opacity-100' : 'opacity-0'}`}
                  />
                  {option.label}
                </CommandItem>
              ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
