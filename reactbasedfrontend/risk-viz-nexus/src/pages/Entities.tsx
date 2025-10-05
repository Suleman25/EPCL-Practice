import React, { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { workbookService } from '@/services/workbookService'

function useEntitySheetNames() {
  return useQuery({
    queryKey: ['workbook-sheets'],
    queryFn: async () => (await workbookService.getSheets()).data,
    select: (d) => {
      const names = d?.sheets?.map((s) => s.name) || []
      const lower = names.map((n) => n.toLowerCase())
      const findBy = (candidates: string[]) => {
        for (const cand of candidates) {
          const idx = lower.findIndex((n) => n === cand)
          if (idx !== -1) return names[idx]
        }
        for (const cand of candidates) {
          const idx = lower.findIndex((n) => n.includes(cand))
          if (idx !== -1) return names[idx]
        }
        return undefined
      }
      return {
        incidents: findBy(['incidents', 'incident']),
        hazards: findBy(['hazards', 'hazard']),
        audits: findBy(['audits', 'audit']),
        inspections: findBy(['inspections', 'inspection'])
      }
    },
  })
}

function EntityTable({ sheetName, title }: { sheetName?: string; title: string }) {
  const [rowLimit, setRowLimit] = useState<number>(200)
  const { data, isLoading } = useQuery({
    queryKey: ['entities', sheetName, rowLimit],
    queryFn: () => workbookService.getSheet({ sheetId: sheetName, limit: rowLimit }),
    enabled: !!sheetName,
    select: (res) => res.data,
  })

  const csvBlob = useMemo(() => {
    if (!data?.rows || data.rows.length === 0) return null
    const cols = data.columns?.map((c) => c.name) || Object.keys(data.rows[0] || {})
    const escape = (v: any) => {
      const s = (v ?? '').toString().replace(/"/g, '""')
      return `"${s}"`
    }
    const header = cols.map(escape).join(',')
    const lines = data.rows.map((r) => cols.map((c) => escape(r[c])).join(','))
    const csv = [header, ...lines].join('\n')
    return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  }, [data])

  const handleExport = () => {
    if (!csvBlob || !sheetName) return
    const url = URL.createObjectURL(csvBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${sheetName}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {sheetName ? (
            <div className="flex items-center gap-3">
              <span>Sheet: {sheetName}</span>
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Rows:</label>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={rowLimit}
                  onChange={(e) => setRowLimit(parseInt(e.target.value || '200', 10))}
                >
                  {[100, 200, 500, 1000, 2000, 5000, 10000].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <Button variant="outline" size="sm" onClick={handleExport} disabled={!csvBlob}>
                  Export CSV
                </Button>
              </div>
            </div>
          ) : (
            <span>Sheet not found. Rename your sheet to include the entity name.</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : data ? (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Showing {data.rows.length} of {data.total_rows} rows
            </div>
            <div className="border rounded-lg overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {data.columns.map((c) => (
                      <TableHead key={c.name} className="min-w-[140px]">
                        <div>
                          <div className="font-medium">{c.name}</div>
                          <div className="text-xs text-muted-foreground">{c.type}</div>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.rows.map((row, idx) => (
                    <TableRow key={idx}>
                      {data.columns.map((c) => (
                        <TableCell key={c.name} className="max-w-[240px] truncate">
                          {row[c.name]?.toString() || '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No data.</div>
        )}
      </CardContent>
    </Card>
  )
}

export function Entities() {
  const { data: sheets } = useEntitySheetNames()
  const [tab, setTab] = useState('incidents')

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Entities (Original Data)</h1>
        <p className="text-muted-foreground">Neeche har entity ka raw/original data directly workbook se.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="hazards">Hazards</TabsTrigger>
          <TabsTrigger value="audits">Audits</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
        </TabsList>

        <TabsContent value="incidents">
          <EntityTable sheetName={sheets?.incidents} title="Incidents" />
        </TabsContent>
        <TabsContent value="hazards">
          <EntityTable sheetName={sheets?.hazards} title="Hazards" />
        </TabsContent>
        <TabsContent value="audits">
          <EntityTable sheetName={sheets?.audits} title="Audits" />
        </TabsContent>
        <TabsContent value="inspections">
          <EntityTable sheetName={sheets?.inspections} title="Inspections" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
