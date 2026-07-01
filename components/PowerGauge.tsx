'use client';

import dynamic from 'next/dynamic';
import { SolarPanelData } from '@/types/sensor';
import { useMemo } from 'react';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface PowerGaugeProps {
  data: SolarPanelData | null;
}

export default function PowerGauge({ data }: PowerGaugeProps) {
  const powerWatts = data ? data.power / 1000 : 0; // Convert mW to W
  const maxPower = 20; // 20W max

  const option = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      series: [
        {
          type: 'gauge',
          startAngle: 210,
          endAngle: -30,
          min: 0,
          max: maxPower,
          splitNumber: 10,
          radius: '90%',
          center: ['50%', '55%'],
          axisLine: {
            lineStyle: {
              width: 12,
              color: [
                [0.2, '#f59e0b'],
                [0.6, '#06b6d4'],
                [0.8, '#10b981'],
                [1, '#8b5cf6'],
              ],
            },
          },
          pointer: {
            icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
            length: '60%',
            width: 8,
            offsetCenter: [0, '-10%'],
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: '#06b6d4' },
                  { offset: 1, color: '#10b981' },
                ],
              },
              shadowColor: 'rgba(6, 182, 212, 0.5)',
              shadowBlur: 10,
            },
          },
          axisTick: {
            length: 6,
            lineStyle: {
              color: 'auto',
              width: 1,
            },
          },
          splitLine: {
            length: 12,
            lineStyle: {
              color: 'auto',
              width: 2,
            },
          },
          axisLabel: {
            color: '#64748b',
            fontSize: 10,
            distance: 18,
            formatter: (value: number) => {
              if (value === 0 || value === maxPower || value === maxPower / 2) {
                return value + 'W';
              }
              return '';
            },
          },
          title: {
            offsetCenter: [0, '25%'],
            fontSize: 10,
            color: '#94a3b8',
            fontFamily: 'var(--font-heading)',
            letterSpacing: '0.1em',
          },
          detail: {
            fontSize: 28,
            offsetCenter: [0, '55%'],
            valueAnimation: true,
            formatter: (value: number) => value.toFixed(2) + ' W',
            color: '#06b6d4',
            fontFamily: 'var(--font-heading)',
            fontWeight: 'bold' as const,
            textShadowColor: 'rgba(6, 182, 212, 0.3)',
            textShadowBlur: 10,
          },
          data: [
            {
              value: parseFloat(powerWatts.toFixed(2)),
              name: 'DAYA OUTPUT',
            },
          ],
          animation: true,
          animationDuration: 800,
        },
      ],
    };
  }, [powerWatts]);

  return (
    <div className="glass-panel glow-emerald p-4 sm:p-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse-glow" />
        <h2 className="font-heading text-xs sm:text-sm text-accent-emerald tracking-[0.15em]">
          POWER GAUGE
        </h2>
      </div>

      {/* Gauge */}
      <div className="w-full" style={{ height: '260px' }}>
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
