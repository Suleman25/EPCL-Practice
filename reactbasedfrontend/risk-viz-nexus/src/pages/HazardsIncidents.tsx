import React, { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, FunnelChart, Funnel, Cell } from 'recharts'
import { Network, TrendingDown, Shield, Activity, AlertTriangle, Target } from 'lucide-react'
import { hazardIncidentService } from '@/services/hazardIncidentService'
import { workbookService } from '@/services/workbookService'
import PlotlyFigure from '@/components/ui/PlotlyFigure'

// Mock data for demonstration
const mockLinksData = {
  nodes: [
    { id: 'h1', name: 'Chemical Exposure', type: 'hazard' as const, category: 'Chemical' },
    { id: 'h2', name: 'Slip Risk', type: 'hazard' as const, category: 'Physical' },
    { id: 'i1', name: 'Minor Burn', type: 'incident' as const, category: 'Chemical' },
    { id: 'i2', name: 'Fall Injury', type: 'incident' as const, category: 'Physical' },
  ],
  links: [
    { source: 'h1', target: 'i1', strength: 0.8 },
    { source: 'h2', target: 'i2', strength: 0.6 },
  ]
}

const mockFunnelData = {
  stages: [
    { name: 'Hazards Identified', count: 450, conversion_rate: 100 },
    { name: 'Near Misses', count: 186, conversion_rate: 41.3 },
    { name: 'Minor Incidents', count: 42, conversion_rate: 9.3 },
    { name: 'Major Incidents', count: 8, conversion_rate: 1.8 },
    { name: 'Serious Injuries', count: 2, conversion_rate: 0.4 },
  ]
}

const mockTimeLagData = {
  intervals: [
    { range: '0-1 days', frequency: 145, percentage: 42.1 },
    { range: '1-7 days', frequency: 98, percentage: 28.4 },
    { range: '1-4 weeks', frequency: 67, percentage: 19.4 },
    { range: '1-3 months', frequency: 25, percentage: 7.2 },
    { range: '3+ months', frequency: 10, percentage: 2.9 },
  ]
}

const mockPreventionData = {
  total_preventions: 1247,
  success_rate: 87.3,
  cost_savings: 680000,
  time_saved: 1450,
  categories: [
    { name: 'Training', count: 456, effectiveness: 92 },
    { name: 'Equipment', count: 342, effectiveness: 85 },
    { name: 'Procedures', count: 289, effectiveness: 88 },
    { name: 'Environment', count: 160, effectiveness: 79 },
  ]
}

