// Solar Panel Monitoring - Sensor Data Types

export interface SolarPanelData {
  // INA219 Sensor — Solar Panel Electrical Metrics
  voltage: number;        // Volts (0–20V typical for solar panel)
  current: number;        // Milliamps (0–1000mA)
  power: number;          // Milliwatts (0–20000mW)

  // BH1750 Sensor — Ambient Light Intensity
  lux: number;            // Lux (0–65535, outdoor sun ~54000)

  // System Metrics
  battery: number;        // Battery voltage (10.5–14.4V for 12V system)
  temperature: number;    // Board/ambient temperature °C
  humidity: number;       // Relative humidity %
  panel_efficiency: number; // Calculated efficiency percentage (0–100)
  charging_status: boolean; // Is the battery currently charging?

  // Metadata
  timestamp: number;      // Unix timestamp in milliseconds
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

export interface ChartDataPoint {
  time: string;           // Formatted time string (HH:mm:ss)
  timestamp: number;      // Unix timestamp
  voltage: number;
  current: number;
  power: number;
  lux: number;
  battery: number;
  temperature: number;
  humidity: number;
  panel_efficiency: number;
}

export interface MetricConfig {
  key: keyof SolarPanelData;
  label: string;
  unit: string;
  icon: string;
  color: string;
  glowColor: string;
  min: number;
  max: number;
  decimals: number;
}
