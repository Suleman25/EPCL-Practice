import { create } from 'zustand'

interface Sheet {
  id: string
  name: string
  rowCount: number
  columnCount: number
}

interface WorkbookData {
  headers: string[]
  rows: any[][]
}

interface WorkbookState {
  sheets: Sheet[]
  currentSheet: Sheet | null
  data: WorkbookData | null
  isLoading: boolean
  error: string | null
  setSheets: (sheets: Sheet[]) => void
  setCurrentSheet: (sheet: Sheet) => void
  setData: (data: WorkbookData) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useWorkbookStore = create<WorkbookState>((set) => ({
  sheets: [],
  currentSheet: null,
  data: null,
  isLoading: false,
  error: null,
  setSheets: (sheets) => set({ sheets }),
  setCurrentSheet: (sheet) => set({ currentSheet: sheet }),
  setData: (data) => set({ data }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () => set({
    sheets: [],
    currentSheet: null,
    data: null,
    isLoading: false,
    error: null
  })
}))