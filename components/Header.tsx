'use client';

import { ConnectionStatus } from '@/types/sensor';
import { useEffect, useState } from 'react';

interface HeaderProps {
  connectionStatus: ConnectionStatus;
}

export default function Header({ connectionStatus }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setCurrentDate(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const statusConfig = {
    connected: {
      label: 'MQTT AKTIF',
      dotClass: 'connected',
      textClass: 'text-accent-emerald',
    },
    disconnected: {
      label: 'TERPUTUS',
      dotClass: 'disconnected',
      textClass: 'text-accent-rose',
    },
    reconnecting: {
      label: 'MENYAMBUNG...',
      dotClass: 'reconnecting',
      textClass: 'text-accent-amber',
    },
  };

  const status = statusConfig[connectionStatus];

  return (
    <header className="relative z-10 glass-panel-heavy mx-3 mt-3 sm:mx-4 sm:mt-4 lg:mx-6 lg:mt-6 px-4 py-3 sm:px-6 sm:py-4 rounded-2xl">
      {/* Gradient bottom border */}
      <div className="absolute bottom-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-accent-cyan/40 to-transparent" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left: Logo & Title */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Solar Icon */}
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
            <div className="absolute inset-0 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20" />
            <svg
              className="w-6 h-6 sm:w-7 sm:h-7 text-accent-cyan"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          </div>

          <div>
            <h1 className="font-heading text-sm sm:text-base lg:text-lg font-bold tracking-[0.2em] text-accent-cyan text-glow-cyan">
              SOLAR COMMAND CENTER
            </h1>
            <p className="text-[10px] sm:text-xs text-text-secondary tracking-wider mt-0.5">
              INA219 + BH1750 ENERGY MONITORING SYSTEM
            </p>
          </div>
        </div>

        {/* Right: Status & Clock */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <span className={`status-dot ${status.dotClass}`} />
            <span className={`font-heading text-[10px] sm:text-xs tracking-wider ${status.textClass}`}>
              {status.label}
            </span>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-[1px] h-8 bg-gradient-to-b from-transparent via-accent-cyan/20 to-transparent" />

          {/* Clock */}
          <div className="hidden sm:block text-right">
            <div className="font-heading text-sm lg:text-base text-text-primary tracking-wider tabular-nums">
              {currentTime}
            </div>
            <div className="text-[10px] text-text-secondary tracking-wider">
              {currentDate}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
