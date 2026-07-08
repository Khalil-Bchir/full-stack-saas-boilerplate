# @saas-boilerplate/ui

Shared [shadcn/ui](https://ui.shadcn.com) component library for the monorepo.

## Overview

| Item | Value |
| --- | --- |
| Style | new-york |
| Primitives | Radix UI |
| Icons | Lucide React |
| Toasts | Sonner |
| Styling | Tailwind CSS v4 (scanned from app) |

## Directory structure

```
src/
  components/ui/     shadcn components (button, sidebar, etc.)
  hooks/
    use-mobile.tsx   Mobile breakpoint hook
  lib/
    utils.ts         cn() — clsx + tailwind-merge
  styles/
    globals.css      Theme tokens (reference; app owns Tailwind entry)
components.json      shadcn CLI config
package.json         Exports + package imports (# aliases)
```

## Exports

```json
{
  "./components/*": "./src/components/ui/*.tsx",
  "./lib/*": "./src/lib/*.ts",
  "./hooks/*": "./src/hooks/*.tsx",
  "./globals.css": "./src/styles/globals.css"
}
```

## Importing

```tsx
import { Button } from '@saas-boilerplate/ui/components/button';
import { Sidebar, SidebarProvider } from '@saas-boilerplate/ui/components/sidebar';
import { cn } from '@saas-boilerplate/ui/lib/utils';
```

## Adding components

From `apps/app` (routes installs here via its `components.json`):

```bash
cd apps/app
pnpm dlx shadcn@latest add dialog checkbox alert-dialog
```

Or from repo root:

```bash
pnpm dlx shadcn@latest add dialog -c apps/app
```

## Installed components

`avatar`, `button`, `card`, `collapsible`, `dropdown-menu`, `input`, `label`, `separator`, `sheet`, `sidebar`, `skeleton`, `sonner`, `tooltip`

## Tailwind scanning

The **app** must include `@source` for this package in `apps/app/src/app/globals.css`:

```css
@source '../../../../packages/ui/src';
```

Without this, component utility classes won't be generated.

## Package imports (internal)

Components use `#` aliases defined in `package.json`:

```ts
import { cn } from '#lib/utils';
import { Button } from '#components/ui/button';
```

## Notes

- Use **sonner** for toasts — the legacy `toast` component is deprecated
- AI/chat components (`attachment`, `message`, `bubble`) are from [AI Elements](https://elements.ai-sdk.dev), not the default shadcn registry
- `next-themes` is a dependency for the Sonner theme integration

## Related docs

- [UI System](../../doc/features/ui-system.md)
- [shadcn Monorepo Docs](https://ui.shadcn.com/docs/monorepo)
