'use client';

import { SolarPanelData } from '@/types/sensor';

interface SolarVisualizerProps {
  data: SolarPanelData | null;
}

export default function SolarVisualizer({ data }: SolarVisualizerProps) {
  if (!data) {
    return (
      <div className="glass-panel glow-cyan p-6 flex items-center justify-center min-h-[350px] sm:min-h-[400px]">
        <p className="font-heading text-sm text-text-secondary tracking-wider animate-pulse-glow">
          MENUNGGU DATA SENSOR...
        </p>
      </div>
    );
  }

  // Reactive values
  const luxNormalized = Math.min(data.lux / 55000, 1); // 0-1
  const currentNormalized = Math.min(data.current / 800, 1);
  const batteryPercent = ((data.battery - 10.5) / (14.4 - 10.5)) * 100;
  const batteryFill = Math.max(0, Math.min(100, batteryPercent));

  // Colors based on values
  const sunOpacity = 0.3 + luxNormalized * 0.7;
  const sunGlowRadius = 15 + luxNormalized * 25;
  const flowSpeed = 0.5 + currentNormalized * 2;
  const panelGlow = luxNormalized * 0.6;

  return (
    <div className="glass-panel glow-cyan p-4 sm:p-6 animate-fade-in w-full overflow-hidden">
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse-glow" />
        <h2 className="font-heading text-xs sm:text-sm text-accent-cyan tracking-[0.15em] uppercase">
          Alur Sistem Panel Surya
        </h2>
      </div>

      <div className="w-full overflow-x-auto overflow-y-hidden no-scrollbar">
        <svg
          viewBox="0 0 820 340"
          className="w-full h-auto min-w-[700px]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradients */}
            <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity={sunOpacity} />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity={sunOpacity * 0.6} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="panelGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e3a5f" />
              <stop offset="50%" stopColor="#0c1929" />
              <stop offset="100%" stopColor="#0a1525" />
            </linearGradient>

            <linearGradient id="panelReflection" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={panelGlow} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="energyFlowGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            <linearGradient id="batteryFillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={batteryFill > 60 ? '#10b981' : batteryFill > 30 ? '#f59e0b' : '#f43f5e'} />
              <stop offset="100%" stopColor={batteryFill > 60 ? '#059669' : batteryFill > 30 ? '#d97706' : '#e11d48'} />
            </linearGradient>

            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            <filter id="strongGlow">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── Background Grid ── */}
          <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(6,182,212,0.04)" strokeWidth="0.5" />
          </pattern>
          <rect width="820" height="340" fill="url(#smallGrid)" rx="12" />

          {/* ═══════════════════════════════════════
               CONNECTIONS / FLOW LINES
             ═══════════════════════════════════════ */}
          
          {/* Light to BH1750 */}
          <path
            d="M 100 120 Q 130 80 145 80"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.4"
          />

          {/* Light to Panel */}
          <g opacity={luxNormalized * 0.5 + 0.1}>
            {[-20, 0, 20].map((offset) => (
              <line
                key={`ray-${offset}`}
                x1={110}
                y1={140 + offset}
                x2={220}
                y2={140 + offset}
                stroke="#fbbf24"
                strokeWidth="1.5"
                strokeDasharray="4 8"
                opacity={0.3 + luxNormalized * 0.4}
                style={{ animation: `energy-flow ${2 - luxNormalized}s linear infinite` }}
              />
            ))}
          </g>

          {/* Panel -> INA219 */}
          <g>
            <path
              d="M 340 140 L 400 140"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeDasharray="6 4"
              filter="url(#glow)"
              style={{ animation: `energy-flow ${flowSpeed}s linear infinite` }}
            />
            <polygon points="370,136 376,140 370,144" fill="#06b6d4" filter="url(#glow)" />
          </g>

          {/* INA219 -> SCC */}
          <g>
            <path
              d="M 460 140 L 555 140"
              fill="none"
              stroke="url(#energyFlowGrad)"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              filter="url(#glow)"
              style={{ animation: `energy-flow ${flowSpeed}s linear infinite` }}
            />
            <polygon points="505,135 512,140 505,145" fill="#10b981" filter="url(#glow)" />
          </g>

          {/* SCC -> Battery */}
          <g>
            <path
              d="M 625 140 L 715 140"
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeDasharray="6 4"
              filter="url(#glow)"
              style={{ animation: `energy-flow ${flowSpeed}s linear infinite` }}
            />
            <polygon points="670,135 678,140 670,145" fill="#10b981" filter="url(#glow)" />
          </g>

          {/* ═══════════════════════════════════════
               NODES
             ═══════════════════════════════════════ */}

          {/* 1. MATAHARI */}
          <g transform="translate(70, 140)">
            {/* Glow */}
            <circle r={sunGlowRadius} fill="url(#sunGradient)" style={{ transition: 'all 0.8s ease' }} />
            {/* Core */}
            <circle r="20" fill="#fbbf24" opacity={sunOpacity} filter="url(#glow)" style={{ transition: 'opacity 0.8s ease' }} />
            {/* Rays */}
            <g className="sun-rays" opacity={sunOpacity * 0.7}>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <line
                  key={angle}
                  x1={0}
                  y1={-28}
                  x2={0}
                  y2={-38}
                  stroke="#fbbf24"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  transform={`rotate(${angle})`}
                  opacity={0.6 + Math.random() * 0.4}
                />
              ))}
            </g>
            <text y="70" textAnchor="middle" fill="#fbbf24" fontSize="12" fontFamily="var(--font-heading)" letterSpacing="0.1em" filter="url(#glow)">MATAHARI</text>
          </g>

          {/* 2. SENSOR BH1750 */}
          <g transform="translate(170, 80)">
            <rect x="-30" y="-18" width="60" height="36" rx="4" fill="#111827" stroke="#f59e0b" strokeWidth="1.5" />
            <circle cx="-12" cy="0" r="5" fill="#f59e0b" opacity="0.6" />
            <circle cx="12" cy="0" r="5" fill="#111827" stroke="#f59e0b" />
            <text y="-25" textAnchor="middle" fill="#f59e0b" fontSize="10" fontFamily="var(--font-heading)" letterSpacing="0.05em">BH1750</text>
            <text y="35" textAnchor="middle" fill="#fcd34d" fontSize="12" fontFamily="var(--font-body)" fontWeight="bold">{data.lux.toLocaleString()} LUX</text>
          </g>

          {/* 3. PANEL SURYA */}
          <g transform="translate(280, 140)">
            <rect x="-60" y="-40" width="120" height="80" rx="4" fill="url(#panelGradient)" stroke="#1e3a5f" strokeWidth="2" />
            <rect x="-60" y="-40" width="120" height="80" rx="4" fill="url(#panelReflection)" />
            {/* Grid Cells */}
            {[0, 1, 2].map((row) =>
              [0, 1, 2, 3].map((col) => (
                <rect
                  key={`cell-${row}-${col}`}
                  x={-56 + col * 28.5}
                  y={-36 + row * 24}
                  width="25.5"
                  height="20"
                  rx="1"
                  fill="none"
                  stroke="rgba(6,182,212,0.2)"
                  strokeWidth="0.5"
                />
              ))
            )}
            <text y="-55" textAnchor="middle" fill="#06b6d4" fontSize="12" fontFamily="var(--font-heading)" letterSpacing="0.1em">PANEL SURYA</text>
            <text y="60" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="var(--font-heading)" letterSpacing="0.05em">EFISIENSI</text>
            <text y="78" textAnchor="middle" fill="#8b5cf6" fontSize="14" fontFamily="var(--font-body)" fontWeight="bold" filter="url(#glow)">{data.panel_efficiency.toFixed(1)}%</text>
          </g>

          {/* 4. SENSOR INA219 */}
          <g transform="translate(430, 140)">
            <rect x="-30" y="-25" width="60" height="50" rx="6" fill="#111827" stroke="#06b6d4" strokeWidth="2" />
            {/* IC Chip */}
            <rect x="-15" y="-10" width="30" height="20" rx="2" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
            {[...Array(4)].map((_, i) => <line key={`pin-l-${i}`} x1="-20" y1={-5 + i*4} x2="-15" y2={-5 + i*4} stroke="#38bdf8" strokeWidth="1" />)}
            {[...Array(4)].map((_, i) => <line key={`pin-r-${i}`} x1="15" y1={-5 + i*4} x2="20" y2={-5 + i*4} stroke="#38bdf8" strokeWidth="1" />)}
            
            <text y="-35" textAnchor="middle" fill="#06b6d4" fontSize="12" fontFamily="var(--font-heading)" letterSpacing="0.05em">INA219</text>
            
            {/* Data Values Stacked */}
            <g transform="translate(0, 42)">
              <text y="0" textAnchor="middle" fill="#38bdf8" fontSize="12" fontFamily="var(--font-body)" fontWeight="bold">{data.voltage.toFixed(2)} V</text>
              <text y="16" textAnchor="middle" fill="#6366f1" fontSize="12" fontFamily="var(--font-body)" fontWeight="bold">{data.current.toFixed(1)} mA</text>
              <text y="32" textAnchor="middle" fill="#10b981" fontSize="12" fontFamily="var(--font-body)" fontWeight="bold" filter="url(#glow)">{(data.power / 1000).toFixed(2)} W</text>
            </g>
          </g>

          {/* 5. SCC (Solar Charge Controller) */}
          <g transform="translate(590, 140)">
            <rect x="-35" y="-45" width="70" height="90" rx="6" fill="#111827" stroke="#10b981" strokeWidth="2" />
            {/* SCC Screen */}
            <rect x="-25" y="-30" width="50" height="25" rx="2" fill="#022c22" stroke="#059669" strokeWidth="1" />
            <text x="0" y="-13" textAnchor="middle" fill="#34d399" fontSize="10" fontFamily="var(--font-body)">{data.voltage.toFixed(1)}V</text>
            {/* Buttons */}
            <circle cx="-15" cy="5" r="3" fill="#334155" />
            <circle cx="0" cy="5" r="3" fill="#334155" />
            <circle cx="15" cy="5" r="3" fill="#334155" />
            {/* Status LED */}
            <circle cx="-15" cy="25" r="4" fill={data.charging_status ? '#10b981' : '#64748b'} filter={data.charging_status ? 'url(#glow)' : ''} />
            <text x="-5" y="28" textAnchor="start" fill="#94a3b8" fontSize="8" fontFamily="var(--font-heading)">CHG</text>
            
            <text y="-55" textAnchor="middle" fill="#10b981" fontSize="12" fontFamily="var(--font-heading)" letterSpacing="0.1em">SCC</text>
            
            <text y="60" textAnchor="middle" fill={data.charging_status ? '#10b981' : '#64748b'} fontSize="11" fontFamily="var(--font-heading)" fontWeight="bold" filter={data.charging_status ? 'url(#glow)' : ''}>
              {data.charging_status ? '⚡ CHARGING' : '○ STANDBY'}
            </text>

            {/* Termometer attached below SCC */}
            <g transform="translate(0, 85)">
              <rect x="-4" y="0" width="8" height="25" rx="4" fill="#111827" stroke="#38bdf8" strokeWidth="1" />
              <rect x="-2" y={25 - (data.temperature/55)*20} width="4" height={(data.temperature/55)*20} rx="2" fill={data.temperature > 40 ? '#f43f5e' : '#38bdf8'} />
              <circle cx="0" cy="28" r="6" fill={data.temperature > 40 ? '#f43f5e' : '#38bdf8'} />
              <text y="48" textAnchor="middle" fill={data.temperature > 40 ? '#f43f5e' : '#38bdf8'} fontSize="11" fontFamily="var(--font-body)">{data.temperature.toFixed(1)}°C</text>
            </g>
          </g>

          {/* 6. BATERAI */}
          <g transform="translate(740, 140)">
            {/* Battery Body */}
            <rect x="-25" y="-40" width="50" height="80" rx="4" fill="#111827" stroke="#1e3a5f" strokeWidth="2" />
            {/* Terminal */}
            <rect x="-10" y="-46" width="20" height="6" rx="2" fill="#1e3a5f" />
            {/* Fill */}
            <rect x="-20" y={35 - 70 * (batteryFill / 100)} width="40" height={70 * (batteryFill / 100)} rx="2" fill="url(#batteryFillGrad)" style={{ transition: 'all 0.8s ease' }}>
              {data.charging_status && (
                <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" />
              )}
            </rect>
            {/* Percentage */}
            <text y="5" textAnchor="middle" fill="white" fontSize="14" fontFamily="var(--font-body)" fontWeight="bold">{batteryFill.toFixed(0)}%</text>
            
            <text y="-55" textAnchor="middle" fill="#38bdf8" fontSize="12" fontFamily="var(--font-heading)" letterSpacing="0.1em">BATERAI</text>
            <text y="60" textAnchor="middle" fill={batteryFill > 60 ? '#10b981' : batteryFill > 30 ? '#f59e0b' : '#f43f5e'} fontSize="12" fontFamily="var(--font-body)" fontWeight="bold" filter="url(#glow)">{data.battery.toFixed(2)} V</text>
          </g>

        </svg>
      </div>
    </div>
  );
}
