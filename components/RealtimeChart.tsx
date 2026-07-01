'use client';

import dynamic from 'next/dynamic';
import { ChartDataPoint } from '@/types/sensor';
import { useMemo, useState } from 'react';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface RealtimeChartProps {
  history: ChartDataPoint[];
}

type SeriesKey = 'voltage' | 'current' | 'power' | 'lux' | 'humidity';

const seriesConfig: Record<SeriesKey, { label: string; color: string; yAxisIndex: number; unit: string }> = {
  voltage: { label: 'Tegangan (V)', color: '#06b6d4', yAxisIndex: 0, unit: 'V' },
  current: { label: 'Arus (mA)', color: '#6366f1', yAxisIndex: 1, unit: 'mA' },
  power: { label: 'Daya (mW)', color: '#10b981', yAxisIndex: 1, unit: 'mW' },
  lux: { label: 'Cahaya (lux)', color: '#f59e0b', yAxisIndex: 1, unit: 'lux' },
  humidity: { label: 'Kelembaban (%)', color: '#38bdf8', yAxisIndex: 1, unit: '%' },
};

export default function RealtimeChart({ history }: RealtimeChartProps) {
  const [activeKeys, setActiveKeys] = useState<Set<SeriesKey>>(
    new Set(['voltage', 'current', 'power', 'lux', 'humidity'])
  );

  const toggleSeries = (key: SeriesKey) => {
    setActiveKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const option = useMemo(() => {
    const times = history.map((p) => p.time);

    const series = Object.entries(seriesConfig)
      .filter(([key]) => activeKeys.has(key as SeriesKey))
      .map(([key, config]) => ({
        name: config.label,
        type: 'line' as const,
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: config.color,
        },
        areaStyle: {
          color: {
            type: 'linear' as const,
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: `${config.color}30` },
              { offset: 1, color: `${config.color}05` },
            ],
          },
        },
        data: history.map((p) => p[key as keyof ChartDataPoint]),
        yAxisIndex: config.yAxisIndex,
      }));

    return {
      backgroundColor: 'transparent',
      animation: true,
      animationDuration: 300,
      grid: {
        top: 20,
        right: 60,
        bottom: 30,
        left: 60,
        containLabel: false,
      },
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        borderColor: 'rgba(6, 182, 212, 0.2)',
        borderWidth: 1,
        textStyle: {
          color: '#f1f5f9',
          fontSize: 12,
        },
        axisPointer: {
          type: 'cross' as const,
          lineStyle: {
            color: 'rgba(6, 182, 212, 0.3)',
          },
          crossStyle: {
            color: 'rgba(6, 182, 212, 0.3)',
          },
        },
      },
      xAxis: {
        type: 'category' as const,
        data: times,
        axisLine: { lineStyle: { color: 'rgba(6, 182, 212, 0.15)' } },
        axisLabel: {
          color: '#64748b',
          fontSize: 10,
          interval: Math.max(0, Math.floor(times.length / 8)),
        },
        splitLine: { show: false },
      },
      yAxis: [
        {
          type: 'value' as const,
          position: 'left' as const,
          axisLine: { lineStyle: { color: 'rgba(6, 182, 212, 0.15)' } },
          axisLabel: { color: '#64748b', fontSize: 10 },
          splitLine: {
            lineStyle: { color: 'rgba(6, 182, 212, 0.06)' },
          },
        },
        {
          type: 'value' as const,
          position: 'right' as const,
          axisLine: { lineStyle: { color: 'rgba(99, 102, 241, 0.15)' } },
          axisLabel: { color: '#64748b', fontSize: 10 },
          splitLine: { show: false },
        },
      ],
      series,
    };
  }, [history, activeKeys]);

  return (
    <div className="glass-panel glow-indigo p-4 sm:p-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent-indigo animate-pulse-glow" />
          <h2 className="font-heading text-xs sm:text-sm text-accent-indigo tracking-[0.15em]">
            GRAFIK REAL-TIME
          </h2>
          <span className="text-[10px] text-text-muted">
            ({history.length}/100 titik)
          </span>
        </div>

        {/* Series Toggles */}
        <div className="flex flex-wrap gap-2">
          {(Object.entries(seriesConfig) as [SeriesKey, typeof seriesConfig[SeriesKey]][]).map(
            ([key, config]) => (
              <button
                key={key}
                onClick={() => toggleSeries(key)}
                className={`px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-medium tracking-wider transition-all duration-200 border ${
                  activeKeys.has(key)
                    ? 'border-current opacity-100'
                    : 'border-transparent opacity-40 hover:opacity-60'
                }`}
                style={{ color: config.color }}
              >
                {config.label}
              </button>
            )
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="w-full" style={{ height: '280px' }}>
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
          notMerge={true}
        />
      </div>
    </div>
  );
}
