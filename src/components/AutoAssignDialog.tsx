import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Check,
  Minus,
  MagnifyingGlass,
  CaretRight,
  LockSimple,
  LockSimpleOpen,
  Tag,
  Plus,
} from '@phosphor-icons/react'
import { CoreIntelligenceIcon } from './CoreIntelligenceIcon'
import { Button } from './Button'
import {
  ASSIGN_ROUTES,
  ASSIGN_ORDERS,
  BRANCHES,
  SKILLS,
  SKILL_DOTS,
  type AssignRoute,
  type AssignOrder,
} from '../data/autoassign'

const EASE_OUT = [0.25, 0.1, 0.25, 1] as const

/** Core Intelligence Loading Text: shimmer is the single animation on this surface. */
function LoadingText({ label }: { label: string }) {
  return (
    <span
      className="inline-block text-[12px] bg-clip-text text-transparent"
      style={{
        backgroundImage:
          'linear-gradient(110deg, var(--color-text-tertiary) 30%, var(--color-text-secondary) 42%, var(--color-text-primary) 50%, var(--color-text-secondary) 58%, var(--color-text-tertiary) 70%)',
        backgroundSize: '200% 100%',
        animation: 'ai-shimmer 2.4s linear infinite',
      }}
    >
      {label}…
    </span>
  )
}

/** Curri Tooltip spec: overlay surface, hairline border, rounded-xs, 12px medium. */
function Hint({
  content,
  children,
}: {
  content: string
  children: React.ReactNode
}) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const anchor = useRef<HTMLSpanElement>(null)

  const show = () => {
    timer.current = window.setTimeout(() => {
      const r = anchor.current?.getBoundingClientRect()
      if (r) setPos({ x: r.left + r.width / 2, y: r.top - 6 })
    }, 350)
  }
  const hide = () => {
    window.clearTimeout(timer.current)
    setPos(null)
  }

  return (
    <span
      ref={anchor}
      className="inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}
      {pos && (
        <span
          className="fixed z-[1200] whitespace-nowrap px-2.5 py-1 rounded-xs text-[12px] pointer-events-none"
          style={{
            left: pos.x,
            top: pos.y,
            transform: 'translate(-50%, -100%)',
            background: 'var(--color-elevation-surface-overlay)',
            border: '0.5px solid var(--color-border-primary)',
            boxShadow: 'var(--shadow-elevation-overlay)',
            color: 'var(--color-text-primary)',
            fontWeight: 500,
            animation: 'ai-fade-in 150ms ease-out',
          }}
        >
          {content}
        </span>
      )}
    </span>
  )
}

