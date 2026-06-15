import os
import sys
import paho.mqtt.client as mqtt


def main() -> int:
    if len(sys.argv) != 5:
        print("Usage: mqtt_publish.py <host> <port> <topic> <payload>")
        return 1

    host = sys.argv[1]
    port = int(sys.argv[2])
    topic = sys.argv[3]
    payload = sys.argv[4]

    username = os.getenv("MQTT_USERNAME", "")
    password = os.getenv("MQTT_PASSWORD", "")

    try:
        client = mqtt.Client()

        if username:
            client.username_pw_set(username, password)

        client.connect(host, port, 60)

        result = client.publish(topic, payload, qos=0, retain=False)
        result.wait_for_publish()

        client.disconnect()

        if result.rc == mqtt.MQTT_ERR_SUCCESS:
            print(f"Published to {topic}: {payload}")
            return 0

        print(f"Publish failed. MQTT result code: {result.rc}")
        return 1

    except Exception as error:
        print(f"MQTT publish exception: {error}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
