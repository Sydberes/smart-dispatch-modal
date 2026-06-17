import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from '@phosphor-icons/react'
import { AutoAssignDialog } from './components/AutoAssignDialog'
import { Button } from './components/Button'
import { CoreIntelligenceIcon } from './components/CoreIntelligenceIcon'

type Toast = {
  id: number
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

/**
 * Demo harness for the Smart Dispatch modal.
 *
 * The dialog is the deliverable — everything here (launch button, dark-mode
 * toggle, toast host) is scaffolding so a dev can run it in isolation. In the
 * product the dialog is mounted by the order queue rail and `onToast` is wired
 * to the app's real Toaster.
 */
export default function App() {
  const [open, setOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      dark ? 'dark' : 'light',
    )
  }, [dark])

  const pushToast = (t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { ...t, id }])
    window.setTimeout(
      () => setToasts((prev) => prev.filter((x) => x.id !== id)),
      6000,
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <div className="flex flex-col items-center gap-1.5 text-center">
        <CoreIntelligenceIcon
          size={28}
          style={{ color: 'var(--color-icon-primary)' }}
        />
        <h1 className="text-[18px] font-semibold text-text-primary mt-2">
          Smart Dispatch
        </h1>
        <p className="text-[13px] text-text-tertiary max-w-[360px] text-pretty">
          Standalone demo of the auto-routing dialog. Open it to walk the route
          selection, lock-stops pane, order step, and optimization run.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button size="large" onClick={() => setOpen(true)}>
          Run Smart Dispatch
        </Button>
        <Button
          variant="secondary"
          size="large"
          onClick={() => setDark((d) => !d)}
        >
          {dark ? 'Light mode' : 'Dark mode'}
        </Button>
      </div>

      <AutoAssignDialog
        open={open}
        onClose={() => setOpen(false)}
        onToast={pushToast}
        onReopen={() => setOpen(true)}
      />

      {/* Minimal toast host — stand-in for the product Toaster. */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1300] flex flex-col gap-2 items-center">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex items-center gap-3 min-w-[300px] max-w-[420px] px-3.5 py-3 rounded-xs"
              style={{
                background: 'var(--color-elevation-surface-overlay)',
                border: '0.5px solid var(--color-border-primary)',
                boxShadow: 'var(--shadow-elevation-overlay)',
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-text-primary">
                  {t.title}
                </div>
                {t.description && (
                  <div className="text-[12px] text-text-tertiary mt-0.5">
                    {t.description}
                  </div>
                )}
              </div>
              {t.action && (
                <button
                  onClick={() => {
                    t.action!.onClick()
                    setToasts((prev) => prev.filter((x) => x.id !== t.id))
                  }}
                  className="shrink-0 text-[12px] font-medium text-text-primary px-2 py-1 rounded-xs hover:bg-background-neutral-secondary-hover"
                >
                  {t.action.label}
                </button>
              )}
              <button
                onClick={() =>
                  setToasts((prev) => prev.filter((x) => x.id !== t.id))
                }
                className="shrink-0 text-text-tertiary hover:text-text-primary"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
