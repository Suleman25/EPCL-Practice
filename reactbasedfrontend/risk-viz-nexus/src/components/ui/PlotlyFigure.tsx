import React from 'react'
import createPlotlyComponent from 'react-plotly.js/factory'
import Plotly from 'plotly.js-dist-min'

const Plot = createPlotlyComponent(Plotly)

type FigureLike = {
  data?: any[]
  layout?: any
  frames?: any[]
}

interface PlotlyFigureProps {
  figure?: FigureLike | null
  className?: string
  style?: React.CSSProperties
  loading?: boolean
  height?: number | string
}

export function PlotlyFigure({ figure, className, style, loading, height = 300 }: PlotlyFigureProps) {
  if (loading) {
    return <div className="w-full" style={{ height }} />
  }
  if (!figure || !figure.data) {
    return <div className="w-full text-sm text-muted-foreground" style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No data</div>
  }

  // Resolve CSS variables to concrete color strings for Plotly
  let colorway: string[] | undefined
  let fontColor: string | undefined
  let paperBg: string | undefined
  let plotBg: string | undefined
  try {
    const styles = getComputedStyle(document.documentElement)
    const read = (v: string) => styles.getPropertyValue(v).trim()
    const tokens = ['--chart-1','--chart-2','--chart-3','--chart-4','--chart-5']
    colorway = tokens.map(t => read(t)).filter(Boolean)
    fontColor = read('--foreground')
    // Prefer card/background for surfaces
    paperBg = read('--background') || undefined
    plotBg = read('--card') || paperBg
  } catch {
    // no-op on SSR or if getComputedStyle fails
  }

  const mergedLayout = {
    autosize: true,
    // Only set colorway if backend didn't supply one
    ...(colorway && (!figure.layout || !figure.layout.colorway) ? { colorway } : {}),
    ...(fontColor ? { font: { ...(figure.layout?.font || {}), color: fontColor } } : {}),
    ...(paperBg ? { paper_bgcolor: paperBg } : {}),
    ...(plotBg ? { plot_bgcolor: plotBg } : {}),
    ...(figure.layout || {}),
  }
  return (
    <Plot
      data={figure.data as any}
      layout={mergedLayout}
      frames={figure.frames as any}
      className={className}
      style={{ width: '100%', height, ...style }}
      useResizeHandler
      config={{ displayModeBar: false, responsive: true }}
    />
  )
}

export default PlotlyFigure


