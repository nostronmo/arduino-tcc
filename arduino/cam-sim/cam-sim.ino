#include <Arduino.h>
#include <cstdio>
#include <stdlib.h>

#ifdef UNIX_HOST_DUINO
#define OBD_SERIAL Serial
#else
#define OBD_SERIAL Serial2
#endif

const char *MQTT_BROKER = "mqtt-broker";
const int MQTT_PORT = 1883;
const char *MQTT_TOPIC = "simulador/obd";

struct OBDData {
  uint16_t rpm = 3000;
  uint8_t velocity = 90;
  int motor_temp = 88;
};

OBDData virtual_car;

String buildTelemetryJson() {
  String json = "{";
  json += "\"rpm\":";
  json += virtual_car.rpm;
  json += ",\"velocidadeObd\":";
  json += virtual_car.velocity;
  json += ",\"temperaturaMotor\":";
  json += virtual_car.motor_temp;
  json += "}";
  return json;
}

void publishTelemetryIfNeeded() {
  static unsigned long publishTimer = 0;

  if (millis() - publishTimer <= 200) {
    return;
  }

  publishTimer = millis();

  String payload = buildTelemetryJson();
  char command[512];

  snprintf(command, sizeof(command),
           "python3 /app/mqtt_publish.py %s %d %s '%s'", MQTT_BROKER, MQTT_PORT,
           MQTT_TOPIC, payload.c_str());

  int result = system(command);

  if (result == 0) {
    fprintf(stderr, "[MQTT] Published to %s: %s\n", MQTT_TOPIC,
            payload.c_str());
    fflush(stderr);
  } else {
    fprintf(stderr, "[MQTT] Publish failed with code %d\n", result);
    fflush(stderr);
  }
}

void updateCarPhysics() {
  static unsigned long stateTimer = 0;
  static int target_rpm = 3000;

  if (millis() - stateTimer > random(5000, 8000)) {
    stateTimer = millis();
    target_rpm = random(1000, 4500);
  }

  if (virtual_car.rpm < target_rpm - 20) {
    virtual_car.rpm += random(2, 12);
  } else if (virtual_car.rpm > target_rpm + 20) {
    virtual_car.rpm -= random(2, 12);
  }

  virtual_car.rpm += random(-5, 6);

  virtual_car.rpm = constrain(virtual_car.rpm, 750, 5000);

  uint16_t calculated_velocity = virtual_car.rpm / 35;
  virtual_car.velocity = (uint8_t)constrain(calculated_velocity, 0, 220);

  static unsigned long tempTimer = 0;
  if (millis() - tempTimer > 1000) {
    tempTimer = millis();
    if (virtual_car.rpm > 3500) {
      virtual_car.motor_temp += random(0, 2);
    } else if (virtual_car.rpm < 2000) {
      virtual_car.motor_temp -= random(0, 2);
    }
    virtual_car.motor_temp = constrain(virtual_car.motor_temp, 85, 105);
  }

  static unsigned long logTimer = 0;
  if (millis() - logTimer > 3000) {
    logTimer = millis();

    fprintf(stderr, "[SIMULATOR] RPM: %d | Speed: %d km/h | Temp: %d C\n",
            virtual_car.rpm, virtual_car.velocity, virtual_car.motor_temp);
    fflush(stderr);
  }
}

void handleSerialOBDRequests() {
  if (OBD_SERIAL.available() > 0) {
    uint8_t requestedPid = OBD_SERIAL.read();

    if (requestedPid == 0x0C) {
      uint16_t raw_rpm = virtual_car.rpm * 4;
      OBD_SERIAL.write(0x41);
      OBD_SERIAL.write(0x0C);
      OBD_SERIAL.write((raw_rpm >> 8) & 0xFF);
      OBD_SERIAL.write(raw_rpm & 0xFF);
    } else if (requestedPid == 0x0D) {
      OBD_SERIAL.write(0x41);
      OBD_SERIAL.write(0x0D);
      OBD_SERIAL.write(virtual_car.velocity);
    } else if (requestedPid == 0x05) {
      OBD_SERIAL.write(0x41);
      OBD_SERIAL.write(0x05);
      OBD_SERIAL.write((uint8_t)(virtual_car.motor_temp + 40));
    }
  }
}

void setup() {
  Serial.begin(115200);
  OBD_SERIAL.begin(115200);
  randomSeed(analogRead(0));

  fprintf(stderr, "[SYSTEM] Car simulator started.\n");
  fflush(stderr);
}

void loop() {
  updateCarPhysics();
  publishTelemetryIfNeeded();
  handleSerialOBDRequests();
  delay(10);
}
