# UI System

How styling, theming, and shadcn/ui components work across the monorepo.

## Stack

| Layer | Technology |
| --- | --- |
| Component library | shadcn/ui (new-york style) |
| Primitives | Radix UI |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Toasts | Sonner |
| Dark mode | next-themes |

## Package layout

```
packages/ui/
  src/
    components/ui/     # shadcn components
    hooks/             # use-mobile, etc.
    lib/utils.ts       # cn() helper
    styles/globals.css # Theme tokens (reference)
  components.json      # shadcn CLI config (package-local)

apps/app/
  src/app/globals.css  # Tailwind entry + @source directives
  components.json      # Routes shadcn installs to packages/ui
```

## Importing components

```tsx
import { Button } from '@saas-boilerplate/ui/components/button';
import { Card, CardHeader, CardTitle } from '@saas-boilerplate/ui/components/card';
import { cn } from '@saas-boilerplate/ui/lib/utils';
```

## Adding components

From `apps/app` (recommended):

```bash
pnpm dlx shadcn@latest add dialog checkbox alert-dialog
```

The CLI installs files into `packages/ui/src/components/ui/` and updates dependencies in `packages/ui/package.json`.

> **Note:** Components like `attachment`, `message`, and `bubble` are from the [AI Elements](https://elements.ai-sdk.dev) registry, not the default shadcn registry.

## Tailwind v4 + monorepo

The app's CSS entry (`apps/app/src/app/globals.css`) must scan the UI package:

```css
@import 'tailwindcss';
@import 'tw-animate-css';

@source '../../../../packages/ui/src';
@source '../';
```

Without `@source`, Tailwind will not generate utilities used in `packages/ui` (e.g. `bg-sidebar`, dropdown spacing) and components will appear unstyled.

## Theming

CSS variables use **oklch** color space (shadcn v4 default):

- Light/dark tokens defined in `:root` and `.dark`
- `@theme inline` maps tokens to Tailwind color utilities
- Dark mode toggled via `next-themes` in `ThemeProvider`

Theme toggle: `apps/app/src/components/dashboard/theme-toggle.tsx`

## Dark mode provider

`next-themes@0.4.6` is patched at the monorepo root (`patches/next-themes@0.4.6.patch`) to fix React 19 script tag warnings. Re-apply after upgrading.

## Layout providers

Root layout wraps the app with:

- `TooltipProvider` — required for sidebar tooltips
- `ClientProvider` — Redux + PersistGate + ThemeProvider
- `Toaster` — Sonner toast notifications

## Currently installed components

| Component | Used for |
| --- | --- |
| `button` | Actions, forms, theme toggle |
| `card` | Auth forms |
| `input`, `label` | Form fields |
| `sidebar` | Dashboard shell |
| `dropdown-menu` | Nav user, team switcher, theme |
| `avatar` | User profile |
| `collapsible` | Sidebar nav groups |
| `separator` | Header divider |
| `sonner` | Toast notifications |
| `tooltip` | Sidebar collapsed state |
| `sheet`, `skeleton` | Sidebar mobile/deps |

## Customization

1. Edit component source directly in `packages/ui/src/components/ui/`
2. Override CSS variables in `apps/app/src/app/globals.css`
3. Use `cn()` to merge Tailwind classes in app components

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Unstyled sidebar/dropdowns | Check `@source` paths in `globals.css` |
| Dark mode not working | Ensure `<html suppressHydrationWarning>` and ThemeProvider |
| Missing component | Run `pnpm dlx shadcn@latest add <name> -c apps/app` |
| Toast not showing | Import `Toaster` from `@saas-boilerplate/ui/components/sonner` |
