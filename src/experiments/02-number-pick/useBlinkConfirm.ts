import { useRef, useCallback } from 'react'
import { useBlinkEvents } from '@/hooks/useBlinkEvents'

interface BlinkConfirmOptions {
  onConfirm: () => void
}

export function useBlinkConfirm({ onConfirm }: BlinkConfirmOptions) {
  const onConfirmRef = useRef(onConfirm)
  onConfirmRef.current = onConfirm

  const handleDoubleBlink = useCallback(() => {
    onConfirmRef.current()
  }, [])

  useBlinkEvents({ onDoubleBlink: handleDoubleBlink })
}
