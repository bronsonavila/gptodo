import { useState, useEffect } from 'react'

/**
 * Hook to check if the current browser/device supports the capture attribute for file inputs.
 * This is supported only on mobile browsers:
 * - Chrome Android
 * - Firefox for Android
 * - Opera Android
 * - Safari on iOS
 * - Samsung Internet
 * - WebView Android
 * - WebView on iOS
 */
export const useCaptureSupport = () => {
  const [supportsCaptureAttribute, setSupportsCaptureAttribute] = useState(false)
  const [isCaptureCheckComplete, setIsCaptureCheckComplete] = useState(false)

  useEffect(() => {
    const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

    if (!isMobileDevice) {
      setSupportsCaptureAttribute(false)
      setIsCaptureCheckComplete(true)

      return
    }

    const input = document.createElement('input')

    input.type = 'file'

    try {
      input.capture = 'environment'

      setSupportsCaptureAttribute('capture' in HTMLInputElement.prototype || input.capture === 'environment')
    } catch (error) {
      setSupportsCaptureAttribute(false)
    } finally {
      setIsCaptureCheckComplete(true)
    }
  }, [])

  return { supportsCaptureAttribute, isCaptureCheckComplete }
}