export function AutoAssignDialog({
  open,
  onClose,
  onToast,
  onReopen,
}: {
  open: boolean
  onClose: () => void
  onToast: (toast: {
    title: string
    description?: string
    action?: { label: string; onClick: () => void }
  }) => void
  onReopen: () => void
}) {
  const [step, setStep] = useState<1 | 2>(1)
  const [phase, setPhase] = useState<'thinking' | 'ready' | 'optimizing'>(
    'thinking',
  )
  const [optStep, setOptStep] = useState(0)
  const [routeIds, setRouteIds] = useState<Set<string>>(
    () => new Set(ASSIGN_ROUTES.map((r) => r.id)),
  )
  const [orderIds, setOrderIds] = useState<Set<string>>(
    () => new Set(ASSIGN_ORDERS.map((o) => o.id)),
  )
  const [routeQuery, setRouteQuery] = useState('')
  const [orderQuery, setOrderQuery] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())
  const [showExcluded, setShowExcluded] = useState(false)
  // Master-detail: the selected route opens the lock-stops pane.
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  // Locked stops keyed `${routeId}:${stopId}`, seeded from the data.
  const [lockedStops, setLockedStops] = useState<Set<string>>(
    () =>
      new Set(
        ASSIGN_ROUTES.flatMap((r) =>
          r.stops.filter((s) => s.locked).map((s) => `${r.id}:${s.id}`),
        ),
      ),
  )

  // Thinking beat runs on every open; phase resets in close() so the
  // dialog never paints 'ready' content on a fresh open.
  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => setPhase('ready'), 1100)
    return () => window.clearTimeout(id)
  }, [open])

  // Optimization run: step through phases, then confirm and close.
  const optPhases = [
    'Reading order windows',
    'Matching orders to routes',
    lockedStops.size > 0
      ? `Keeping ${lockedStops.size} locked ${lockedStops.size === 1 ? 'stop' : 'stops'} in place`
      : 'Sequencing stops',
    'Checking drive times',
  ]

  useEffect(() => {
    if (phase !== 'optimizing') return
    if (optStep >= optPhases.length) {
      onToast({
        title: `${orderIds.size} ${orderIds.size === 1 ? 'order' : 'orders'} routed`,
        description: `Assigned across ${routeIds.size} ${routeIds.size === 1 ? 'route' : 'routes'}.`,
        action: {
          label: 'Undo',
          onClick: () =>
            // Undo reverts quietly; resuming the flow is opt-in via the link
            onToast({
              title: 'Run reverted',
              description: 'Orders are back in the queue, unassigned.',
              action: {
                label: 'Open Smart Dispatch',
                onClick: onReopen,
              },
            }),
        },
      })
      close()
      return
    }
    const id = window.setTimeout(() => setOptStep((s) => s + 1), 1150)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, optStep])

  // ESC steps back: pane first, then the dialog.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (selectedRouteId) setSelectedRouteId(null)
      else close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedRouteId])

  // The pane belongs to step 1 only.
  useEffect(() => {
    if (step === 2) setSelectedRouteId(null)
  }, [step])

  const selectedRoute =
    ASSIGN_ROUTES.find((r) => r.id === selectedRouteId) ?? null

  const lockedCountFor = (routeId: string, stops: { id: string }[]) =>
    stops.filter((s) => lockedStops.has(`${routeId}:${s.id}`)).length

  const toggleLock = (routeId: string, stopId: string) =>
    setLockedStops((prev) => {
      const next = new Set(prev)
      const key = `${routeId}:${stopId}`
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  // Route skills are editable in the detail pane, seeded from the data.
  const [routeSkills, setRouteSkills] = useState<Record<string, string[]>>(
    () => Object.fromEntries(ASSIGN_ROUTES.map((r) => [r.id, r.skills])),
  )

  const toggleSkill = (routeId: string, skill: string) =>
    setRouteSkills((prev) => {
      const cur = prev[routeId] ?? []
      return {
        ...prev,
        [routeId]: cur.includes(skill)
          ? cur.filter((s) => s !== skill)
          : [...cur, skill],
      }
    })

  const query = step === 1 ? routeQuery : orderQuery
  const hasQuery = query.trim().length > 0

  // Leaving review mode whenever the context changes keeps the list predictable.
  useEffect(() => {
    setShowExcluded(false)
  }, [step, hasQuery])

  const filteredRoutes = useMemo(() => {
    const q = routeQuery.trim().toLowerCase()
    let rows = ASSIGN_ROUTES
    if (q)
      rows = rows.filter(
        (r) =>
          r.branch.toLowerCase().includes(q) ||
          r.routeName.toLowerCase().includes(q) ||
          r.driver.toLowerCase().includes(q) ||
          r.truck.toLowerCase().includes(q),
      )
    if (showExcluded && step === 1)
      rows = rows.filter((r) => !routeIds.has(r.id))
    return rows
  }, [routeQuery, showExcluded, step, routeIds])

  const filteredOrders = useMemo(() => {
    const q = orderQuery.trim().toLowerCase()
    let rows = ASSIGN_ORDERS
    if (q)
      rows = rows.filter(
        (o) =>
          o.orderNum.toLowerCase().includes(q) ||
          o.pickupCompany.toLowerCase().includes(q) ||
          o.dropoffCompany.toLowerCase().includes(q) ||
          o.window.toLowerCase().includes(q),
      )
    if (showExcluded && step === 2)
      rows = rows.filter((o) => !orderIds.has(o.id))
    return rows
  }, [orderQuery, showExcluded, step, orderIds])

  const routeGroups = useMemo(
    () =>
      BRANCHES.map((branch) => ({
        branch,
        routes: filteredRoutes.filter((r) => r.branch === branch),
        total: ASSIGN_ROUTES.filter((r) => r.branch === branch),
      })).filter((g) => g.routes.length > 0),
    [filteredRoutes],
  )

  const orderGroups = useMemo(
    () =>
      BRANCHES.map((branch) => ({
        branch,
        orders: filteredOrders.filter((o) => o.branch === branch),
        total: ASSIGN_ORDERS.filter((o) => o.branch === branch),
      })).filter((g) => g.orders.length > 0),
    [filteredOrders],
  )

  const toggle = (
    set: React.Dispatch<React.SetStateAction<Set<string>>>,
    id: string,
  ) =>
    set((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const setMany = (
    set: React.Dispatch<React.SetStateAction<Set<string>>>,
    rows: { id: string }[],
    include: boolean,
  ) =>
    set((prev) => {
      const next = new Set(prev)
      rows.forEach((r) => (include ? next.add(r.id) : next.delete(r.id)))
      return next
    })

  const close = () => {
    onClose()
    setStep(1)
    setPhase('thinking')
    setOptStep(0)
    setRouteQuery('')
    setOrderQuery('')
    setExpanded(new Set())
    setShowExcluded(false)
    setSelectedRouteId(null)
  }

  const visible = step === 1 ? filteredRoutes : filteredOrders
  const included = step === 1 ? routeIds : orderIds
  const setIncluded = step === 1 ? setRouteIds : setOrderIds
  const visibleIncluded = visible.filter((v) => included.has(v.id)).length
  const excludedCount =
    step === 1
      ? ASSIGN_ROUTES.length - routeIds.size
      : ASSIGN_ORDERS.length - orderIds.size
  const allRows = step === 1 ? ASSIGN_ROUTES : ASSIGN_ORDERS

  // Search and the excluded-review both force groups open; manual expand
  // state only applies to the default browse view.
  const forceExpand = hasQuery || showExcluded

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center">
          <motion.div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onClick={close}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative flex flex-col rounded-[8px] overflow-hidden"
            style={{
              width: 680,
              height: 'min(620px, 85vh)',
              background: 'var(--color-elevation-surface-overlay)',
              border: '0.5px solid var(--color-border-primary)',
              boxShadow: 'var(--shadow-elevation-overlay)',
            }}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
          >
            {phase === 'thinking' ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <CoreIntelligenceIcon
                  size={28}
                  style={{ color: 'var(--color-icon-primary)' }}
                />
                <LoadingText label="Gathering today's routes and orders" />
              </div>
            ) : phase === 'optimizing' ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                {/* Logo spin is the single animation on this surface;
                    phase labels crossfade, they don't animate ambiently */}
                <CoreIntelligenceIcon
                  size={28}
                  style={{
                    color: 'var(--color-icon-primary)',
                    animation:
                      'ai-hex-spin 2.6s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                    transformOrigin: '50% 50%',
                  }}
                />
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={optStep}
                    className="text-[12px]"
                    style={{ color: 'var(--color-text-secondary)' }}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2, ease: EASE_OUT }}
                  >
                    {optPhases[Math.min(optStep, optPhases.length - 1)]}…
                  </motion.span>
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                className="flex-1 min-h-0 flex flex-col"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
              >
                {/* Heading dock: Curri breadcrumb wizard pattern (UI Library
                    1418-8945) — 12px medium nodes, caret separators, current
                    step underlined, upcoming disabled */}
                <div
                  className="px-4 h-10 flex items-center justify-between shrink-0 mb-3"
                  style={{
                    borderBottom: '0.5px solid var(--color-border-primary)',
                  }}
                >
                  <div className="flex items-center gap-4">
                    <CoreIntelligenceIcon
                      size={16}
                      style={{ color: 'var(--color-icon-primary)' }}
                    />
                    <nav className="flex items-center gap-2">
                      <BreadcrumbNode
                        label="Routes"
                        state={step === 1 ? 'current' : 'done'}
                        onClick={() => step === 2 && setStep(1)}
                      />
                      <CaretRight
                        size={12}
                        style={{ color: 'var(--color-icon-tertiary)' }}
                      />
                      <BreadcrumbNode
                        label="Orders"
                        state={step === 2 ? 'current' : 'upcoming'}
                      />
                    </nav>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={close}
                      className="h-6 w-6 inline-flex items-center justify-center rounded-xs transition-colors duration-150"
                      style={{
                        background: 'var(--color-background-neutral-secondary)',
                        color: 'var(--color-text-secondary)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          'var(--color-background-neutral-secondary-hover)'
                        e.currentTarget.style.color =
                          'var(--color-text-primary)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          'var(--color-background-neutral-secondary)'
                        e.currentTarget.style.color =
                          'var(--color-text-secondary)'
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>

                {/* Search: standalone, the primary instrument.
                    Matches curri TextInput (large): border-input, p-xs,
                    12px text, focus-within pressed bg + focused border */}
                <div className="mx-4 shrink-0">
                  <div
                    className="h-[34px] px-2 flex items-center gap-2 rounded-xs border-[0.5px] border-solid border-border-input bg-background-input transition-colors duration-150 focus-within:bg-background-input-pressed focus-within:border-border-focused"
                  >
                    <MagnifyingGlass
                      size={12}
                      style={{
                        color: 'var(--color-icon-secondary)',
                        flexShrink: 0,
                      }}
                    />
                    <input
                      key={step}
                      autoFocus
                      value={query}
                      onChange={(e) =>
                        step === 1
                          ? setRouteQuery(e.target.value)
                          : setOrderQuery(e.target.value)
                      }
                      placeholder={
                        step === 1
                          ? 'Search branches, routes, drivers, or trucks'
                          : 'Search order numbers, destinations, or windows'
                      }
                      className="flex-1 min-w-0 bg-transparent outline-none text-[12px]"
                      style={{ color: 'var(--color-text-primary)' }}
                    />
                    {hasQuery && (
                      <button
                        onClick={() =>
                          step === 1 ? setRouteQuery('') : setOrderQuery('')
                        }
                        className="h-5 w-5 inline-flex items-center justify-center rounded-xs shrink-0"
                        style={{ color: 'var(--color-icon-tertiary)' }}
                      >
                        <X size={11} />
                      </button>
                    )}
                  </div>
                  <div className="h-8 px-1 flex items-center justify-between">
                    <span
                      className="text-[11px] tabular-nums"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      {showExcluded
                        ? `Reviewing ${visible.length} excluded`
                        : hasQuery
                          ? `${visible.length} match · ${visibleIncluded} included`
                          : `${allRows.length} ${step === 1 ? 'routes' : 'orders'} · ${included.size} included`}
                    </span>
                    <div className="flex items-center gap-3">
                      {!hasQuery && excludedCount > 0 && (
                        <>
                          <TextAction onClick={() => setShowExcluded((v) => !v)}>
                            {showExcluded
                              ? 'Show all'
                              : `Show excluded (${excludedCount})`}
                          </TextAction>
                          <TextAction
                            onClick={() => setMany(setIncluded, allRows, true)}
                          >
                            Reset
                          </TextAction>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Results: master list + slide-in lock-stops pane */}
                <div className="px-4 flex-1 min-h-0 flex gap-2">
                  {/* Static container; only incoming content animates, so the
                      step change reads as a hand-off, not a glitch */}
                  <div
                    className="flex-1 min-w-0 h-full rounded-[8px] overflow-hidden"
                    style={{
                      border: '0.5px solid var(--color-border-primary)',
                      background: 'var(--color-elevation-surface-overlay)',
                    }}
                  >
                    <motion.div
                      key={step}
                      className="h-full overflow-auto"
                      initial={{ opacity: 0, x: step === 2 ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.22, ease: EASE_OUT }}
                    >
                      {visible.length === 0 ? (
                        <div
                          className="h-full flex items-center justify-center text-[12px]"
                          style={{ color: 'var(--color-text-tertiary)' }}
                        >
                          {showExcluded
                            ? 'Nothing excluded'
                            : step === 1
                              ? 'No routes match'
                              : 'No orders match'}
                        </div>
                      ) : step === 1 ? (
                        routeGroups.map((group) => {
                          const isOpen =
                            forceExpand || expanded.has(group.branch)
                          // With a search active the group checkbox acts on
                          // the matches only — search + uncheck = bulk exclude
                          const base = hasQuery ? group.routes : group.total
                          const groupIncluded = base.filter((r) =>
                            routeIds.has(r.id),
                          ).length
                          return (
                            <div key={group.branch}>
                              <GroupHeaderRow
                                branch={group.branch}
                                unit="routes"
                                totalCount={base.length}
                                includedCount={groupIncluded}
                                isOpen={isOpen}
                                onExpand={() =>
                                  !forceExpand && toggle(setExpanded, group.branch)
                                }
                                onToggleInclude={() =>
                                  setMany(
                                    setRouteIds,
                                    base,
                                    groupIncluded < base.length,
                                  )
                                }
                              />
                              {isOpen &&
                                group.routes.map((route) => (
                                  <RouteRowItem
                                    key={route.id}
                                    route={route}
                                    checked={routeIds.has(route.id)}
                                    selected={selectedRouteId === route.id}
                                    lockedCount={lockedCountFor(
                                      route.id,
                                      route.stops,
                                    )}
                                    skills={routeSkills[route.id] ?? []}
                                    onToggle={() =>
                                      toggle(setRouteIds, route.id)
                                    }
                                    onSelect={() =>
                                      setSelectedRouteId((cur) =>
                                        cur === route.id ? null : route.id,
                                      )
                                    }
                                  />
                                ))}
                            </div>
                          )
                        })
                      ) : (
                        orderGroups.map((group) => {
                          const isOpen =
                            forceExpand || expanded.has(group.branch)
                          const base = hasQuery ? group.orders : group.total
                          const groupIncluded = base.filter((o) =>
                            orderIds.has(o.id),
                          ).length
                          return (
                            <div key={group.branch}>
                              <GroupHeaderRow
                                branch={group.branch}
                                unit="orders"
                                totalCount={base.length}
                                includedCount={groupIncluded}
                                isOpen={isOpen}
                                onExpand={() =>
                                  !forceExpand && toggle(setExpanded, group.branch)
                                }
                                onToggleInclude={() =>
                                  setMany(
                                    setOrderIds,
                                    base,
                                    groupIncluded < base.length,
                                  )
                                }
                              />
                              {isOpen &&
                                group.orders.map((order) => (
                                  <OrderRowItem
                                    key={order.id}
                                    order={order}
                                    checked={orderIds.has(order.id)}
                                    onToggle={() =>
                                      toggle(setOrderIds, order.id)
                                    }
                                  />
                                ))}
                            </div>
                          )
                        })
                      )}
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {selectedRoute && step === 1 && (
                      <motion.div
                        key="detail"
                        className="h-full overflow-hidden"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 248, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: EASE_OUT }}
                      >
                        <RouteDetailPane
                          route={selectedRoute}
                          lockedStops={lockedStops}
                          skills={routeSkills[selectedRoute.id] ?? []}
                          onToggleLock={(routeId, stop, position) => {
                            const nowLocked = !lockedStops.has(
                              `${routeId}:${stop.id}`,
                            )
                            toggleLock(routeId, stop.id)
                            onToast(
                              nowLocked
                                ? {
                                    title: 'Stop locked',
                                    description: `${stop.company} stays in position ${position} for this run.`,
                                  }
                                : {
                                    title: 'Stop unlocked',
                                    description: `${stop.company} can be reordered in this run.`,
                                  },
                            )
                          }}
                          onToggleSkill={toggleSkill}
                          onClose={() => setSelectedRouteId(null)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 flex items-center justify-between shrink-0">
                  <span />
                  <div className="flex items-center gap-2">
                    {step === 1 ? (
                      <>
                        <Button variant="secondary" size="large" onClick={close}>
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          size="large"
                          disabled={routeIds.size === 0}
                          onClick={() => setStep(2)}
                        >
                          Confirm routes
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="secondary"
                          size="large"
                          onClick={() => setStep(1)}
                        >
                          Back
                        </Button>
                        <Button
                          variant="brand"
                          size="large"
                          className="gap-1.5"
                          disabled={orderIds.size === 0}
                          onClick={() => setPhase('optimizing')}
                        >
                          Route {orderIds.size}{' '}
                          {orderIds.size === 1 ? 'order' : 'orders'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

/**
 * Breadcrumb wizard node per UI Library 1418-8945: 12px medium label with
 * a 2px gap underline. Current = primary + underline, done = secondary and
 * clickable, upcoming = disabled.
 */
function BreadcrumbNode({
  label,
  state,
  onClick,
}: {
  label: string
  state: 'current' | 'done' | 'upcoming'
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="p-0 border-none bg-transparent flex flex-col items-center gap-[2px]"
      style={{ cursor: state === 'done' ? 'pointer' : 'default' }}
    >
      <span
        className="text-[12px]"
        style={{
          fontWeight: 500,
          lineHeight: '18px',
          color:
            state === 'current'
              ? 'var(--color-text-primary)'
              : state === 'done'
                ? 'var(--color-text-secondary)'
                : 'var(--color-text-disabled)',
          transition: 'color 150ms ease-out',
        }}
      >
        {label}
      </span>
      <span
        className="w-full rounded-full"
        style={{
          height: 1.5,
          background:
            state === 'current' ? 'var(--color-text-primary)' : 'transparent',
          transition: 'background 150ms ease-out',
        }}
      />
    </button>
  )
}

function RouteRowItem({
  route,
  checked,
  selected,
  lockedCount,
  skills,
  onToggle,
  onSelect,
}: {
  route: AssignRoute
  checked: boolean
  selected: boolean
  lockedCount: number
  skills: string[]
  onToggle: () => void
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-2.5 pl-10 pr-3 text-left"
      style={{
        height: 40,
        borderBottom: '0.5px solid var(--color-border-primary)',
        background: selected
          ? 'var(--color-elevation-surface-overlay-pressed)'
          : 'var(--color-elevation-surface-primary)',
        opacity: checked ? 1 : 0.55,
        transition: 'opacity 150ms ease-out, background 150ms ease-out',
      }}
    >
      <span
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
      >
        <CheckBox checked={checked} />
      </span>
      <span
        className="shrink-0 rounded-full"
        style={{ width: 3, height: 20, background: `var(${route.colorBar})` }}
      />
      <span
        className="text-[12px] truncate"
        style={{
          width: 140,
          color: 'var(--color-text-primary)',
          fontWeight: 500,
        }}
      >
        {route.routeName}
      </span>
      <span
        className="text-[12px] truncate flex-1 min-w-0"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {route.driver} · {route.truck}
      </span>
      {/* Run constraints: one fixed rail — glyphs always start flush at the
          same x (lock first), so the column reads straight even when sparse */}
      <span
        className="shrink-0 flex items-center justify-start gap-2"
        style={{ width: 54 }}
      >
        {lockedCount > 0 && (
          <Hint
            content={`${lockedCount} locked ${lockedCount === 1 ? 'stop' : 'stops'} won't be reordered`}
          >
            <span
              className="inline-flex items-center gap-[3px] text-[12px] tabular-nums"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              <LockSimple size={11} />
              {lockedCount}
            </span>
          </Hint>
        )}
        {skills.length > 0 && (
          <Hint content={`Route skills: ${skills.join(', ')}`}>
            <span
              className="inline-flex items-center gap-[3px] text-[12px] tabular-nums"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              <Tag size={11} />
              {skills.length}
            </span>
          </Hint>
        )}
      </span>
      {/* Stops = current load; free time = capacity to absorb more.
          Together they answer the pre-flight question directly. */}
      <span
        className="text-[12px] tabular-nums shrink-0"
        style={{
          width: 56,
          textAlign: 'right',
          color: 'var(--color-text-secondary)',
        }}
      >
        {route.stops.length} stops
      </span>
      <Hint
        content={`${Math.round((route.loadLbs / route.capacityLbs) * 100)}% capacity · ${route.loadLbs.toLocaleString()} of ${route.capacityLbs.toLocaleString()} lbs`}
      >
        <span
          className="shrink-0 inline-flex justify-end"
          style={{ width: 24 }}
        >
          <CapacityRing
            fullness={Math.min(1, route.loadLbs / route.capacityLbs)}
          />
        </span>
      </Hint>
    </button>
  )
}

/** Capacity ring: green arc = vehicle fill (load vs weight capacity). */
function CapacityRing({ fullness }: { fullness: number }) {
  const r = 6.25
  const c = 2 * Math.PI * r
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      style={{ transform: 'rotate(-90deg)' }}
    >
      <circle
        cx={8}
        cy={8}
        r={r}
        fill="none"
        stroke="var(--color-border-primary)"
        strokeWidth={2.5}
      />
      <circle
        cx={8}
        cy={8}
        r={r}
        fill="none"
        stroke="var(--color-background-brand-primary)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray={`${c * fullness} ${c}`}
      />
    </svg>
  )
}


/**
 * Lock-stops detail pane: this run flow is the only place users can lock
 * stops, so editing lives here. Skills stay read-only for now.
 */
function RouteDetailPane({
  route,
  lockedStops,
  skills,
  onToggleLock,
  onToggleSkill,
  onClose,
}: {
  route: AssignRoute
  lockedStops: Set<string>
  skills: string[]
  onToggleLock: (
    routeId: string,
    stop: AssignRoute['stops'][number],
    position: number,
  ) => void
  onToggleSkill: (routeId: string, skill: string) => void
  onClose: () => void
}) {
  return (
    <div
      className="h-full flex flex-col rounded-[8px] overflow-hidden"
      style={{
        width: 248,
        border: '0.5px solid var(--color-border-primary)',
        background: 'var(--color-elevation-surface-overlay)',
      }}
    >
      <div
        className="h-9 px-3 flex items-center gap-2 shrink-0"
        style={{
          // Plain overlay: the band treatment belongs to accordion headers
          borderBottom: '0.5px solid var(--color-border-primary)',
        }}
      >
        <span
          className="shrink-0 rounded-full"
          style={{ width: 3, height: 16, background: `var(${route.colorBar})` }}
        />
        <span
          className="text-[12px] truncate flex-1 min-w-0"
          style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}
        >
          {route.routeName}
        </span>
        <button
          onClick={onClose}
          className="h-5 w-5 inline-flex items-center justify-center rounded-xs shrink-0"
          style={{ color: 'var(--color-icon-tertiary)' }}
        >
          <X size={11} />
        </button>
      </div>
      <div
        className="px-3 py-2 flex items-center justify-between gap-2 shrink-0"
        style={{ borderBottom: '0.5px solid var(--color-border-primary)' }}
      >
        <span
          className="text-[11px] truncate"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          {route.driver} · {route.truck}
        </span>
        <SkillsDropdown
          routeId={route.id}
          skills={skills}
          onToggleSkill={onToggleSkill}
        />
      </div>
      {skills.length > 0 && (
        <div
          className="px-3 py-2 flex flex-wrap gap-1 shrink-0"
          style={{ borderBottom: '0.5px solid var(--color-border-primary)' }}
        >
          {skills.map((s) => (
            <SkillChip
              key={s}
              skill={s}
              onRemove={() => onToggleSkill(route.id, s)}
            />
          ))}
        </div>
      )}
      <div
        className="px-3 pt-2.5 pb-1 shrink-0"
        style={{ background: 'var(--color-elevation-surface-primary)' }}
      >
        <div
          className="text-[11px]"
          style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}
        >
          Lock stops
        </div>
      </div>
      <div
        className="flex-1 min-h-0 overflow-auto px-2 pb-2"
        style={{ background: 'var(--color-elevation-surface-primary)' }}
      >
        {route.stops.map((stop, i) => {
          const locked = lockedStops.has(`${route.id}:${stop.id}`)
          return (
            <button
              key={stop.id}
              onClick={() => onToggleLock(route.id, stop, i + 1)}
              className="w-full flex items-center gap-2 px-1.5 rounded-xs text-left"
              style={{ height: 44, background: 'transparent' }}
            >
              <span
                className="text-[10px] tabular-nums shrink-0"
                style={{ width: 12, color: 'var(--color-text-tertiary)' }}
              >
                {i + 1}
              </span>
              <span
                className="shrink-0 flex items-center justify-center"
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  background: 'var(--color-icon-primary)',
                }}
              >
                {stop.kind === 'pickup' ? (
                  <span
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: '3.5px solid transparent',
                      borderRight: '3.5px solid transparent',
                      borderBottom: '6px solid var(--color-icon-inverse)',
                    }}
                  />
                ) : (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      background: 'var(--color-icon-inverse)',
                      borderRadius: 1,
                    }}
                  />
                )}
              </span>
              <span className="flex-1 min-w-0">
                <span
                  className="block text-[11px] truncate"
                  style={{
                    color: 'var(--color-text-primary)',
                    fontWeight: 500,
                    lineHeight: '15px',
                  }}
                >
                  {stop.company}
                </span>
                <span
                  className="block text-[11px] truncate"
                  style={{
                    color: 'var(--color-text-tertiary)',
                    lineHeight: '15px',
                  }}
                >
                  {stop.address}
                </span>
              </span>
              <LockToggle locked={locked} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Branch accordion header, shared by the routes and orders steps. */
function GroupHeaderRow({
  branch,
  unit,
  totalCount,
  includedCount,
  isOpen,
  onExpand,
  onToggleInclude,
}: {
  branch: string
  unit: string
  totalCount: number
  includedCount: number
  isOpen: boolean
  onExpand: () => void
  onToggleInclude: () => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onExpand}
      className="w-full h-9 px-3 flex items-center gap-2 cursor-pointer select-none bg-elevation-surface-overlay hover:bg-elevation-surface-overlay-hover transition-colors duration-150"
      style={{ borderBottom: '0.5px solid var(--color-border-primary)' }}
    >
      <CaretRight
        size={10}
        weight="bold"
        style={{
          color: 'var(--color-icon-tertiary)',
          transform: isOpen ? 'rotate(90deg)' : 'none',
          transition: 'transform 150ms ease-out',
        }}
      />
      <span
        onClick={(e) => {
          e.stopPropagation()
          onToggleInclude()
        }}
      >
        <CheckBox
          checked={includedCount > 0}
          indeterminate={includedCount > 0 && includedCount < totalCount}
        />
      </span>
      <span
        className="text-[12px]"
        style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}
      >
        {branch}
      </span>
      <span
        className="flex-1 text-[11px] tabular-nums"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        {totalCount} {unit}
      </span>
      {includedCount > 0 && includedCount < totalCount && (
        <span
          className="text-[11px] tabular-nums"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          {includedCount} of {totalCount}
        </span>
      )}
    </div>
  )
}

/**
 * Lock toggle: secondary button treatment — transparent at rest,
 * neutral-secondary-hover fill on hover. Hover previews the action:
 * the icon switches to the state you'd get by clicking. The icon is
 * stationary; only the glyph crossfades.
 */
function LockToggle({ locked }: { locked: boolean }) {
  const [hovered, setHovered] = useState(false)
  const showLocked = hovered ? !locked : locked
  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative h-6 w-6 inline-flex items-center justify-center rounded-xs shrink-0 border-[0.5px] border-solid transition-colors duration-150 ${
        hovered
          ? 'bg-background-neutral-secondary-hover border-border-bold text-icon-primary'
          : locked
            ? 'bg-background-neutral-secondary border-border-bold text-icon-primary'
            : 'bg-background-neutral-secondary border-border-primary text-icon-tertiary'
      }`}
    >
      {/* Both glyphs stacked in place; opacity-only crossfade, no movement */}
      <motion.span
        className="absolute inset-0 inline-flex items-center justify-center"
        animate={{ opacity: showLocked ? 1 : 0 }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
      >
        <LockSimple size={11} weight="fill" />
      </motion.span>
      <motion.span
        className="absolute inset-0 inline-flex items-center justify-center"
        animate={{ opacity: showLocked ? 0 : 1 }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
      >
        <LockSimpleOpen size={11} />
      </motion.span>
    </span>
  )
}

/**
 * Tag chip per the UI Library Tag editor (3171-20853): neutral-secondary bg
 * (transparent), hairline border, rounded-xs, px-8/py-4, 8px indicator dot,
 * 10px medium uppercase w/ tracking-m. Optional X for quick removal.
 */
function SkillChip({
  skill,
  onRemove,
}: {
  skill: string
  onRemove?: () => void
}) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-xs border-[0.5px] border-solid border-border-primary bg-background-neutral-secondary"
      style={{ padding: '4px 8px' }}
    >
      <span
        className="shrink-0 rounded-full"
        style={{
          width: 8,
          height: 8,
          background: `var(${SKILL_DOTS[skill] ?? '--color-border-bold'})`,
        }}
      />
      <span
        className="text-[10px] whitespace-nowrap"
        style={{
          color: 'var(--color-text-primary)',
          fontWeight: 500,
          letterSpacing: 'var(--tracking-m)',
          textTransform: 'uppercase',
          lineHeight: '14px',
        }}
      >
        {skill}
      </span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="inline-flex items-center justify-center shrink-0 -mr-0.5 transition-colors duration-150"
          style={{ color: 'var(--color-icon-tertiary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-icon-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-icon-tertiary)'
          }}
        >
          <X size={9} weight="bold" />
        </button>
      )}
    </span>
  )
}

/**
 * Skills dropdown per UI Library v1.3 Tag editor (node 3171-22538):
 * overlay menu, search row, menu label, tag list items with check on selected.
 */
function SkillsDropdown({
  routeId,
  skills,
  onToggleSkill,
}: {
  routeId: string
  skills: string[]
  onToggleSkill: (routeId: string, skill: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [filter, setFilter] = useState('')

  const options = SKILLS.filter((s) =>
    s.toLowerCase().includes(filter.trim().toLowerCase()),
  )

  return (
    <span className="relative shrink-0">
      <button
        onClick={() => {
          setMenuOpen((v) => !v)
          setFilter('')
        }}
        className={`h-6 inline-flex items-center gap-1 px-2 rounded-xs border-[0.5px] border-solid text-[11px] transition-colors duration-150 ${
          menuOpen
            ? 'bg-background-neutral-secondary border-border-bold'
            : 'border-border-primary hover:bg-background-neutral-secondary hover:border-border-bold'
        }`}
        style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}
      >
        <Plus size={10} weight="bold" />
        Add skill
      </button>
      {menuOpen && (
        <>
          <span
            className="fixed inset-0 z-[1190]"
            onClick={() => setMenuOpen(false)}
          />
          <span
            className="absolute right-0 top-7 z-[1200] flex flex-col rounded-[8px] overflow-hidden"
            style={{
              width: 232,
              background: 'var(--color-elevation-surface-overlay)',
              boxShadow: 'var(--shadow-elevation-overlay)',
              border: '0.5px solid var(--color-border-primary)',
            }}
          >
            <span
              className="h-8 px-2 flex items-center gap-2"
              style={{
                borderBottom: '0.5px solid var(--color-border-primary)',
              }}
            >
              <MagnifyingGlass
                size={11}
                style={{ color: 'var(--color-icon-tertiary)', flexShrink: 0 }}
              />
              <input
                autoFocus
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Enter skill…"
                className="flex-1 min-w-0 bg-transparent outline-none text-[12px]"
                style={{ color: 'var(--color-text-primary)' }}
              />
            </span>
            <span
              className="px-3 pt-1.5 pb-1 text-[9px]"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Select route skills
            </span>
            <span className="flex flex-col px-2 pb-2">
              {options.length === 0 ? (
                <span
                  className="px-2 py-1.5 text-[11px]"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  No skills match
                </span>
              ) : (
                options.map((skill) => {
                  const selected = skills.includes(skill)
                  return (
                    <button
                      key={skill}
                      onClick={() => onToggleSkill(routeId, skill)}
                      className="flex items-center justify-between px-2 py-1 rounded-xs transition-colors duration-150 hover:bg-elevation-surface-overlay-hover"
                    >
                      <SkillChip skill={skill} />
                      {selected && (
                        <Check
                          size={12}
                          weight="bold"
                          style={{ color: 'var(--color-icon-primary)' }}
                        />
                      )}
                    </button>
                  )
                })
              )}
            </span>
          </span>
        </>
      )}
    </span>
  )
}

function OrderRowItem({
  order,
  checked,
  onToggle,
}: {
  order: AssignOrder
  checked: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-2.5 pl-10 pr-3 text-left"
      style={{
        height: 40,
        borderBottom: '0.5px solid var(--color-border-primary)',
        // Data rows match the accordion child-row surface
        background: 'var(--color-elevation-surface-primary)',
        opacity: checked ? 1 : 0.55,
        transition: 'opacity 150ms ease-out',
      }}
    >
      <CheckBox checked={checked} />
      {/* Customer hierarchy: order number first, destination second, drop-off window third */}
      <span
        className="text-[12px] tabular-nums shrink-0"
        style={{
          width: 110,
          color: 'var(--color-text-primary)',
          fontWeight: 500,
        }}
      >
        {order.orderNum}
      </span>
      <span
        className="text-[12px] truncate flex-1 min-w-0"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {order.dropoffCompany}
      </span>
      <span
        className="text-[11px] tabular-nums shrink-0"
        style={{
          width: 150,
          textAlign: 'right',
          color: 'var(--color-text-tertiary)',
        }}
      >
        {order.window}
      </span>
    </button>
  )
}

function CheckBox({
  checked,
  indeterminate,
}: {
  checked: boolean
  indeterminate?: boolean
}) {
  const filled = checked || indeterminate
  return (
    <span
      className="shrink-0 inline-flex items-center justify-center rounded-xs transition-colors duration-150 ease-out"
      style={{
        width: 16,
        height: 16,
        border: filled
          ? '2px solid var(--color-background-brand-primary)'
          : '2px solid var(--color-border-input)',
        background: filled
          ? 'var(--color-background-brand-primary)'
          : 'var(--color-background-input)',
      }}
    >
      {indeterminate ? (
        <Minus size={11} weight="bold" color="#fff" />
      ) : checked ? (
        <Check size={11} weight="bold" color="#fff" />
      ) : null}
    </span>
  )
}

function TextAction({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="text-[11px] transition-colors duration-150"
      style={{
        color: disabled
          ? 'var(--color-text-disabled)'
          : 'var(--color-text-secondary)',
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: 'none',
        border: 'none',
        padding: 0,
      }}
      onMouseEnter={(e) => {
        if (!disabled)
          (e.currentTarget as HTMLButtonElement).style.color =
            'var(--color-text-primary)'
      }}
      onMouseLeave={(e) => {
        if (!disabled)
          (e.currentTarget as HTMLButtonElement).style.color =
            'var(--color-text-secondary)'
      }}
    >
      {children}
    </button>
  )
}
