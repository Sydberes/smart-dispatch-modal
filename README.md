# Smart Dispatch modal

The auto-routing dialog from Curri's Route Planner (working name **Smart Dispatch**),
extracted as a standalone, runnable prototype for engineering handoff.

A planner opens the dialog to auto-assign a queue of orders across the available
routes. Core Intelligence reads the order windows, matches orders to routes,
respects any stops the planner has locked in place, and commits the run.

```bash
npm install
npm run dev
```

Then click **Run Smart Dispatch**. A dark-mode toggle is included to verify both themes.

## What the dev gets

This is the modal plus the minimum needed to run it in isolation. Everything
outside `components/AutoAssignDialog.tsx` is either a shared primitive or demo
scaffolding — see the table below.

| Path | Role |
| --- | --- |
| `src/components/AutoAssignDialog.tsx` | **The deliverable.** The full modal. |
| `src/components/Button.tsx` | Curri Button, ported from `curri-components`. |
| `src/components/CoreIntelligenceIcon.tsx` | The Core Intelligence mark. |
| `src/data/autoassign.ts` | Demo route + order fixtures the dialog renders. |
| `src/data/exceptions.ts` | Source fixtures (`PLANNER_LANES`, `ORDER_QUEUE`) consumed by `autoassign.ts`. |
| `src/utils/cn.ts` | `clsx` + `tailwind-merge` class helper. |
| `src/styles/*.css` | Curri design tokens (light + dark). Do not edit — these mirror the design system. |
| `src/App.tsx` | **Demo only.** Launch button, dark toggle, and a minimal toast host standing in for the product Toaster. |

## Props

```ts
<AutoAssignDialog
  open={boolean}
  onClose={() => void}
  onToast={(toast: {
    title: string
    description?: string
    action?: { label: string; onClick: () => void }
  }) => void}
  onReopen={() => void}   // called from the "undo" toast to relaunch the flow
/>
```

In production the dialog is mounted by the order-queue rail; `onToast` is wired
to the app's real Toaster and `onReopen` re-triggers the open state.

## States

A three-step wizard (Routes → Orders → Review) with a conflicts gate and an
optimization run in between:

1. **Step 1 — Routes.** Select which routes are in scope. Opens on an AI
   "thinking" beat (shimmering Core Intelligence mark) that settles into the
   "ready" route list, grouped by branch.
2. **Route detail pane.** Selecting a route opens a master-detail pane to lock
   stops in place (the optimizer won't reorder a locked stop) and edit the
   route's required skills.
3. **Step 2 — Orders.** Select which orders to route, grouped by branch, with
   search and an excluded-review mode. The primary action is **Optimize**.
4. **Conflicts gate.** If any selected order's time window clashes with the
   chosen routes, a danger dialog lists the conflicting orders. The planner
   unchecks any they don't want to force through, then **Proceeds**. No
   conflicts → it optimizes straight through.
5. **Optimizing run.** Steps through the phases (reading windows → matching →
   keeping locked stops → checking drive times), then lands on Review.
6. **Step 3 — Review.** A light post-optimization confirmation: a one-line
   summary, totals tiles (orders / routes / locked stops), and a glanceable
   one-line-per-route impact list (`before → after stops`, `+N`). **Route N
   orders** commits and fires a success toast with **Undo**.

`ESC` steps back: it closes the detail pane first, then the dialog.

> Demo-only logic: conflicting orders are a stable ~22% subset, and per-route
> impact is a projected assignment (orders matched to a route in their branch).
> The real optimizer decides placement.

## Notes for implementation

- Fixtures in `src/data` are deterministic demo data, not an API contract. The
  shapes (`AssignRoute`, `AssignOrder`, `AssignStop`) show the fields the UI
  binds to.
- Animations are intentionally restrained: one AI animation per surface
  (shimmer), smooth ease-out curves, no spring/bounce. Keyframes live in
  `src/index.css`.
- All color/spacing comes from the token CSS in `src/styles`. Keep bindings on
  the `--color-*` / `--radius-*` variables rather than hardcoded values.
