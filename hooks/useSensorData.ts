'use client';

import { useState, useEffect, useCallback } from 'react';
import mqtt from 'mqtt';
import { SolarPanelData, ChartDataPoint, ConnectionStatus } from '@/types/sensor';
import { dataToChartPoint } from '@/lib/dummy-data';

const MAX_HISTORY = 100;

const INITIAL_DATA: SolarPanelData = {
  voltage: 0,
  current: 0,
  power: 0,
  lux: 0,
  battery: 0,
  temperature: 0,
  humidity: 0,
  panel_efficiency: 0,
  charging_status: false,
  timestamp: Date.now(),
};

export function useSensorData() {
  const [currentData, setCurrentData] = useState<SolarPanelData>(INITIAL_DATA);
  const [history, setHistory] = useState<ChartDataPoint[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  const addDataPoint = useCallback((data: SolarPanelData) => {
    setCurrentData(data);
    const chartPoint = dataToChartPoint(data);
    setHistory(prev => {
      const updated = [...prev, chartPoint];
      // Keep only the last MAX_HISTORY points
      if (updated.length > MAX_HISTORY) {
        return updated.slice(updated.length - MAX_HISTORY);
      }
      return updated;
    });
  }, []);

  useEffect(() => {
    setConnectionStatus('reconnecting');

    // Gunakan WSS (WebSocket Secure) karena jalan di Browser (Client-side)
    const brokerUrl = process.env.NEXT_PUBLIC_MQTT_URL || 'wss://broker.emqx.io:8084/mqtt';
    const topic = process.env.NEXT_PUBLIC_MQTT_TOPIC || 'solar/sensor/data';
    const username = process.env.NEXT_PUBLIC_MQTT_USERNAME || '';
    const password = process.env.NEXT_PUBLIC_MQTT_PASSWORD || '';

    // Hubungkan ke EMQX
    const client = mqtt.connect(brokerUrl, {
      username: username,
      password: password,
      clientId: `solar_dash_${Math.random().toString(16).slice(3)}`,
      keepalive: 60,
      protocolVersion: 4,
      clean: true,
      reconnectPeriod: 2000,
    });

    client.on('connect', () => {
      console.log('✅ Terhubung ke broker EMQX');
      setConnectionStatus('connected');
      
      client.subscribe(topic, (err) => {
        if (!err) {
          console.log(`📡 Berhasil subscribe ke topik: ${topic}`);
        } else {
          console.error('❌ Gagal subscribe:', err);
        }
      });
    });

    client.on('reconnect', () => {
      setConnectionStatus('reconnecting');
    });

    client.on('error', (err) => {
      console.error('❌ MQTT Connection Error:', err);
      setConnectionStatus('disconnected');
    });

    client.on('offline', () => {
      console.log('⚠️ MQTT Offline');
      setConnectionStatus('disconnected');
    });

    client.on('message', (topicReceived, message) => {
      if (topicReceived === topic) {
        try {
          const payload = JSON.parse(message.toString());
          
          // Mapping data JSON dari hardware ke interface kita
          // Asumsi hardware mengirimkan object JSON dengan field yang sesuai
          const data: SolarPanelData = {
            voltage: Number(payload.voltage) || 0,
            current: Number(payload.current) || 0,
            power: Number(payload.power) || 0,
            lux: Number(payload.lux) || 0,
            battery: Number(payload.battery) || 0,
            temperature: Number(payload.temperature) || 0,
            panel_efficiency: Number(payload.panel_efficiency) || 0,
            charging_status: Boolean(payload.charging_status)
          };
          
          addDataPoint(data);
        } catch (error) {
          console.error('❌ Error parsing data MQTT:', error);
        }
      }
    });

    return () => {
      console.log('🔌 Menutup koneksi MQTT...');
      client.end();
      setConnectionStatus('disconnected');
    };
  }, [addDataPoint]);

  return {
    currentData,
    history,
    connectionStatus,
  };
}
