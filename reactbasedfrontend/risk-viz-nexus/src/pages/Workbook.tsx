import React, { useState, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FileSpreadsheet, Download } from 'lucide-react'
import { workbookService } from '@/services/workbookService'
import { useWorkbookStore } from '@/store/workbookStore'
import { Input } from '@/components/ui/input'
import { toast } from 'react-hot-toast'
 

export function Workbook() {
  const { currentSheet, setCurrentSheet } = useWorkbookStore()
  const qc = useQueryClient()
  const [file, setFile] = useState<File | null>(null)
  const [rowLimit, setRowLimit] = useState<number>(100)

  // Queries
  const { data: sheets, isLoading: sheetsLoading } = useQuery({
    queryKey: ['workbook-sheets'],
    queryFn: () => workbookService.getSheets(),
    select: (response) => response.data?.sheets || []
  })

  const { data: sheetData, isLoading: sheetDataLoading } = useQuery({
    queryKey: ['sheet-data', currentSheet?.id],
    queryFn: () => workbookService.getSheet({ sheetId: currentSheet?.id || undefined, limit: rowLimit }),
    enabled: !!currentSheet?.id,
    select: (response) => response.data
  })

  const { data: schema } = useQuery({
    queryKey: ['workbook-schema'],
    queryFn: () => workbookService.getSchema(currentSheet?.id),
    select: (response) => response.data
  })

  const uploadMutation = useMutation({
    mutationFn: (f: File) => workbookService.upload(f),
    onSuccess: async () => {
      toast.success('Workbook uploaded successfully')
      await qc.invalidateQueries({ queryKey: ['workbook-sheets'] })
      // Auto-select first sheet after upload
      const res = await workbookService.getSheets()
      const sheets = res.data?.sheets || []
      if (sheets.length > 0) {
        setCurrentSheet({ id: sheets[0].id, name: sheets[0].name, rowCount: sheets[0].row_count, columnCount: sheets[0].column_count })
      }
      await qc.invalidateQueries({ queryKey: ['sheet-data'] })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || 'Upload failed. Please ensure a valid .xlsx file.'
      toast.error(msg)
    }
  })

  const resetMutation = useMutation({
    mutationFn: () => workbookService.reset(),
    onSuccess: async () => {
      toast.success('Workbook reset')
      setCurrentSheet(undefined as any)
      await qc.invalidateQueries({ queryKey: ['workbook-sheets'] })
    }
  })

  const csvBlob = useMemo(() => {
    if (!sheetData?.rows || sheetData.rows.length === 0) return null
    const cols = sheetData.columns?.map(c => c.name) || Object.keys(sheetData.rows[0] || {})
    const escape = (v: any) => {
      const s = (v ?? '').toString().replace(/"/g, '""')
      return `"${s}"`
    }
    const header = cols.map(escape).join(',')
    const lines = sheetData.rows.map(r => cols.map(c => escape(r[c])).join(','))
    const csv = [header, ...lines].join('\n')
    return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  }, [sheetData])

  const handleExport = () => {
    if (!csvBlob || !currentSheet) return
    const url = URL.createObjectURL(csvBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentSheet.name || 'sheet'}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Workbook Management</h1>
        <p className="text-muted-foreground">Auto-loaded workbook active. You can view sheets and preview data below.</p>
      </div>

      {/* Upload & Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Workbook (.xlsx)</CardTitle>
          <CardDescription>Original Excel upload karein. Sirf .xlsx supported hai.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
            <Input type="file" accept=".xlsx" onChange={(e) => setFile(e.target.files?.[0] || null)} className="max-w-md" />
            <div className="flex gap-2">
              <Button
                onClick={() => file && uploadMutation.mutate(file)}
                disabled={!file || uploadMutation.isPending}
              >
                {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
              </Button>
              <Button variant="outline" onClick={() => resetMutation.mutate()} disabled={resetMutation.isPending}>
                Reset Workbook
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sheets List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Sheets</CardTitle>
          <CardDescription>
            Select a sheet to view and analyze data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sheetsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : sheets && sheets.length > 0 ? (
            <div className="space-y-2">
              {sheets.map((sheet) => (
                <div
                  key={sheet.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    currentSheet?.id === sheet.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-muted-foreground/50'
                  }`}
                  onClick={() => setCurrentSheet({
                    id: sheet.id,
                    name: sheet.name,
                    rowCount: sheet.row_count,
                    columnCount: sheet.column_count
                  })}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium">{sheet.name}</h3>
                        <p className="text-sm text-muted-foreground">
                        {sheet.row_count} rows × {sheet.column_count} columns
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                      {new Date(sheet.last_modified).toLocaleDateString()}
                      </Badge>
                      {currentSheet?.id === sheet.id && (
                        <Badge variant="default">Selected</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileSpreadsheet className="mx-auto h-12 w-12 mb-4" />
              <p>No workbook loaded yet</p>
              <p className="text-sm">Backend auto-load enabled. Ensure the workbook exists at backend path or configure EPCL_WORKBOOK_PATH.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sheet Data Preview */}
      {currentSheet && (
        <Card>
          <CardHeader>
            <CardTitle>Sheet Data Preview</CardTitle>
            <CardDescription>
              Preview of the selected sheet data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sheetDataLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : sheetData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-sm text-muted-foreground">
                    Showing {sheetData.rows.length} of {sheetData.total_rows} rows
                  </p>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-muted-foreground">Rows:</label>
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      value={rowLimit}
                      onChange={(e) => setRowLimit(parseInt(e.target.value || '100', 10))}
                    >
                      {[50, 100, 200, 500, 1000].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                    <Button variant="outline" size="sm" onClick={handleExport} disabled={!csvBlob}>
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {sheetData.columns.map((column) => (
                          <TableHead key={column.name} className="min-w-[120px]">
                            <div>
                              <div className="font-medium">{column.name}</div>
                              <div className="text-xs text-muted-foreground">{column.type}</div>
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sheetData.rows.slice(0, rowLimit).map((row, index) => (
                        <TableRow key={index}>
                          {sheetData.columns.map((column) => (
                            <TableCell key={column.name} className="max-w-[200px] truncate">
                              {row[column.name]?.toString() || '-'}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Failed to load sheet data</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}