export function HazardsIncidents() {
  const [activeTab, setActiveTab] = useState('links')

  // Get available sheets to auto-detect names
  const { data: sheetsPayload } = useQuery({
    queryKey: ['workbook-sheets'],
    queryFn: async () => (await workbookService.getSheets()).data,
    retry: false,
  })

  const sheetNames = useMemo(() => {
    const names = sheetsPayload?.sheets?.map(s => s.name) || []
    const lower = names.map(n => n.toLowerCase())
    const findBy = (candidates: string[]) => {
      // exact match first
      for (const cand of candidates) {
        const idx = lower.findIndex(n => n === cand)
        if (idx !== -1) return names[idx]
      }
      // then substring
      for (const cand of candidates) {
        const idx = lower.findIndex(n => n.includes(cand))
        if (idx !== -1) return names[idx]
      }
      return undefined
    }
    return {
      incident: findBy(['incident', 'incidents']),
      hazard: findBy(['hazard', 'hazards'])
    }
  }, [sheetsPayload])

  const { data: linksData, isLoading: linksLoading } = useQuery({
    queryKey: ['hazard-incident-links', sheetNames],
    queryFn: () => hazardIncidentService.getLinks({
      incident_sheet: sheetNames.incident,
      hazard_sheet: sheetNames.hazard,
    }),
    retry: false,
    enabled: !!(sheetNames.incident && sheetNames.hazard),
    select: (response) => {
      const d: any = response?.data
      // Backend may return FigureResponse/RowsResponse; fallback to mock
      if (!d || d?.figure || d?.rows) return mockLinksData
      if (Array.isArray(d?.nodes) && Array.isArray(d?.links)) return d
      return mockLinksData
    }
  })

  // Backend figures
  const { data: riskNetworkFig, isLoading: riskLoading } = useQuery({
    queryKey: ['hazard-incident-risk-network', sheetNames],
    queryFn: () => hazardIncidentService.getRiskNetwork({
      incident_sheet: sheetNames.incident,
      hazard_sheet: sheetNames.hazard,
    }),
    retry: false,
    enabled: !!(sheetNames.incident && sheetNames.hazard),
    select: (response) => (response?.data as any)?.figure || null,
  })

  const { data: funnelFigure, isLoading: funnelLoading } = useQuery({
    queryKey: ['hazard-incident-funnel', sheetNames],
    queryFn: () => hazardIncidentService.getConversionFunnel({
      incident_sheet: sheetNames.incident,
      hazard_sheet: sheetNames.hazard,
    }),
    retry: false,
    enabled: !!(sheetNames.incident && sheetNames.hazard),
    select: (response) => (response?.data as any)?.figure || null,
  })

  const { data: timeLagFigure, isLoading: timeLagLoading } = useQuery({
    queryKey: ['hazard-incident-timelag', sheetNames],
    queryFn: () => hazardIncidentService.getTimeLag({
      incident_sheet: sheetNames.incident,
      hazard_sheet: sheetNames.hazard,
    }),
    retry: false,
    enabled: !!(sheetNames.incident && sheetNames.hazard),
    select: (response) => (response?.data as any)?.figure || null,
  })

  const { data: preventionFigure, isLoading: preventionLoading } = useQuery({
    queryKey: ['hazard-incident-prevention', sheetNames],
    queryFn: () => hazardIncidentService.getPrevention({
      incident_sheet: sheetNames.incident,
      hazard_sheet: sheetNames.hazard,
    }),
    retry: false,
    enabled: !!(sheetNames.incident && sheetNames.hazard),
    select: (response) => (response?.data as any)?.figure || null,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Hazards & Incidents Analysis</h1>
        <p className="text-muted-foreground">
          Analyze relationships between hazards and incidents to improve prevention
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="links">Network Analysis</TabsTrigger>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="timelag">Time Analysis</TabsTrigger>
          <TabsTrigger value="prevention">Prevention Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="links" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Network Visualization */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Hazard-Incident Network
                </CardTitle>
                <CardDescription>
                  Relationship mapping between hazards and resulting incidents
                </CardDescription>
              </CardHeader>
              <CardContent>
                {riskLoading ? (
                  <Skeleton className="h-[400px] w-full" />
                ) : riskNetworkFig ? (
                  <PlotlyFigure figure={riskNetworkFig as any} height={420} />
                ) : (
                  <div className="text-sm text-muted-foreground">Network figure not available.</div>
                )}
              </CardContent>
            </Card>

            {/* Network Stats removed for now; backend provides figure only */}
          </div>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Funnel Chart */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Hazard to Incident Conversion Funnel
                </CardTitle>
                <CardDescription>
                  Track how hazards progress through severity levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                {funnelLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : funnelFigure ? (
                  <PlotlyFigure figure={funnelFigure as any} height={340} />
                ) : (
                  <div className="text-sm text-muted-foreground">Funnel figure not available.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timelag" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Time Lag Analysis
              </CardTitle>
              <CardDescription>
                Time intervals between hazard identification and incident occurrence
              </CardDescription>
            </CardHeader>
            <CardContent>
              {timeLagLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : timeLagFigure ? (
                <PlotlyFigure figure={timeLagFigure as any} height={340} />
              ) : (
                <div className="text-sm text-muted-foreground">Time-lag figure not available.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prevention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prevention Effectiveness</CardTitle>
              <CardDescription>
                Backend se aane wali original figure (no mock).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {preventionLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : preventionFigure ? (
                <PlotlyFigure figure={preventionFigure as any} height={340} />
              ) : (
                <div className="text-sm text-muted-foreground">Figure not available.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}