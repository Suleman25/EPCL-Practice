import React, { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import PlotlyFigure from '@/components/ui/PlotlyFigure'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, Building, Layers, Maximize, Filter } from 'lucide-react'
import { mapsService } from '@/services/mapsService'
import { workbookService } from '@/services/workbookService'

// Mock data for demonstration
const mockCombinedData = {
  facility_layout: {
    bounds: [[-90, -180], [90, 180]] as [[number, number], [number, number]],
    image_url: '/placeholder-facility.png'
  },
  hazard_points: [
    { id: 'h1', lat: 40.7128, lng: -74.0060, type: 'Chemical', severity: 'high' as const, description: 'Chemical storage area', date: '2024-01-15' },
    { id: 'h2', lat: 40.7130, lng: -74.0058, type: 'Physical', severity: 'medium' as const, description: 'Slip hazard zone', date: '2024-01-16' },
  ],
  incident_points: [
    { id: 'i1', lat: 40.7129, lng: -74.0059, type: 'Chemical', severity: 'low' as const, description: 'Minor spill', date: '2024-01-20', cost: 1500 },
  ]
}

const mockFacilityData = {
  layout: {
    image_url: '/placeholder-facility.png',
    bounds: [[-90, -180], [90, 180]] as [[number, number], [number, number]],
    scale: 1.0
  },
  zones: [
    { id: 'z1', name: 'Production Area', coordinates: [[40.712, -74.006], [40.713, -74.005]], type: 'production', risk_level: 3 },
    { id: 'z2', name: 'Storage Area', coordinates: [[40.714, -74.007], [40.715, -74.006]], type: 'storage', risk_level: 4 },
  ],
  equipment: [
    { id: 'e1', name: 'Reactor A', position: [40.7125, -74.0055], type: 'reactor', status: 'operational' as const },
    { id: 'e2', name: 'Pump B', position: [40.7135, -74.0065], type: 'pump', status: 'maintenance' as const },
  ]
}

const mockFacility3DData = {
  model: {
    url: '/placeholder-3d-model.glb',
    scale: 1.0,
    position: [0, 0, 0] as [number, number, number]
  },
  hotspots: [
    { id: 'h1', name: 'Safety Station', position: [5, 2, 10], type: 'safety', data: { incidents: 0, last_check: '2024-01-20' } },
    { id: 'h2', name: 'Emergency Exit', position: [-5, 0, 8], type: 'emergency', data: { accessible: true, last_test: '2024-01-15' } },
  ],
  annotations: [
    { id: 'a1', text: 'High Risk Zone', position: [0, 3, 5], color: '#ff4444' },
    { id: 'a2', text: 'Safe Area', position: [10, 1, -5], color: '#44ff44' },
  ]
}

