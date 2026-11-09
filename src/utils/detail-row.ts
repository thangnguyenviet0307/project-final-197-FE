import type { HTMLAttributes } from 'react';

// Action buttons, links and portal dialogs retain their own interaction.
export function detailRow(
  onOpen: () => void
): HTMLAttributes<HTMLTableRowElement> {
  return {
    tabIndex: 0,
    'aria-haspopup': 'dialog',
    className:
      'cursor-pointer focus-visible:outline-ring focus-visible:outline-2 focus-visible:-outline-offset-2',
    onClick: (event) => {
      if (
        !(event.target instanceof Element) ||
        !event.currentTarget.contains(event.target) ||
        event.target.closest(
          'button, a, input, select, textarea, [role="dialog"], [role="alertdialog"], [data-row-action]'
        )
      )
        return;
      onOpen();
    },
    onKeyDown: (event) => {
      if (
        event.target === event.currentTarget &&
        (event.key === 'Enter' || event.key === ' ')
      ) {
        event.preventDefault();
        onOpen();
      }
    },
  };
}
