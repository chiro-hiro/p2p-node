FROM node:22-slim

# Install dependencies required for running the app
RUN apt-get update && \
    apt-get install -y tini curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY relay.js ./
RUN npm ci --quiet

ENV NODE_ENV production
ENV NODE_OPTIONS "--inspect=0.0.0.0"

# tcp/ws
EXPOSE 43210

# Use tini to handle signals properly, see https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#handling-kernel-signals
ENTRYPOINT ["/usr/bin/tini", "-p", "SIGKILL", "--", "node", "--expose-gc", "/app/relay.js" ]