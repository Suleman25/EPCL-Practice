import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  ScatterChart, 
  Scatter, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar
} from 'recharts'
import { Calendar, TrendingUp, Shield, AlertTriangle, Download, Filter } from 'lucide-react'

// Mock data for different analytics views
const hsePerformanceData = {
  current_index: 87,
  target_index: 90,
  categories: [
    { name: 'Training Compliance', score: 92, max_score: 100 },
    { name: 'Incident Rate', score: 85, max_score: 100 },
    { name: 'Audit Results', score: 88, max_score: 100 },
    { name: 'Risk Mitigation', score: 83, max_score: 100 },
  ]
}

const timeTrendsData = [
  { month: 'Jan', incidents: 12, near_misses: 45, safety_score: 82 },
  { month: 'Feb', incidents: 8, near_misses: 52, safety_score: 85 },
  { month: 'Mar', incidents: 15, near_misses: 38, safety_score: 78 },
  { month: 'Apr', incidents: 7, near_misses: 41, safety_score: 88 },
  { month: 'May', incidents: 10, near_misses: 36, safety_score: 91 },
  { month: 'Jun', incidents: 6, near_misses: 42, safety_score: 89 },
]

const consequenceMatrixData = [
  { likelihood: 1, consequence: 1, risk_score: 1, label: 'Minor Equipment', category: 'Low' },
  { likelihood: 2, consequence: 1, risk_score: 2, label: 'Training Gap', category: 'Low' },
  { likelihood: 3, consequence: 2, risk_score: 6, label: 'Chemical Exposure', category: 'Medium' },
  { likelihood: 4, consequence: 3, risk_score: 12, label: 'Fall Risk', category: 'High' },
  { likelihood: 5, consequence: 4, risk_score: 20, label: 'Process Safety', category: 'Critical' },
  { likelihood: 2, consequence: 4, risk_score: 8, label: 'Emergency Response', category: 'High' },
]

const departmentSpiderData = [
  { subject: 'Training', production: 85, maintenance: 92, warehouse: 78, quality: 95 },
  { subject: 'Incidents', production: 70, maintenance: 85, warehouse: 88, quality: 92 },
  { subject: 'Compliance', production: 88, maintenance: 82, warehouse: 85, quality: 90 },
  { subject: 'Risk Management', production: 75, maintenance: 88, warehouse: 80, quality: 88 },
  { subject: 'Culture', production: 82, maintenance: 85, warehouse: 90, quality: 85 },
]

const costImpactData = [
  { category: 'Medical Costs', amount: 125000, prevented: 85000 },
  { category: 'Lost Time', amount: 95000, prevented: 120000 },
  { category: 'Equipment Damage', amount: 45000, prevented: 65000 },
  { category: 'Regulatory Fines', amount: 15000, prevented: 35000 },
  { category: 'Training Costs', amount: 85000, prevented: 25000 },
]

