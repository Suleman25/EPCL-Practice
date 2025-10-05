import api from './api'

export interface WorkbookSheet {
  id: string
  name: string
  row_count: number
  column_count: number
  last_modified: string
}

export interface SheetData {
  name: string
  columns: Array<{
    name: string
    type: string
    sample_values: any[]
  }>
  rows: Array<Record<string, any>>
  total_rows: number
  pagination: {
    page: number
    per_page: number
    total_pages: number
  }
}

export interface WorkbookSchema {
  sheet: string
  schema: Record<string, any>
}

export const workbookService = {
  // Health check
  healthCheck: () => api.get('/health'),

  // Upload workbook (.xlsx)
  upload: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/workbook/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // Get sheets list
  getSheets: () =>
    api.get<{ sheets: WorkbookSheet[] }>('/workbook/sheets'),
  
  // Get sheet data
  getSheet: (params: {
    sheetId?: string
    limit?: number
    per_page?: number
  }) => {
    // Map per_page -> limit for compatibility
    const { per_page, ...rest } = params || {}
    const limit = rest.limit ?? per_page
    return api.get<SheetData>('/workbook/sheet', { params: { ...rest, ...(limit ? { limit } : {}) } })
  },

  // Get workbook schema
  getSchema: (name?: string) => 
    api.get<WorkbookSchema>('/workbook/schema', { params: { name } }),

  // Apply filters
  applyFilter: (filters: {
    sheet?: string
    sheet_id?: string
    date_range?: { start: string, end: string }
    statuses?: string[]
    departments?: string[]
    locations?: string[]
    categories?: string[]
    limit?: number
  }) => {
    const body: any = {
      sheet: filters.sheet || filters.sheet_id,
      statuses: filters.statuses,
      departments: filters.departments,
      locations: filters.locations,
      categories: filters.categories,
      limit: filters.limit,
    }
    if (filters.date_range?.start && filters.date_range?.end) {
      body.date_range = [filters.date_range.start, filters.date_range.end]
    }
    return api.post('/workbook/filter', body)
  },

  // Load example data
  loadExample: (example_type?: string) => 
    api.post('/workbook/load-example', { example_type }),

  // Reset workbook
  reset: () => 
    api.post('/workbook/reset', {})
}