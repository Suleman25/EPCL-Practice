import api from './api'

export interface AgentResponse {
  answer: string
}

export interface AgentTranslateResponse { code: string }
export interface AgentExecuteResponse { data: any; meta: Record<string, any> }
export interface AgentExplainResponse { explanation: string; highlights?: string[] }
export interface AgentPlotCodeResponse { code: string }

export const agentService = {
  // Ask AI Agent
  ask: (params: { question: string }) => 
    api.post<AgentResponse>('/agent/ask', params),

  // Translate NL -> Pandas code
  translate: (params: { question: string; sheet?: string }) =>
    api.post<AgentTranslateResponse>('/agent/translate', params),

  // Execute code against sheet
  execute: (params: { code: string; sheet?: string; question?: string }) =>
    api.post<AgentExecuteResponse>('/agent/execute', params),

  // Explain results
  explain: (params: { question: string; data: any; meta?: Record<string, any> }) =>
    api.post<AgentExplainResponse>('/agent/explain', params),

  // Generate plotting code from results
  plotCode: (params: { question?: string; data: any; library?: 'plotly' | 'matplotlib' }) =>
    api.post<AgentPlotCodeResponse>('/agent/plot-code', params),
}