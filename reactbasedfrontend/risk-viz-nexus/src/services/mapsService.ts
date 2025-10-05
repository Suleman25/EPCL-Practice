import api from './api'

export type PlotlyFigure = {
  data?: any[]
  layout?: any
  frames?: any[]
}

export interface FigureResponse {
  figure: PlotlyFigure
}

export interface HTMLContent {
  html: string
}

export const mapsService = {
  getCombinedMap: (filters?: any) =>
    api.post<HTMLContent>('/maps/combined', filters || {}),

  getFacilityLayout: (filters?: any) =>
    api.post<FigureResponse>('/maps/facility-layout', filters || {}),

  getFacility3D: (filters?: any) =>
    api.post<FigureResponse>('/maps/facility-3d', filters || {}),
}