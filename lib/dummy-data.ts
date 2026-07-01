import { SolarPanelData, ChartDataPoint } from '@/types/sensor';

// Simulate realistic solar panel data with smooth transitions
let prevData: SolarPanelData | null = null;

function lerp(current: number, target: number, factor: number): number {
  return current + (target - current) * factor;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Simulate time-of-day effect on solar output
function getDaylightFactor(): number {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  // Peak at noon (12), low at night
  // Using a sine curve: peak at 12, zero at 0 and 24
  const factor = Math.sin((hour / 24) * Math.PI);
  return Math.max(0.05, factor); // minimum 5% even at "night" for demo
}

export function generateSolarData(): SolarPanelData {
  const daylightFactor = getDaylightFactor();
  const noise = () => (Math.random() - 0.5) * 2; // -1 to 1

  // Base values scaled by daylight
  const baseVoltage = 12 + daylightFactor * 6 + noise() * 0.3;
  const baseCurrent = daylightFactor * 800 + noise() * 30;
  const baseLux = daylightFactor * 55000 + noise() * 2000;
  const baseTemp = 25 + daylightFactor * 15 + noise() * 1.5;
  const baseHumidity = 60 - daylightFactor * 20 + noise() * 3.0; // inverse to temp

  // Calculate power from voltage and current (P = V * I)
  const voltage = clamp(baseVoltage, 0, 20);
  const current = clamp(baseCurrent, 0, 1000);
  const power = voltage * current; // in mW

  const lux = clamp(baseLux, 0, 65535);
  const temperature = clamp(baseTemp, 15, 55);
  const humidity = clamp(baseHumidity, 20, 95);

  // Battery charges when panel voltage > battery threshold
  const batteryBase = 11 + daylightFactor * 3 + noise() * 0.2;
  const battery = clamp(batteryBase, 10.5, 14.4);
  const charging_status = voltage > 13.0 && current > 50;

  // Efficiency: ratio of electrical output to theoretical max based on light
  const theoreticalMax = (lux / 55000) * 20000; // rough theoretical max mW
  const panel_efficiency = theoreticalMax > 0
    ? clamp((power / theoreticalMax) * 100, 0, 100)
    : 0;

  const newData: SolarPanelData = {
    voltage: parseFloat(voltage.toFixed(2)),
    current: parseFloat(current.toFixed(1)),
    power: parseFloat(power.toFixed(1)),
    lux: parseFloat(lux.toFixed(0)),
    battery: parseFloat(battery.toFixed(2)),
    temperature: parseFloat(temperature.toFixed(1)),
    humidity: parseFloat(humidity.toFixed(1)),
    panel_efficiency: parseFloat(panel_efficiency.toFixed(1)),
    charging_status,
    timestamp: Date.now(),
  };

  // Smooth transitions if we have previous data
  if (prevData) {
    const smoothFactor = 0.3;
    newData.voltage = parseFloat(lerp(prevData.voltage, newData.voltage, smoothFactor).toFixed(2));
    newData.current = parseFloat(lerp(prevData.current, newData.current, smoothFactor).toFixed(1));
    newData.power = parseFloat((newData.voltage * newData.current).toFixed(1));
    newData.lux = parseFloat(lerp(prevData.lux, newData.lux, smoothFactor).toFixed(0));
    newData.battery = parseFloat(lerp(prevData.battery, newData.battery, smoothFactor).toFixed(2));
    newData.temperature = parseFloat(lerp(prevData.temperature, newData.temperature, smoothFactor).toFixed(1));
    newData.humidity = parseFloat(lerp(prevData.humidity, newData.humidity, smoothFactor).toFixed(1));
    newData.panel_efficiency = parseFloat(lerp(prevData.panel_efficiency, newData.panel_efficiency, smoothFactor).toFixed(1));
  }

  prevData = { ...newData };
  return newData;
}

export function dataToChartPoint(data: SolarPanelData): ChartDataPoint {
  const date = new Date(data.timestamp);
  const time = date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return {
    time,
    timestamp: data.timestamp,
    voltage: data.voltage,
    current: data.current,
    power: data.power,
    lux: data.lux,
    battery: data.battery,
    temperature: data.temperature,
    humidity: data.humidity,
    panel_efficiency: data.panel_efficiency,
  };
}
