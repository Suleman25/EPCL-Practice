import api from './api'

export type PlotlyFigure = {
  data?: any[]
  layout?: any
  frames?: any[]
}

export interface FigureResponse {
  figure: PlotlyFigure
}

export interface ExecFigureResponse extends FigureResponse {
  warnings?: string[]
}

export const analyticsService = {
  healthCheck: () => api.get('/health'),

  getHSEPerformance: (filters?: any) =>
    api.post<FigureResponse>('/analytics/hse/performance-index', filters || {}),

  getRiskCalendar: (filters?: any) =>
    api.post<FigureResponse>('/analytics/risk/calendar-heatmap', filters || {}),

  getConsequenceMatrix: (filters?: any) =>
    api.post<FigureResponse>('/analytics/consequence/matrix', filters || {}),

  getExecutiveOverview: (filters?: any) =>
    api.post<ExecFigureResponse>('/analytics/executive/overview', filters || {}),

  getTimeTrends: (filters?: any) =>
    api.post<FigureResponse>('/analytics/time/trends', filters || {}),

  getAuditTracker: (filters?: any) =>
    api.post<FigureResponse>('/analytics/audit-inspection/tracker', filters || {}),

  getDepartmentSpider: (filters?: any) =>
    api.post<FigureResponse>('/analytics/department/spider', filters || {}),

  getLocationTreemap: (filters?: any) =>
    api.post<FigureResponse>('/analytics/location/treemap', filters || {}),

  getPSMBreakdown: (filters?: any) =>
    api.post<FigureResponse>('/analytics/psm-breakdown', filters || {}),

  getCostImpact: (filters?: any) =>
    api.post<FigureResponse>('/analytics/cost-impact', filters || {}),
}