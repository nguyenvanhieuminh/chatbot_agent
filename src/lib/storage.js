import { useCallback, useEffect, useState } from 'react'

const PREFIX = 'pathvn.'

export function readStore(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeStore(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* het quota hoac private mode - bo qua, app van chay */
  }
}

export function removeStore(key) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    /* ignore */
  }
}

/** State dong bo voi localStorage. */
export function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => readStore(key, initialValue))

  useEffect(() => {
    writeStore(key, value)
  }, [key, value])

  const reset = useCallback(() => setValue(initialValue), [initialValue])

  return [value, setValue, reset]
}
