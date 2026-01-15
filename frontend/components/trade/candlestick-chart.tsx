'use client'

import { useEffect, useRef } from 'react'
import { useCandleData } from '@/hooks/use-candle-data'

interface CandlestickChartProps {
  poolId: string
  interval: '1m' | '5m' | '1h' | '1d'
}

const INTERVAL_SECONDS = {
  '1m': 60,
  '5m': 300,
  '1h': 3600,
  '1d': 86400,
}

export function CandlestickChart({ poolId, interval }: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  const { data: candles, isLoading } = useCandleData(poolId, INTERVAL_SECONDS[interval])

  useEffect(() => {
    // Dynamically import lightweight-charts to avoid SSR issues
    const initChart = async () => {
      if (!chartContainerRef.current || !candles?.length) return

      try {
        const { createChart, ColorType, CandlestickSeries } = await import('lightweight-charts')

        // Clean up existing chart
        if (chartRef.current) {
          chartRef.current.remove()
        }

        const chart = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: 400,
          layout: {
            background: { type: ColorType.Solid, color: 'transparent' },
            textColor: '#6b6b6b',
          },
          grid: {
            vertLines: { color: '#e5e1d6' },
            horzLines: { color: '#e5e1d6' },
          },
          rightPriceScale: {
            borderColor: '#e5e1d6',
          },
          timeScale: {
            borderColor: '#e5e1d6',
            timeVisible: true,
          },
        })

        // Use new v5.0 API: chart.addSeries(SeriesType, options)
        const candlestickSeries = chart.addSeries(CandlestickSeries, {
          upColor: '#167a5f',
          downColor: '#000000',
          borderUpColor: '#167a5f',
          borderDownColor: '#000000',
          wickUpColor: '#167a5f',
          wickDownColor: '#000000',
        })

        candlestickSeries.setData(
          candles.map((c) => ({
            time: Number(c.timestamp),
            open: parseFloat(c.open),
            high: parseFloat(c.high),
            low: parseFloat(c.low),
            close: parseFloat(c.close),
          }))
        )

        // Fit content to show all data
        chart.timeScale().fitContent()

        chartRef.current = chart

        const handleResize = () => {
          if (chartContainerRef.current) {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth })
          }
        }

        window.addEventListener('resize', handleResize)

        return () => {
          window.removeEventListener('resize', handleResize)
          chart.remove()
        }
      } catch (error) {
        console.error('Failed to load chart library:', error)
      }
    }

    initChart()
  }, [candles])

  if (isLoading) {
    return <div className="h-[400px] bg-cream-dark rounded animate-pulse" />
  }

  if (!candles?.length) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <p className="font-body text-text-secondary">NO CHART DATA AVAILABLE</p>
      </div>
    )
  }

  return <div ref={chartContainerRef} className="w-full" />
}
