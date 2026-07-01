'use client';

import { useEffect, useRef, useState } from 'react';
import { SolarPanelData } from '@/types/sensor';

interface MetricCardProps {
  label: string;
  value: number | boolean;
  unit: string;
  icon: React.ReactNode;
  accentColor: string;
  glowClass: string;
  trend?: 'up' | 'down' | 'stable';
  isBoolean?: boolean;
  animateIcon?: boolean;
}

export default function MetricCard({
  label,
  value,
  unit,
  icon,
  accentColor,
  glowClass,
  trend = 'stable',
  isBoolean = false,
  animateIcon = false,
}: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState<string>(
    isBoolean ? (value ? 'AKTIF' : 'MATI') : (typeof value === 'number' ? value.toFixed(2) : String(value))
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      setIsUpdating(true);
      const timeout = setTimeout(() => setIsUpdating(false), 300);
      prevValueRef.current = value;

      if (isBoolean) {
        setDisplayValue(value ? 'AKTIF' : 'MATI');
      } else {
        setDisplayValue(typeof value === 'number' ? value.toFixed(2) : String(value));
      }

      return () => clearTimeout(timeout);
    }
  }, [value, isBoolean]);

  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  const trendColor =
    trend === 'up'
      ? 'text-accent-emerald'
      : trend === 'down'
        ? 'text-accent-rose'
        : 'text-text-muted';

  return (
    <div
      className={`metric-card glass-panel ${glowClass} p-4 sm:p-5 animate-fade-in-up`}
    >
      {/* Top Row: Icon + Label */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center ${animateIcon && value ? 'animate-spin-slow' : ''}`}
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <div style={{ color: accentColor }}>{icon}</div>
          </div>
          <span className="text-xs sm:text-sm font-medium text-text-secondary tracking-wide uppercase">
            {label}
          </span>
        </div>

        {/* Trend Indicator */}
        {!isBoolean && (
          <span className={`text-xs font-heading ${trendColor}`}>
            {trendIcon}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1.5">
        <span
          className={`font-heading text-2xl sm:text-3xl font-bold tracking-wider tabular-nums ${isUpdating ? 'value-update' : ''}`}
          style={{ color: isBoolean ? (value ? '#10b981' : '#f43f5e') : accentColor }}
        >
          {displayValue}
        </span>
        {!isBoolean && (
          <span className="text-xs sm:text-sm text-text-muted font-medium">
            {unit}
          </span>
        )}
      </div>

      {/* Bottom bar indicator */}
      <div className="mt-3 h-1 rounded-full bg-hud-surface overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            backgroundColor: accentColor,
            width: isBoolean
              ? value
                ? '100%'
                : '0%'
              : `${Math.min(100, typeof value === 'number' ? (value / getMaxForDisplay(value)) * 100 : 0)}%`,
            boxShadow: `0 0 8px ${accentColor}60`,
          }}
        />
      </div>
    </div>
  );
}

// Helper to determine a reasonable max for the progress bar
function getMaxForDisplay(value: number): number {
  if (value > 10000) return 20000;
  if (value > 1000) return 65535;
  if (value > 100) return 1000;
  if (value > 20) return 100;
  if (value > 15) return 20;
  return 15;
}

// ────────────────────────────────────────────
// Pre-built metric card configurations
// ────────────────────────────────────────────

interface MetricCardsProps {
  data: SolarPanelData;
  previousData?: SolarPanelData | null;
}

function getTrend(
  current: number,
  previous: number | undefined
): 'up' | 'down' | 'stable' {
  if (previous === undefined) return 'stable';
  const diff = current - previous;
  if (Math.abs(diff) < 0.01) return 'stable';
  return diff > 0 ? 'up' : 'down';
}

export function MetricCards({ data, previousData }: MetricCardsProps) {
  const prev = previousData || undefined;

  const metrics = [
    {
      label: 'Tegangan',
      value: data.voltage,
      unit: 'V',
      accentColor: '#06b6d4',
      glowClass: 'glow-cyan',
      trend: getTrend(data.voltage, prev?.voltage),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      ),
    },
    {
      label: 'Arus',
      value: data.current,
      unit: 'mA',
      accentColor: '#6366f1',
      glowClass: 'glow-indigo',
      trend: getTrend(data.current, prev?.current),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 12h4l3-9 6 18 3-9h4" />
        </svg>
      ),
    },
    {
      label: 'Daya',
      value: data.power,
      unit: 'mW',
      accentColor: '#10b981',
      glowClass: 'glow-emerald',
      trend: getTrend(data.power, prev?.power),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ),
    },
    {
      label: 'Intensitas Cahaya',
      value: data.lux,
      unit: 'lux',
      accentColor: '#f59e0b',
      glowClass: 'glow-amber',
      trend: getTrend(data.lux, prev?.lux),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ),
    },
    {
      label: 'Baterai',
      value: data.battery,
      unit: 'V',
      accentColor: data.battery > 12 ? '#10b981' : data.battery > 11 ? '#f59e0b' : '#f43f5e',
      glowClass: data.battery > 12 ? 'glow-emerald' : data.battery > 11 ? 'glow-amber' : 'glow-rose',
      trend: getTrend(data.battery, prev?.battery),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="6" width="18" height="12" rx="2" ry="2" />
          <line x1="23" y1="13" x2="23" y2="11" />
          <path d="M6 10v4M10 10v4M14 10v4" />
        </svg>
      ),
    },
    {
      label: 'Suhu',
      value: data.temperature,
      unit: '°C',
      accentColor: data.temperature > 40 ? '#f43f5e' : '#38bdf8',
      glowClass: data.temperature > 40 ? 'glow-rose' : 'glow-cyan',
      trend: getTrend(data.temperature, prev?.temperature),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
        </svg>
      ),
    },
    {
      label: 'Kelembaban',
      value: data.humidity,
      unit: '%',
      accentColor: data.humidity > 80 ? '#38bdf8' : data.humidity < 40 ? '#f59e0b' : '#10b981',
      glowClass: data.humidity > 80 ? 'glow-cyan' : data.humidity < 40 ? 'glow-amber' : 'glow-emerald',
      trend: getTrend(data.humidity, prev?.humidity),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
      ),
    },
    {
      label: 'Efisiensi',
      value: data.panel_efficiency,
      unit: '%',
      accentColor: '#8b5cf6',
      glowClass: 'glow-indigo',
      trend: getTrend(data.panel_efficiency, prev?.panel_efficiency),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      ),
    },
    {
      label: 'Status Charging',
      value: data.charging_status,
      unit: '',
      accentColor: data.charging_status ? '#10b981' : '#64748b',
      glowClass: data.charging_status ? 'glow-emerald' : '',
      isBoolean: true,
      animateIcon: true,
      trend: 'stable' as const,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3" />
        </svg>
      ),
    },
  ];

  return (
    <div className="dashboard-grid">
      {metrics.map((metric, index) => (
        <MetricCard
          key={metric.label}
          label={metric.label}
          value={metric.value}
          unit={metric.unit}
          icon={metric.icon}
          accentColor={metric.accentColor}
          glowClass={metric.glowClass}
          trend={metric.trend}
          isBoolean={metric.isBoolean}
          animateIcon={metric.animateIcon}
        />
      ))}
    </div>
  );
}
