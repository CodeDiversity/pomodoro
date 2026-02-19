import { useEffect, useCallback } from 'react'

interface UseKeyboardShortcutsOptions {
  onToggle: () => void
  onPreventDefault?: () => void
  enabled?: boolean
}

export function useKeyboardShortcuts({
  onToggle,
  onPreventDefault,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't handle shortcuts when user is typing in input fields
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      // Space key: toggle Start/Pause/Resume
      if (event.key === ' ' && enabled) {
        event.preventDefault()
        onToggle()
        return
      }

      // Enter key: prevent form submit (for future note field)
      if (event.key === 'Enter') {
        event.preventDefault()
        onPreventDefault?.()
        return
      }

      // Cmd/Ctrl+K: focus search box (placeholder for Phase 3 - History)
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        // Future: focus search box in history view
        // For now, just prevent the browser default
        return
      }
    },
    [onToggle, onPreventDefault, enabled]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
}
