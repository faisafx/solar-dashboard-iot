'use client';

import Header from '@/components/Header';
import { MetricCards } from '@/components/MetricCard';
import SolarVisualizer from '@/components/SolarVisualizer';
import RealtimeChart from '@/components/RealtimeChart';
import PowerGauge from '@/components/PowerGauge';
import { useSensorData } from '@/hooks/useSensorData';
import { useRef, useEffect, useState } from 'react';
import { SolarPanelData } from '@/types/sensor';

export default function DashboardPage() {
  const { currentData, history, connectionStatus } = useSensorData();
  const [previousData, setPreviousData] = useState<SolarPanelData | null>(null);
  const prevRef = useRef<SolarPanelData | null>(null);

  // Track previous data for trend calculations
  useEffect(() => {
    if (currentData) {
      setPreviousData(prevRef.current);
      prevRef.current = currentData;
    }
  }, [currentData]);

  return (
    <div className="relative z-10 flex flex-col min-h-screen">
      {/* Header */}
      <Header connectionStatus={connectionStatus} />

      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5 lg:space-y-6">
        {/* ═══ KPI Metric Cards ═══ */}
        {currentData && (
          <section>
            <MetricCards data={currentData} previousData={previousData} />
          </section>
        )}

        {/* ═══ Middle Row: Visualizer + Gauge ═══ */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {/* Solar Panel Visualizer — spans 2 cols on desktop */}
          <div className="lg:col-span-2">
            <SolarVisualizer data={currentData} />
          </div>

          {/* Power Gauge */}
          <div className="lg:col-span-1">
            <PowerGauge data={currentData} />
          </div>
        </section>

        {/* ═══ Real-time Chart ═══ */}
        <section>
          <RealtimeChart history={history} />
        </section>

        {/* ═══ Footer ═══ */}
        <footer className="text-center py-4">
          <p className="text-[10px] sm:text-xs text-text-muted tracking-wider font-heading">
            SOLAR COMMAND CENTER v1.0 — INA219 + BH1750 MONITORING SYSTEM
          </p>
          <p className="text-[9px] text-text-muted/50 mt-1">
            Data LIVE dari ESP32 via MQTT Broker EMQX
          </p>
        </footer>
      </main>
    </div>
  );
}