export function Analytics() {
  const [activeTab, setActiveTab] = useState('hse-performance')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Safety Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive safety performance analysis and insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="hse-performance">HSE Index</TabsTrigger>
          <TabsTrigger value="time-trends">Trends</TabsTrigger>
          <TabsTrigger value="consequence-matrix">Risk Matrix</TabsTrigger>
          <TabsTrigger value="department-spider">Departments</TabsTrigger>
          <TabsTrigger value="cost-impact">Cost Impact</TabsTrigger>
          <TabsTrigger value="audit-tracker">Audits</TabsTrigger>
          <TabsTrigger value="location-treemap">Locations</TabsTrigger>
          <TabsTrigger value="psm-breakdown">PSM</TabsTrigger>
        </TabsList>

        {/* HSE Performance Index */}
        <TabsContent value="hse-performance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  HSE Performance Index
                </CardTitle>
                <CardDescription>
                  Overall health, safety, and environmental performance score
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold">{hsePerformanceData.current_index}/100</span>
                    <Badge variant={hsePerformanceData.current_index >= hsePerformanceData.target_index ? "default" : "secondary"}>
                      Target: {hsePerformanceData.target_index}
                    </Badge>
                  </div>
                  <Progress value={hsePerformanceData.current_index} className="h-3" />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    +5 points from last quarter
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Performance Categories</CardTitle>
                <CardDescription>
                  Breakdown by safety categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hsePerformanceData.categories.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{category.name}</span>
                        <span className="text-muted-foreground">
                          {category.score}/{category.max_score}
                        </span>
                      </div>
                      <Progress value={(category.score / category.max_score) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Time Trends */}
        <TabsContent value="time-trends" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Safety Performance Trends</CardTitle>
              <CardDescription>
                Track incidents, near misses, and safety scores over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  incidents: { label: 'Incidents', color: 'var(--chart-2)' },
                  near_misses: { label: 'Near Misses', color: 'var(--chart-1)' },
                  safety_score: { label: 'Safety Score', color: 'var(--chart-3)' },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeTrendsData}>
                    <XAxis 
                      dataKey="month" 
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      yAxisId="left"
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      domain={[70, 100]}
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip />
                    <Bar 
                      yAxisId="left"
                      dataKey="incidents" 
                      fill="var(--chart-2)" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      yAxisId="left"
                      dataKey="near_misses" 
                      fill="var(--chart-1)" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="safety_score"
                      strokeWidth={3}
                      stroke="var(--chart-3)"
                      dot={{ fill: 'var(--chart-3)', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consequence Matrix */}
        <TabsContent value="consequence-matrix" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Risk Consequence Matrix</CardTitle>
              <CardDescription>
                Likelihood vs. consequence risk assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  risk: { label: 'Risk Score', color: 'var(--chart-2)' },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={consequenceMatrixData}>
                    <XAxis 
                      dataKey="likelihood" 
                      domain={[0, 6]}
                      name="Likelihood"
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      dataKey="consequence"
                      domain={[0, 5]}
                      name="Consequence"
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-md">
                              <p className="font-medium">{data.label}</p>
                              <p className="text-sm text-muted-foreground">
                                Risk Score: {data.risk_score}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Category: {data.category}
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Scatter 
                      dataKey="risk_score" 
                      fill="var(--chart-2)"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Department Spider */}
        <TabsContent value="department-spider" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Department Performance Radar</CardTitle>
              <CardDescription>
                Multi-dimensional safety performance by department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  production: { label: 'Production', color: 'var(--chart-1)' },
                  maintenance: { label: 'Maintenance', color: 'var(--chart-2)' },
                  warehouse: { label: 'Warehouse', color: 'var(--chart-3)' },
                  quality: { label: 'Quality', color: 'var(--chart-4)' },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={departmentSpiderData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]}
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                    />
                    <Radar
                      name="Production"
                      dataKey="production"
                      stroke="var(--chart-1)"
                      fill="var(--chart-1)"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Maintenance"
                      dataKey="maintenance"
                      stroke="var(--chart-2)"
                      fill="var(--chart-2)"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Warehouse"
                      dataKey="warehouse"
                      stroke="var(--chart-3)"
                      fill="var(--chart-3)"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Quality"
                      dataKey="quality"
                      stroke="var(--chart-4)"
                      fill="var(--chart-4)"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                    <ChartTooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cost Impact */}
        <TabsContent value="cost-impact" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Cost Impact Analysis</CardTitle>
              <CardDescription>
                Financial impact of safety incidents vs. prevention savings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  amount: { label: 'Actual Costs', color: 'var(--chart-2)' },
                  prevented: { label: 'Prevented Costs', color: 'var(--chart-3)' },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costImpactData} layout="horizontal">
                    <XAxis 
                      type="number"
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    />
                    <YAxis 
                      type="category"
                      dataKey="category" 
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={120}
                    />
                    <ChartTooltip 
                      formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                    />
                    <Bar 
                      dataKey="amount" 
                      fill="var(--chart-2)" 
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar 
                      dataKey="prevented" 
                      fill="var(--chart-3)" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would continue here... */}
        <TabsContent value="audit-tracker">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Audit & Inspection Tracker</CardTitle>
              <CardDescription>Coming Soon</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Audit tracking functionality will be available soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location-treemap">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Location Treemap</CardTitle>
              <CardDescription>Coming Soon</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Location treemap visualization will be available soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="psm-breakdown">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>PSM Breakdown</CardTitle>
              <CardDescription>Coming Soon</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Process Safety Management breakdown will be available soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