export function Maps() {
  const [activeTab, setActiveTab] = useState('combined')

  // Detect sheet names (handles 'Hazard ID', etc.)
  const { data: sheetsPayload } = useQuery({
    queryKey: ['workbook-sheets'],
    queryFn: async () => (await workbookService.getSheets()).data,
    retry: false,
  })

  const sheetNames = useMemo(() => {
    const names = sheetsPayload?.sheets?.map(s => s.name) || []
    const lower = names.map(n => n.toLowerCase())
    const findBy = (cands: string[]) => {
      for (const c of cands) {
        const i = lower.findIndex(n => n === c)
        if (i !== -1) return names[i]
      }
      for (const c of cands) {
        const i = lower.findIndex(n => n.includes(c))
        if (i !== -1) return names[i]
      }
      return undefined
    }
    return {
      incident: findBy(['incident','incidents']),
      hazard: findBy(['hazard','hazards'])
    }
  }, [sheetsPayload])

  const { data: combinedData, isLoading: combinedLoading } = useQuery({
    queryKey: ['maps-combined', sheetNames],
    enabled: !!(sheetNames.incident && sheetNames.hazard),
    queryFn: () => mapsService.getCombinedMap({
      incident_sheet: sheetNames.incident,
      hazard_sheet: sheetNames.hazard,
    }),
    retry: false,
    select: (response) => (response?.data as any)
  })

  const { data: facilityData, isLoading: facilityLoading } = useQuery({
    queryKey: ['maps-facility', sheetNames],
    enabled: !!(sheetNames.incident && sheetNames.hazard),
    queryFn: () => mapsService.getFacilityLayout({
      incident_sheet: sheetNames.incident,
      hazard_sheet: sheetNames.hazard,
    }),
    retry: false,
    select: (response) => (response?.data as any)?.figure || null
  })

  const { data: facility3DData, isLoading: facility3DLoading } = useQuery({
    queryKey: ['maps-facility-3d', sheetNames.incident],
    enabled: !!sheetNames.incident,
    queryFn: () => mapsService.getFacility3D({ sheet: sheetNames.incident, event_type: 'Incidents' }),
    retry: false,
    select: (response) => (response?.data as any)?.figure || null
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'default'
      default: return 'default'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Interactive Maps</h1>
        <p className="text-muted-foreground">
          Visualize safety data on facility layouts and interactive maps
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="combined">Combined View</TabsTrigger>
          <TabsTrigger value="facility">Facility Layout</TabsTrigger>
          <TabsTrigger value="3d">3D Facility</TabsTrigger>
        </TabsList>

        <TabsContent value="combined" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-4">
            {/* Map */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Combined Hazards & Incidents Map
                    </CardTitle>
                    <CardDescription>
                      Overlay of hazards and incidents on facility layout
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                    <Button variant="outline" size="sm">
                      <Maximize className="h-4 w-4 mr-2" />
                      Fullscreen
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {combinedLoading ? (
                  <Skeleton className="h-[500px] w-full" />
                ) : (
                  <div className="h-[500px] border rounded-lg bg-muted/20 overflow-hidden">
                    {combinedData?.html ? (
                      <iframe
                        title="combined-map"
                        srcDoc={combinedData.html}
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">No map</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Legend & Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Map Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Hazards</h4>
                  <div className="space-y-2">
                    {combinedData?.hazard_points?.map((hazard) => (
                      <div key={hazard.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-orange-500" />
                          <span>{hazard.type}</span>
                        </div>
                        <Badge variant={getSeverityColor(hazard.severity)}>
                          {hazard.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Incidents</h4>
                  <div className="space-y-2">
                    {combinedData?.incident_points?.map((incident) => (
                      <div key={incident.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <span>{incident.type}</span>
                        </div>
                        <Badge variant={getSeverityColor(incident.severity)}>
                          ${incident.cost}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="facility" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-4">
            {/* Facility Layout */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Facility Layout
                    </CardTitle>
                    <CardDescription>
                      Interactive 2D facility floorplan with zones and equipment
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Layers className="h-4 w-4 mr-2" />
                      Layers
                    </Button>
                    <Button variant="outline" size="sm">
                      <Maximize className="h-4 w-4 mr-2" />
                      Fullscreen
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {facilityLoading ? (
                  <Skeleton className="h-[500px] w-full" />
                ) : (
                  <div className="h-[500px] border rounded-lg bg-muted/20">
                    <PlotlyFigure figure={facilityData as any} height={500} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Zones & Equipment */}
            <Card>
              <CardHeader>
                <CardTitle>Facility Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Zones</h4>
                  <div className="space-y-2">
                    {facilityData?.zones?.map((zone) => (
                      <div key={zone.id} className="flex items-center justify-between text-sm">
                        <span>{zone.name}</span>
                        <Badge variant={zone.risk_level > 3 ? 'destructive' : 'secondary'}>
                          Risk {zone.risk_level}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Equipment</h4>
                  <div className="space-y-2">
                    {facilityData?.equipment?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span>{item.name}</span>
                        <Badge variant={
                          item.status === 'operational' ? 'default' : 
                          item.status === 'maintenance' ? 'secondary' : 'destructive'
                        }>
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="3d" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-4">
            {/* 3D Viewer */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="h-5 w-5" />
                      3D Facility View
                    </CardTitle>
                    <CardDescription>
                      Interactive 3D model with safety hotspots
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Reset View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Maximize className="h-4 w-4 mr-2" />
                      Fullscreen
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {facility3DLoading ? (
                  <Skeleton className="h-[500px] w-full" />
                ) : (
                  <div className="h-[500px] border rounded-lg bg-muted/20">
                    <PlotlyFigure figure={facility3DData as any} height={500} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 3D Controls */}
            <Card>
              <CardHeader>
                <CardTitle>3D Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Hotspots</h4>
                  <div className="space-y-2">
                    {facility3DData?.hotspots?.map((hotspot) => (
                      <div key={hotspot.id} className="p-2 rounded border text-sm">
                        <div className="font-medium">{hotspot.name}</div>
                        <div className="text-muted-foreground">{hotspot.type}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">View Options</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      Top View
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      Side View
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      Walkthrough
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}