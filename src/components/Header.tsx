import { Home, Keyboard, X } from 'lucide-react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  segments: string[];
  onShowShortcuts: () => void;
  onDismiss: () => void;
}

export function Header({ segments, onShowShortcuts, onDismiss }: HeaderProps) {
  // Build breadcrumbs: Home + each segment. The first segment gets the
  // full first-level directory URL; deeper segments are clickable.
  const baseHref =
    typeof window !== 'undefined'
      ? new URL(window.location.href).origin
      : '';
  const crumbs = [
    { name: 'Home', href: baseHref + '/', isHome: true },
    ...segments.map((seg, i) => ({
      name: seg,
      href:
        baseHref + '/' + segments.slice(0, i + 1).join('/') + (i < segments.length - 1 ? '/' : ''),
      isHome: false,
    })),
  ];

  return (
    <header className="sticky top-0 z-30 flex flex-col gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
      <div className="flex items-center gap-3">
        <Breadcrumb className="min-w-0 flex-1">
          <BreadcrumbList>
            {crumbs.map((crumb, idx) => {
              const isLast = idx === crumbs.length - 1;
              return (
                <span key={crumb.href + idx} className="contents">
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="font-semibold">
                        {crumb.name}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <a
                          href={crumb.href}
                          className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
                        >
                          {crumb.isHome && <Home className="size-3.5" />}
                          {crumb.name}
                        </a>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </span>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onShowShortcuts}
                aria-label="Keyboard shortcuts"
              >
                <Keyboard className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Keyboard shortcuts (Shift + ?)</TooltipContent>
          </Tooltip>

          <ThemeToggle />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDismiss}
                aria-label="Hide File Explorer"
              >
                <X className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Hide File Explorer</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
