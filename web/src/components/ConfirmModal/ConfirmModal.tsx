import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

type ConfirmModalProps = {
  open: boolean
  title: string
  body?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  tone?: 'danger' | 'primary'
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmModal = ({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  tone = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  // Hold references for focus trapping and restoration.
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  // When opened: trap focus inside the dialog, inert siblings, support ESC, and restore focus on close.
  useEffect(() => {
    if (!open) return

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null

    const dialogEl = dialogRef.current
    if (!dialogEl) return

    // Inert background siblings so they cannot be focused when the modal is open.
    const parent = dialogEl.parentElement
    const toggledSiblings: Array<{
      el: HTMLElement & { inert?: boolean }
      hadAriaHidden: boolean
      hadInertAttr: boolean
      inertSupported: boolean
    }> = []
    if (parent) {
      Array.from(parent.children).forEach((child) => {
        if (child === dialogEl) return
        const el = child as HTMLElement & { inert?: boolean }
        const hadAriaHidden = el.hasAttribute('aria-hidden')
        const hadInertAttr = el.hasAttribute('inert')
        const inertSupported = typeof el.inert === 'boolean'

        if (!hadAriaHidden) {
          el.setAttribute('aria-hidden', 'true')
        }
        if (inertSupported) {
          el.inert = true
        } else if (!hadInertAttr) {
          el.setAttribute('inert', '')
        }

        toggledSiblings.push({
          el,
          hadAriaHidden,
          hadInertAttr,
          inertSupported,
        })
      })
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) {
        event.preventDefault()
        onCancel()
      }

      if (event.key !== 'Tab') return

      const focusable = Array.from(
        dialogEl.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute('disabled'))

      if (focusable.length === 0) {
        event.preventDefault()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      }
    }

    const handleFocusIn = (event: FocusEvent) => {
      if (!dialogEl.contains(event.target as Node)) {
        event.preventDefault()
        if (confirmButtonRef.current) {
          confirmButtonRef.current.focus()
        } else {
          dialogEl.focus()
        }
      }
    }

    dialogEl.addEventListener('keydown', handleKeyDown)
    document.addEventListener('focusin', handleFocusIn)

    return () => {
      dialogEl.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('focusin', handleFocusIn)
      if (toggledSiblings.length) {
        toggledSiblings.forEach(
          ({ el, hadAriaHidden, hadInertAttr, inertSupported }) => {
            if (!hadAriaHidden) {
              el.removeAttribute('aria-hidden')
            }
            if (inertSupported) {
              el.inert = false
            } else if (!hadInertAttr) {
              el.removeAttribute('inert')
            }
          }
        )
      }

      if (previouslyFocusedRef.current) {
        previouslyFocusedRef.current.focus()
      }
    }
  }, [open, loading, onCancel])

  // Default focus to the confirm button when safe to do so.
  useEffect(() => {
    if (open && confirmButtonRef.current && !loading) {
      confirmButtonRef.current.focus()
    }
  }, [open, loading])

  // Reuse DaisyUI button styles with a danger/primary tone toggle.
  const confirmClasses = `btn ${tone === 'danger' ? 'btn-error' : 'btn-primary'}`

  if (!open) return null

  return (
    <dialog
      ref={dialogRef}
      className="modal modal-open"
      aria-modal="true"
      role="alertdialog"
      tabIndex={-1}
    >
      <div className="modal-box space-y-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        {body && <div className="text-sm text-base-content/80">{body}</div>}
        <div className="modal-action">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`${confirmClasses} gap-2`}
            ref={confirmButtonRef}
            onClick={() => {
              if (!loading) onConfirm()
            }}
            disabled={loading}
          >
            {loading && (
              <span
                className="loading loading-spinner loading-sm"
                aria-hidden
              />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button
          type="button"
          aria-label="Close"
          onClick={!loading ? onCancel : undefined}
        />
      </form>
    </dialog>
  )
}

export type { ConfirmModalProps }
export default ConfirmModal
