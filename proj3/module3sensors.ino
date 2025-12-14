#include <WiFi.h>

const char* ssid = "yale wireless";
const char* host = "10.67.68.141"; 
// 10.67.67.177 is mac ip 
const int port = 8888;

WiFiClient client; 

#define SOUND_SPEED 0.034

const int w1t = 26; 
const int w1e = 25; 

const int w2t = 33; 
const int w2e = 32;

const int ht = 27; 
const int he = 34;

long duration; 
float distance;

void setup() { 
  Serial.begin(115200); 
  delay(1000);
  WiFi.begin(ssid); 
  Serial.println("\nConnecting"); 
  while (WiFi.status() != WL_CONNECTED) { 
    Serial.print("."); 
    delay(100); 
  }

  Serial.println("\nConnected to the WiFi network"); 
  Serial.print("Local ESP32 IP: "); 
  Serial.println(WiFi.localIP()); 
  
  pinMode(w1t, OUTPUT); 
  pinMode(w1e, INPUT); 
  
  pinMode(w2t, OUTPUT);
  pinMode(w2e, INPUT); 
  
  pinMode(ht, OUTPUT);
  pinMode(he, INPUT); 

  connectToServer();
}

void loop() { 
  // Ensure Wi-Fi connected 
  if (WiFi.status() != WL_CONNECTED) { 
    Serial.println("Wi-Fi lost, reconnecting..."); 
    WiFi.begin(ssid); 
    delay(1000); 
    return; 
  }

  // Ensure TCP connected 
    if (!client.connected()) {
    connectToServer(); // call here
  }

  readW1Sensor(); 
  delay(40);
  readW2Sensor(); 
  delay(40);
  readHSensor(); 
  delay(40);
}

void readW1Sensor() {
  digitalWrite(w1t, LOW);
  delayMicroseconds(2);
  digitalWrite(w1t, HIGH);
  delayMicroseconds(10);
  digitalWrite(w1t, LOW);

  duration = pulseIn(w1e, HIGH, 30000); // 30 ms timeout

  distance = duration * SOUND_SPEED/2;

  if (client.connected()) {
    client.print("w1: ");
    client.println(distance);
  }
}

void readW2Sensor() {
  digitalWrite(w2t, LOW);
  delayMicroseconds(2);
  digitalWrite(w2t, HIGH);
  delayMicroseconds(10);
  digitalWrite(w2t, LOW);

  duration = pulseIn(w2e, HIGH, 30000); // 30 ms timeout

  distance = duration * SOUND_SPEED/2;

  if (client.connected()) {
    client.print("w2: ");
    client.println(distance);
  }
}

void readHSensor() {
  digitalWrite(ht, LOW);
  delayMicroseconds(2);
  digitalWrite(ht, HIGH);
  delayMicroseconds(10);
  digitalWrite(ht, LOW);

  duration = pulseIn(he, HIGH, 30000); // 30 ms timeout

  distance = duration * SOUND_SPEED/2;

  if (client.connected()) {
    client.print("h: ");
    client.println(distance);
  }
}

void connectToServer() {
  if (client.connect(host, port)) {
    Optional Serial print for debugging
    Serial.println("Connected to server");
  } else {
    Serial.println("Failed to connect");
  }
}
