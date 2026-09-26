import { createContext, useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { DataAdapter } from './adapters/types'
import { MockDataAdapter } from './adapters/MockDataAdapter'
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
