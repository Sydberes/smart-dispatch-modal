# Tokens

This folder ships with **placeholder token files** so the template runs out of the box. **Replace them with your product's tokens before customizing further.**

## Files in this folder

| File | What it does |
|---|---|
| `foundations.css` | Raw color / scale primitives (e.g. `--color-teal-500: #00e3a3`). The "private" token layer — never reference these from components. |
| `foundation-light.css` | Light-mode mappings from primitives to semantic foundation tokens. |
| `foundation-dark.css` | Dark-mode mappings. Activated when `<html data-theme="dark">`. |
| `design-tokens.css` | Public semantic tokens (e.g. `--color-text-primary`, `--radius-sm`). **These are what components reference.** |
| `responsive-tokens.css` | Density-aware spacing tokens (e.g. `--spacing-md`). |
| `theme-dark.css` | Dark theme overrides keyed off `[data-theme="dark"]`. |

## Required token names

The template's shell (`App.tsx`, `index.css`) reads these tokens. Your replacement files must define all of them or the shell will fall back to invisible defaults.

**Colors**

```
--color-elevation-surface-base
--color-elevation-surface-base-pressed
--color-elevation-surface-primary
--color-elevation-surface-primary-hover
--color-elevation-surface-sunken
--color-elevation-surface-overlay
--color-text-primary
--color-text-secondary
--color-text-tertiary
--color-text-disabled
--color-text-brand-button
--color-icon-primary
--color-icon-secondary
--color-icon-tertiary
--color-border-primary
--color-border-bold
--color-background-neutral-primary
--color-background-selected-bold
--color-background-brand-subtle-pressed
```

**Spacing / radius / weight**

```
--spacing-md
--spacing-lg
--radius-xs
--radius-sm
--border-width-default
--font-weight-body-medium
--font-weight-heading-semi-bold
```

## Replacing the tokens

The designer can provide tokens via any of:

1. **Token package** (Style Dictionary, w3c-design-tokens, etc.) → import the package's CSS output and delete these placeholder files
2. **Plain JSON or CSS file** → drop it in here, update `src/index.css` to import it
3. **Figma variables** → run a Figma → tokens export and place the output here

Whichever you pick, `index.css` must continue to import the files (the import order matters: foundations → mappings → semantic tokens → theme overrides).
