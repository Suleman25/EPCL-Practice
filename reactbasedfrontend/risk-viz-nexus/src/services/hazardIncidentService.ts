import api from './api'

export interface HazardIncidentLinksData {
  nodes: Array<{
    id: string
    name: string
    type: 'hazard' | 'incident'
    category: string
  }>
  links: Array<{
    source: string
    target: string
    strength: number
  }>
}

export interface ConversionFunnelData {
  stages: Array<{
    name: string
    count: number
    conversion_rate: number
  }>
}

export interface TimeLagData {
  intervals: Array<{
    range: string
    frequency: number
    percentage: number
  }>
}

export interface SankeyData {
  nodes: Array<{
    id: string
    name: string
    category: string
  }>
  flows: Array<{
    source: string
    target: string
    value: number
  }>
}

export interface DeptMatrixData {
  departments: string[]
  matrix: number[][]
  labels: Array<{
    dept: string
    hazards: number
    incidents: number
  }>
}

export interface RiskNetworkData {
  nodes: Array<{
    id: string
    name: string
    risk_level: number
    category: string
    size: number
  }>
  edges: Array<{
    source: string
    target: string
    weight: number
    type: string
  }>
}

export interface PreventionMetricsData {
  total_preventions: number
  success_rate: number
  cost_savings: number
  time_saved: number
  categories: Array<{
    name: string
    count: number
    effectiveness: number
  }>
}

export interface PreventionGaugeData {
  current_score: number
  target_score: number
  improvement_areas: Array<{
    area: string
    score: number
    weight: number
  }>
}

export const hazardIncidentService = {
  // Hazard-Incident Links
  getLinks: (filters?: any) => 
    api.post('/hazard-incident/links', filters || {}),

  // Conversion Funnel
  getConversionFunnel: (filters?: any) => 
    api.post('/hazard-incident/conversion-funnel', filters || {}),

  // Time Lag Analysis
  getTimeLag: (filters?: any) => 
    api.post('/hazard-incident/time-lag', filters || {}),

  // Sankey Diagram
  getSankey: (filters?: any) => 
    api.post('/hazard-incident/sankey', filters || {}),

  // Department Matrix
  getDeptMatrix: (filters?: any) => 
    api.post('/hazard-incident/dept-matrix', filters || {}),

  // Risk Network
  getRiskNetwork: (filters?: any) => 
    api.post('/hazard-incident/risk-network', filters || {}),

  // Prevention Metrics
  getPrevention: (filters?: any) => 
    api.post('/hazard-incident/prevention', filters || {}),

  // Prevention Gauge
  getPreventionGauge: (filters?: any) => 
    api.post('/hazard-incident/prevention-gauge', filters || {})
}