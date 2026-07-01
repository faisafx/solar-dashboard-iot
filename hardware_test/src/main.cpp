#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_INA219.h>
#include <BH1750.h>
#include <LiquidCrystal_I2C.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// --- KONFIGURASI WIFI & MQTT ---
// Ubah dengan nama dan password WiFi kamu
const char* ssid = "Mahasiswa_UHO_2024"; 
const char* password = "";

// Menggunakan Broker Publik EMQX Gratis
const char* mqtt_server = "broker.emqx.io";
const int mqtt_port = 1883;
// Topik yang sama persis dengan yang ada di web Next.js
const char* mqtt_topic = "solar/sensor/data";

WiFiClient espClient;
PubSubClient client(espClient);

// Inisialisasi object sensor
Adafruit_INA219 ina219;
BH1750 lightMeter;
LiquidCrystal_I2C lcd(0x27, 20, 4); 

unsigned long lastMsg = 0;

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Menghubungkan ke WiFi: ");
  Serial.println(ssid);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Konek WiFi...");

  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if(WiFi.status() == WL_CONNECTED){
    Serial.println("\nWiFi terhubung!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    lcd.setCursor(0, 1);
    lcd.print("WiFi OK!        ");
  } else {
    Serial.println("\nGagal Konek WiFi!");
    lcd.setCursor(0, 1);
    lcd.print("WiFi GAGAL!     ");
  }
  delay(2000);
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected() && WiFi.status() == WL_CONNECTED) {
    Serial.print("Menghubungkan ke broker MQTT...");
    // Generate random Client ID
    String clientId = "ESP32-Solar-";
    clientId += String(random(0xffff), HEX);
    
    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      Serial.println("berhasil!");
    } else {
      Serial.print("gagal, rc=");
      Serial.print(client.state());
      Serial.println(" coba lagi dalam 5 detik");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  while (!Serial) { delay(1); }
  
  Serial.println("\nMemulai Sistem IoT...");

  Wire.begin();

  lcd.init();
  lcd.backlight();
  
  // Inisialisasi DHT22
  dht.begin();

  // Koneksi ke WiFi
  setup_wifi();
  
  // Setup MQTT Server
  client.setServer(mqtt_server, mqtt_port);

  // Inisialisasi INA219
  if (!ina219.begin()) {
    Serial.println("Gagal menemukan chip INA219!");
    lcd.setCursor(0, 1);
    lcd.print("INA219 Error!");
    while (1) { delay(10); } 
  }
  Serial.println("INA219 Siap!");

  // Inisialisasi BH1750
  if (!lightMeter.begin()) {
    Serial.println("Gagal menemukan sensor BH1750!");
    lcd.setCursor(0, 1);
    lcd.print("BH1750 Error!");
    while (1) { delay(10); } 
  }
  Serial.println("BH1750 Siap!");

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Sistem Siap!");
  delay(1000);
  lcd.clear();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    setup_wifi();
  }

  if (!client.connected() && WiFi.status() == WL_CONNECTED) {
    reconnect();
  }
  client.loop();

  unsigned long now = millis();
  if (now - lastMsg > 2000) { // Kirim data setiap 2 detik
    lastMsg = now;

    // --- Membaca Sensor ---
    float shuntvoltage = ina219.getShuntVoltage_mV();
    float busvoltage = ina219.getBusVoltage_V();
    float current_mA = ina219.getCurrent_mA();
    float power_mW = ina219.getPower_mW();
    float loadvoltage = busvoltage + (shuntvoltage / 1000);
    float lux = lightMeter.readLightLevel();
    float t = dht.readTemperature();
    float h = dht.readHumidity();

    // --- Tampilkan ke LCD ---
    lcd.setCursor(0, 0);
    lcd.print("V:"); lcd.print(loadvoltage, 1); 
    lcd.print(" I:"); lcd.print(current_mA, 0); 
    lcd.print("   "); 

    lcd.setCursor(0, 1);
    lcd.print("L:"); lcd.print(lux, 0);
    lcd.print(" P:"); lcd.print(power_mW, 0);
    lcd.print("   ");

    lcd.setCursor(0, 2);
    if (isnan(t) || isnan(h)) {
      lcd.print("DHT Error!          ");
    } else {
      lcd.print("T:"); lcd.print(t, 1); lcd.print("C H:"); lcd.print(h, 1); lcd.print("%  ");
    }

    lcd.setCursor(0, 3);
    if(client.connected()) {
      lcd.print("MQTT: Terhubung     ");
    } else {
      lcd.print("MQTT: Putus         ");
    }

    // --- Membuat JSON untuk Website ---
    JsonDocument doc;
    doc["voltage"] = loadvoltage;
    doc["current"] = current_mA;
    doc["power"] = power_mW;
    doc["lux"] = lux;
    
    // Beberapa data belum ada sensor fisiknya, kita buatkan nilai estimasi/dummy
    doc["battery"] = 12.0; // Sesuai request: baterai 12V
    doc["temperature"] = isnan(t) ? 30.0 : t; // Gunakan suhu aktual atau dummy jika gagal
    doc["humidity"] = isnan(h) ? 60.0 : h; // Gunakan kelembaban aktual atau dummy
    doc["panel_efficiency"] = (lux > 50) ? 18.5 : 0.0; // Efisiensi buatan
    doc["charging_status"] = (current_mA > 10); // True jika ada arus lebih dari 10mA

    char jsonBuffer[256];
    serializeJson(doc, jsonBuffer);

    // --- Kirim ke MQTT Broker ---
    if(client.connected()){
      client.publish(mqtt_topic, jsonBuffer);
      Serial.print("Data Terkirim ke Web: ");
      Serial.println(jsonBuffer);
    } else {
      Serial.println("Gagal mengirim, MQTT putus.");
    }
  }
}
