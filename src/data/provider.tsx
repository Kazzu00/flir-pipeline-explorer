import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useQuery } from '@tanstack/react-query'
import type { DataAdapter } from './adapters/types'
import { MockDataAdapter } from './adapters/MockDataAdapter'
import { CompositeDataAdapter } from './adapters/CompositeDataAdapter'
import { RealLeakageAdapter } from './adapters/RealLeakageAdapter'
export const DataModeContext = createContext<{
  mode: 'demo' | 'real'
  setMode: (mode: 'demo' | 'real') => void
}>({ mode: 'demo', setMode: () => {} })
export function RuntimeDataProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<'demo' | 'real'>(
    import.meta.env.VITE_DATA_MODE === 'real' ? 'real' : 'demo',
  )
  const adapter = useMemo(
    () =>
      mode === 'real'
        ? new CompositeDataAdapter(
            new RealLeakageAdapter(
              import.meta.env.VITE_LEAKAGE_SNAPSHOT_URL ||
                '/runtime/leakage-snapshot.json',
            ),
          )
        : new MockDataAdapter(),
    [mode],
  )
  return (
    <DataModeContext.Provider value={{ mode, setMode }}>
      <DataAdapterContext.Provider value={adapter}>
        {children}
      </DataAdapterContext.Provider>
    </DataModeContext.Provider>
  )
}
export function DataModeSwitch() {
  const { mode, setMode } = useContext(DataModeContext)
  return (
    <label className="select-field">
      <span>Data mode</span>
      <select
        aria-label="Data mode"
        value={mode}
        onChange={(e) => setMode(e.target.value === 'real' ? 'real' : 'demo')}
      >
        <option value="demo">DEMO</option>
        <option value="real">REAL / MIXED</option>
      </select>
    </label>
  )
}
export const DataAdapterContext = createContext<DataAdapter>(
  new MockDataAdapter(),
)
export function useSnapshot() {
  const adapter = useContext(DataAdapterContext)
  return useQuery({
    queryKey: ['snapshot', adapter.id],
    queryFn: ({ signal }) => adapter.getSnapshot(signal),
    staleTime: Infinity,
  })
}
