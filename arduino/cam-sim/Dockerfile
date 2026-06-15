FROM ubuntu:22.04 AS builder

RUN apt-get update && apt-get install -y \
    make \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/bxparks/EpoxyDuino.git /epoxy
ENV EPOXY_DUINO_PATH=/epoxy

WORKDIR /build
COPY . .
RUN make

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    coreutils \
    bash \
    python3 \
    python3-paho-mqtt \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /build/cam-sim.out .
COPY mqtt_publish.py .

CMD ["bash", "-c", "echo 'Starting Car Simulator MQTT mode...' && exec stdbuf -i0 -o0 -e0 ./cam-sim.out"]
