import React, { useEffect, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import PlotlyFigure from '@/components/ui/PlotlyFigure'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, AlertTriangle, Shield, Users, Calendar } from 'lucide-react'
import { analyticsService } from '@/services/analyticsService'
import { workbookService } from '@/services/workbookService'
import { mapsService } from '@/services/mapsService'

// All charts now bind to backend figures from the uploaded workbook (no mocks)

export function Dashboard() {
  // Fetch available sheets to auto-detect names (case-insensitive)
  const { data: sheetsPayload } = useQuery({
    queryKey: ['workbook-sheets'],
    queryFn: async () => (await workbookService.getSheets()).data,
    retry: false,
  })

  // moved below combinedMapHTML query to avoid use-before-declare

  const sheetNames = useMemo(() => {
    const names = sheetsPayload?.sheets?.map(s => s.name) || []
    const lower = names.map(n => n.toLowerCase())
    const findBy = (candidates: string[]) => {
      // 1) Try exact match
      for (const cand of candidates) {
        const idx = lower.findIndex(n => n === cand)
        if (idx !== -1) return names[idx]
      }
      // 2) Try substring match (includes)
      for (const cand of candidates) {
        const idx = lower.findIndex(n => n.includes(cand))
        if (idx !== -1) return names[idx]
      }
      return undefined
    }
    return {
      incident: findBy(['incident', 'incidents']),
      hazard: findBy(['hazard id', 'hazard_id', 'hazard', 'hazards']),
      audit: findBy(['audit', 'audits']),
      inspection: findBy(['inspection', 'inspections']),
    }
  }, [sheetsPayload])

  const missingSheets = useMemo(() => {
    const missing: string[] = []
    if (!sheetNames.incident) missing.push('Incident')
    if (!sheetNames.hazard) missing.push('Hazard')
    if (!sheetNames.audit) missing.push('Audit')
    if (!sheetNames.inspection) missing.push('Inspection')
    return missing
  }, [sheetNames])

  const { data: executiveData, isLoading } = useQuery({
    queryKey: ['executive-overview', sheetNames],
    // Only run when all sheet names are detected
    enabled: !!(sheetNames.incident && sheetNames.hazard && sheetNames.audit && sheetNames.inspection),
    queryFn: () => analyticsService.getExecutiveOverview({
      incident_sheet: sheetNames.incident,
      hazard_sheet: sheetNames.hazard,
      audit_sheet: sheetNames.audit,
      inspection_sheet: sheetNames.inspection,
    }),
    retry: 1,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    select: (response) => (response?.data as any)?.figure || null
  })

  // Backend figures for dashboard tiles (original data)
  const { data: timeTrendsFigure } = useQuery({
    queryKey: ['analytics-time-trends', sheetNames.incident],
    enabled: !!sheetNames.incident,
    queryFn: () => analyticsService.getTimeTrends({ sheet: sheetNames.incident }),
    select: (res) => (res?.data as any)?.figure || null,
  })

  const { data: deptSpiderFigure } = useQuery({
    queryKey: ['analytics-dept-spider', sheetNames.incident],
    enabled: !!sheetNames.incident,
    queryFn: () => analyticsService.getDepartmentSpider({ sheet: sheetNames.incident }),
    select: (res) => (res?.data as any)?.figure || null,
  })

  const { data: psmBreakdownFigure } = useQuery({
    queryKey: ['analytics-psm-breakdown', sheetNames.incident],
    enabled: !!sheetNames.incident,
    queryFn: () => analyticsService.getPSMBreakdown({ sheet: sheetNames.incident }),
    select: (res) => (res?.data as any)?.figure || null,
  })

  const { data: costImpactFigure } = useQuery({
    queryKey: ['analytics-cost-impact', sheetNames.incident],
    enabled: !!sheetNames.incident,
    queryFn: () => analyticsService.getCostImpact({ sheet: sheetNames.incident }),
    select: (res) => (res?.data as any)?.figure || null,
  })

  // Combined Hazards & Incidents Map (Folium HTML)
  const { data: combinedMapHTML } = useQuery({
    queryKey: ['maps-combined', sheetNames.incident, sheetNames.hazard],
    enabled: !!(sheetNames.incident && sheetNames.hazard),
    queryFn: async () => (await mapsService.getCombinedMap({
      incident_sheet: sheetNames.incident,
      hazard_sheet: sheetNames.hazard,
      window_days: 30,
    })).data,
    select: (res: any) => res?.html || '',
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 0,
  })

  // Keep last good HTML to avoid flicker if a transient empty response arrives
  const lastGoodMapHTML = useRef<string>('')
  useEffect(() => {
    if (combinedMapHTML && combinedMapHTML.length > 200) {
      lastGoodMapHTML.current = combinedMapHTML
    }
  }, [combinedMapHTML])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-8 w-[60px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-[140px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const executiveFigure = executiveData as any

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Safety Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your organization's safety performance and risk metrics
        </p>
      </div>

      {/* Executive Overview from backend (Plotly) */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Unified HSE Scorecard</CardTitle>
          <CardDescription>Live from backend</CardDescription>
        </CardHeader>
        <CardContent>
          <PlotlyFigure figure={executiveFigure} height={280} loading={isLoading} />
        </CardContent>
      </Card>

      {/* Combined Hazards & Incidents Map */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Combined Hazards & Incidents Map</CardTitle>
          <CardDescription>Overlay of hazards and incidents on facility layout</CardDescription>
        </CardHeader>
        <CardContent>
          {(combinedMapHTML || lastGoodMapHTML.current) ? (
            <iframe
              title="Combined Map"
              className="w-full h-[420px] rounded-md border"
              srcDoc={combinedMapHTML || lastGoodMapHTML.current}
            />
          ) : (
            <div className="h-[420px] flex items-center justify-center text-sm text-muted-foreground border rounded-md">
              {sheetNames.incident && sheetNames.hazard ? 'Loading map…' : 'Upload workbook or ensure Incident & Hazard sheets detected'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Grid (all backend figures) */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Incident Trends (Original) */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Incident Trends</CardTitle>
            <CardDescription>
              Monthly incident count over time (from workbook)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PlotlyFigure figure={timeTrendsFigure as any} height={220} />
          </CardContent>
        </Card>

        {/* Department Performance (Original) */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
            <CardDescription>
              Incidents and near misses by department (from workbook)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PlotlyFigure figure={deptSpiderFigure as any} height={220} />
          </CardContent>
        </Card>

        {/* Risk Categories (Original) */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Risk Categories</CardTitle>
            <CardDescription>
              Distribution of risk types (from workbook)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PlotlyFigure figure={psmBreakdownFigure as any} height={220} />
          </CardContent>
        </Card>

        {/* Safety / Cost Impact (Original) */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Cost Impact</CardTitle>
            <CardDescription>
              Cost prediction and impact (from workbook)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PlotlyFigure figure={costImpactFigure as any} height={220} />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and navigation shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center p-4 rounded-lg border bg-accent/50">
              <Calendar className="h-8 w-8 text-primary mr-3" />
              <div>
                <h3 className="font-medium">Schedule Audit</h3>
                <p className="text-sm text-muted-foreground">Plan safety inspections</p>
              </div>
            </div>
            <div className="flex items-center p-4 rounded-lg border bg-accent/50">
              <AlertTriangle className="h-8 w-8 text-secondary mr-3" />
              <div>
                <h3 className="font-medium">Report Incident</h3>
                <p className="text-sm text-muted-foreground">Document safety events</p>
              </div>
            </div>
            <div className="flex items-center p-4 rounded-lg border bg-accent/50">
              <Users className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <h3 className="font-medium">Training Portal</h3>
                <p className="text-sm text-muted-foreground">Manage safety training</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}