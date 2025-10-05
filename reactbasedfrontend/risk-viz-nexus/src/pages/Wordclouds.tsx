import React, { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Skeleton } from '@/components/ui/skeleton'
import { Cloud, Download, RefreshCw, Settings, Type } from 'lucide-react'
import { wordcloudService } from '@/services/wordcloudService'
import { toast } from 'react-hot-toast'
import { workbookService } from '@/services/workbookService'

// No mock fallback: always bind to backend; show empty states if needed.

export function Wordclouds() {
  const [textSource, setTextSource] = useState('')
  const [customText, setCustomText] = useState('')
  const [maxWords, setMaxWords] = useState([50])
  const [minFrequency, setMinFrequency] = useState([2])
  const [generatedWords, setGeneratedWords] = useState<Array<{text: string, value: number, color?: string, category?: string}> | null>(null)

  // Auto-detect sheet names (handles 'Hazard ID' etc.)
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
        const exact = lower.findIndex(n => n === c)
        if (exact !== -1) return names[exact]
      }
      for (const c of cands) {
        const idx = lower.findIndex(n => n.includes(c))
        if (idx !== -1) return names[idx]
      }
      return undefined
    }
    return {
      incident: findBy(['incident','incidents']),
      hazard: findBy(['hazard','hazards'])
    }
  }, [sheetsPayload])

  const { data: wordsData, isLoading: wordsLoading, refetch: refetchWords } = useQuery({
    queryKey: ['wordcloud-words', sheetNames.incident, sheetNames.hazard, maxWords[0], minFrequency[0], textSource],
    queryFn: () => wordcloudService.getWords({
      incident_sheet: sheetNames.incident,
      hazard_sheet: sheetNames.hazard,
      top_n: maxWords[0],
      min_count: minFrequency[0],
      // extra_stopwords: customText ? customText.split(/[\,\n]+/).map(s => s.trim()).filter(Boolean) : undefined,
    }),
    enabled: false, // Manual trigger via Generate button
    retry: false,
    select: (response: any) => (response?.data as any) || null,
  })

  // Update local render state when query result changes (avoid setting state in select/render)
  useEffect(() => {
    if (wordsData) {
      setGeneratedWords(wordsData?.words || [])
    }
  }, [wordsData])

  const exportImageMutation = useMutation<
    { image_base64: string; content_type: string },
    unknown,
    { words: Array<{text: string, value: number}>; width?: number; height?: number; colormap?: string }
  >({
    mutationFn: (params) => wordcloudService.getImage(params).then(res => res.data),
    onSuccess: (data) => {
      const { image_base64, content_type } = data
      const link = document.createElement('a')
      link.href = `data:${content_type};base64,${image_base64}`
      link.download = 'wordcloud.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Wordcloud exported successfully!')
    },
    onError: () => {
      toast.error('Failed to export wordcloud')
    }
  })

  const handleGenerate = () => {
    if (!sheetNames.incident || !sheetNames.hazard) {
      toast.error('Workbook sheets not detected yet')
      return
    }
    refetchWords()
  }

  const handleExport = (format: 'png' | 'jpg' | 'svg' = 'png') => {
    if (!generatedWords || generatedWords.length === 0) {
      toast.error('Generate wordcloud first')
      return
    }
    
    exportImageMutation.mutate({
      words: generatedWords.map(w => ({ text: w.text, value: w.value })),
      width: 800,
      height: 600,
      colormap: 'coolwarm'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Wordcloud Generator</h1>
        <p className="text-muted-foreground">
          Generate interactive wordclouds from safety reports and incident descriptions
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Controls */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Generation Settings
            </CardTitle>
            <CardDescription>
              Configure wordcloud generation parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Text Source */}
            <div className="space-y-2">
              <Label htmlFor="text-source">Text Source</Label>
              <Select value={textSource} onValueChange={setTextSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="incident_reports">Incident Reports</SelectItem>
                  <SelectItem value="safety_observations">Safety Observations</SelectItem>
                  <SelectItem value="training_feedback">Training Feedback</SelectItem>
                  <SelectItem value="audit_findings">Audit Findings</SelectItem>
                  <SelectItem value="near_miss_reports">Near Miss Reports</SelectItem>
                  <SelectItem value="custom">Custom Text</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Text */}
            {textSource === 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="custom-text">Custom Text</Label>
                <Textarea
                  id="custom-text"
                  placeholder="Paste your text here..."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  rows={4}
                />
              </div>
            )}

            {/* Max Words */}
            <div className="space-y-2">
              <Label>Maximum Words: {maxWords[0]}</Label>
              <Slider
                value={maxWords}
                onValueChange={setMaxWords}
                max={200}
                min={10}
                step={10}
                className="w-full"
              />
            </div>

            {/* Min Frequency */}
            <div className="space-y-2">
              <Label>Minimum Frequency: {minFrequency[0]}</Label>
              <Slider
                value={minFrequency}
                onValueChange={setMinFrequency}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button 
                onClick={handleGenerate} 
                disabled={wordsLoading}
                className="w-full"
              >
                {wordsLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Cloud className="h-4 w-4 mr-2" />
                    Generate Wordcloud
                  </>
                )}
              </Button>
              
              {generatedWords && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleExport('png')}
                    disabled={exportImageMutation.isPending}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export PNG
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExport('svg')}
                    disabled={exportImageMutation.isPending}
                    className="w-full"
                  >
                    <Type className="h-4 w-4 mr-2" />
                    Export SVG
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Wordcloud Display */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Generated Wordcloud
            </CardTitle>
            <CardDescription>
              Interactive visualization of word frequencies
            </CardDescription>
          </CardHeader>
          <CardContent>
            {wordsLoading ? (
              <Skeleton className="h-[400px] w-full" />
            ) : generatedWords ? (
              <div className="h-[400px] border rounded-lg bg-muted/10 flex items-center justify-center relative overflow-hidden">
                {/* Simple word layout simulation */}
                <div className="absolute inset-4 flex flex-wrap items-center justify-center gap-2">
                  {generatedWords.slice(0, 30).map((word, index) => {
                    const fontSize = Math.max(12, Math.min(32, word.value * 0.8))
                    const rotation = Math.random() > 0.7 ? Math.random() * 60 - 30 : 0
                    return (
                      <span
                        key={word.text}
                        className="font-bold cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          fontSize: `${fontSize}px`,
                          color: word.color,
                          transform: `rotate(${rotation}deg)`,
                          lineHeight: 1,
                        }}
                        title={`${word.text}: ${word.value} occurrences`}
                      >
                        {word.text}
                      </span>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="h-[400px] border rounded-lg bg-muted/10 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Cloud className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Generate a wordcloud to see visualization</p>
                  <p className="text-sm text-muted-foreground">Select a text source and click Generate</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Word Statistics */}
      {wordsData && (
        <Card>
          <CardHeader>
            <CardTitle>Word Statistics</CardTitle>
            <CardDescription>
              Analysis of the generated wordcloud
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{wordsData.metadata.total_words}</div>
                <div className="text-sm text-muted-foreground">Total Words</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{wordsData.metadata.unique_words}</div>
                <div className="text-sm text-muted-foreground">Unique Words</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{wordsData.metadata.source_documents}</div>
                <div className="text-sm text-muted-foreground">Source Documents</div>
              </div>
            </div>

            {/* Top Words Table */}
            <div className="space-y-2">
              <h4 className="font-medium">Top Words by Frequency</h4>
              <div className="grid gap-2 md:grid-cols-2">
                {wordsData.words.slice(0, 20).map((word, index) => (
                  <div key={word.text} className="flex items-center justify-between p-2 rounded bg-muted/20">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                      <span className="font-medium" style={{ color: word.color }}>
                        {word.text}
                      </span>
                      {word.category && (
                        <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                          {word.category}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium">{word.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}