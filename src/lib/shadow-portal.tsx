import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

/**
 * Container inside the shadow root where Radix portals (Dialog, Tooltip,
 * DropdownMenu, etc.) should render. We can't use `document.body`
 * because that lives outside our shadow root and therefore outside our
 * Tailwind scope — unstyled dialogs/tooltips are the symptom.
 */
const ShadowPortalContext = React.createContext<HTMLElement | null>(null);

/** Provider component that sets the shadow-root portal container. */
export function ShadowPortalProvider({
  value,
  children,
}: {
  value: HTMLElement | null;
  children: React.ReactNode;
}) {
  return (
    <ShadowPortalContext.Provider value={value}>
      {children}
    </ShadowPortalContext.Provider>
  );
}

/** Reads the portal container from context, falling back to document.body. */
function usePortalContainer(): HTMLElement | undefined {
  const ctx = React.useContext(ShadowPortalContext);
  // `container` is optional — when undefined Radix falls back to body,
  // which is the right default outside a shadow root.
  return ctx ?? undefined;
}

/**
 * Drop-in replacement for `DialogPrimitive.Portal` that renders inside
 * the shadow root when available.
 */
export function ShadowDialogPortal({
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  const container = usePortalContainer();
  return (
    <DialogPrimitive.Portal container={container} {...props}>
      {children}
    </DialogPrimitive.Portal>
  );
}

/**
 * Drop-in replacement for `DropdownMenuPrimitive.Portal` that renders inside
 * the shadow root when available.
 */
export function ShadowDropdownPortal({
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  const container = usePortalContainer();
  return (
    <DropdownMenuPrimitive.Portal container={container} {...props}>
      {children}
    </DropdownMenuPrimitive.Portal>
  );
}

/**
 * Drop-in replacement for `TooltipPrimitive.Portal` that renders inside
 * the shadow root when available.
 */
export function ShadowTooltipPortal({
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Portal>) {
  const container = usePortalContainer();
  return (
    <TooltipPrimitive.Portal container={container} {...props}>
      {children}
    </TooltipPrimitive.Portal>
  );
}