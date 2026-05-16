import { createContext, useContext, type ReactNode } from 'react'
import { useHabitStore } from '../hooks/useHabitStore'

type HabitStoreValue = ReturnType<typeof useHabitStore>

const HabitStoreContext = createContext<HabitStoreValue | null>(null)

export function HabitStoreProvider({ children }: { children: ReactNode }) {
  const value = useHabitStore()
  return <HabitStoreContext.Provider value={value}>{children}</HabitStoreContext.Provider>
}

export function useHabits() {
  const ctx = useContext(HabitStoreContext)
  if (!ctx) throw new Error('useHabits must be used within HabitStoreProvider')
  return ctx
}
