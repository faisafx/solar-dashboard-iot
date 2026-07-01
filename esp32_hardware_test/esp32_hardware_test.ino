#include <Wire.h>
#include <Adafruit_INA219.h>
#include <BH1750.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>

#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// Inisialisasi object
Adafruit_INA219 ina219;
BH1750 lightMeter;
// Alamat I2C LCD biasanya 0x27 atau 0x3F. Ukuran 20 kolom x 4 baris
LiquidCrystal_I2C lcd(0x27, 20, 4); 

void setup() {
  Serial.begin(115200);
  while (!Serial) {
      delay(1);
  }
  
  Serial.println("Memulai Test Hardware...");

  // Inisialisasi I2C untuk ESP32 (SDA = GPIO21, SCL = GPIO22 secara default)
  Wire.begin();

  // Inisialisasi LCD
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Init Sistem...");

  // Inisialisasi DHT22
  dht.begin();

  // Inisialisasi INA219
  if (!ina219.begin()) {
    Serial.println("Gagal menemukan chip INA219!");
    lcd.setCursor(0, 1);
    lcd.print("INA219 Error!");
    while (1) { delay(10); } // Berhenti disini jika error
  }
  Serial.println("INA219 Siap!");

  // Inisialisasi BH1750
  if (!lightMeter.begin()) {
    Serial.println("Gagal menemukan sensor BH1750!");
    lcd.setCursor(0, 1);
    lcd.print("BH1750 Error!");
    while (1) { delay(10); } // Berhenti disini jika error
  }
  Serial.println("BH1750 Siap!");

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Semua Sensor");
  lcd.setCursor(0, 1);
  lcd.print("Siap & OK!");
  delay(2000);
  lcd.clear();
}

void loop() {
  // === Membaca data dari INA219 ===
  float shuntvoltage = ina219.getShuntVoltage_mV();
  float busvoltage = ina219.getBusVoltage_V();
  float current_mA = ina219.getCurrent_mA();
  float power_mW = ina219.getPower_mW();
  float loadvoltage = busvoltage + (shuntvoltage / 1000);

  // === Membaca data dari BH1750 ===
  float lux = lightMeter.readLightLevel();

  // === Membaca data dari DHT22 ===
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  // === Print ke Serial Monitor ===
  Serial.println("-----------------------");
  Serial.print("Bus Voltage:   "); Serial.print(busvoltage); Serial.println(" V");
  Serial.print("Shunt Voltage: "); Serial.print(shuntvoltage); Serial.println(" mV");
  Serial.print("Load Voltage:  "); Serial.print(loadvoltage); Serial.println(" V");
  Serial.print("Current:       "); Serial.print(current_mA); Serial.println(" mA");
  Serial.print("Power:         "); Serial.print(power_mW); Serial.println(" mW");
  Serial.print("Light Level:   "); Serial.print(lux); Serial.println(" lx");
  if (isnan(t) || isnan(h)) {
    Serial.println("Gagal membaca dari sensor DHT!");
  } else {
    Serial.print("Temperature:   "); Serial.print(t); Serial.println(" *C");
    Serial.print("Humidity:      "); Serial.print(h); Serial.println(" %");
  }

  // === Tampilkan ke LCD 20x4 ===
  
  // Baris 1: Tegangan (V) dan Arus (mA)
  lcd.setCursor(0, 0);
  lcd.print("V:"); lcd.print(loadvoltage, 2); 
  lcd.print(" I:"); lcd.print(current_mA, 0); 
  lcd.print("   "); 

  // Baris 2: Intensitas Cahaya (Lux) dan Daya (mW)
  lcd.setCursor(0, 1);
  lcd.print("L:"); lcd.print(lux, 0);
  lcd.print(" P:"); lcd.print(power_mW, 0);
  lcd.print("   "); 

  // Baris 3: Suhu & Kelembaban
  lcd.setCursor(0, 2);
  if (isnan(t) || isnan(h)) {
    lcd.print("DHT Sensor Error!   ");
  } else {
    lcd.print("T:"); lcd.print(t, 1); lcd.print("C H:"); lcd.print(h, 1); lcd.print("%  ");
  }

  // Baris 4: Status 
  lcd.setCursor(0, 3);
  lcd.print("Status: Sensor OK   ");

  // Tunggu 2 detik sebelum update berikutnya
  delay(2000); 
}
