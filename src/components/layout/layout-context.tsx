"use client"

import React, { createContext, useContext, useState, useCallback, memo } from "react"

interface LayoutContextType {
  isLayoutMounted: boolean
  setLayoutMounted: (value: boolean) => void
}

const LayoutContext = createContext<LayoutContextType | null>(null)

export function useLayoutContext() {
  return useContext(LayoutContext)
}

export const LayoutProvider = memo(function LayoutProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLayoutMounted, setIsLayoutMounted] = useState(false)

  const setLayoutMounted = useCallback((value: boolean) => {
    setIsLayoutMounted(value)
  }, [])

  return (
    <LayoutContext.Provider value={{ isLayoutMounted, setLayoutMounted }}>
      {children}
    </LayoutContext.Provider>
  )
})
