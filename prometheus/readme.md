# Prometheus (`prometheus/`)

Example **Prometheus** configuration that scrapes the demo **Express API** metrics endpoint.

## Config

[`prometheus.yml`](prometheus.yml) sets a **15s** scrape interval and one static target:

- **`host.docker.internal:3000`** — assumes the API runs on the **host** (port **3000**) and Prometheus runs **inside Docker** (typical Docker Desktop on macOS/Windows).

Prometheus will scrape **`/metrics`** on that target by default.

### Linux / other setups

`host.docker.internal` is not always available. Options include:

- Add `extra_hosts` to the Prometheus container, or  
- Point `targets` at your machine’s LAN IP, or  
- Run the API in the same Docker network and use the service name (e.g. `api:3000`).

## Run Prometheus (Docker)

Run from **this directory** so the bind mount path is correct:

```bash
cd prometheus
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v "$(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml" \
  prom/prometheus
```

UI: [http://localhost:9090](http://localhost:9090) (e.g. **Graph** or **Query**).

Stop / remove when finished:

```bash
docker stop prometheus && docker rm prometheus
```

## Prerequisites

The mock API must expose metrics: see [`../services/README.md`](../services/README.md) (`GET /metrics`).

## See also

- [../README.md](../README.md) — full repository overview.
- [../services/README.md](../services/README.md) — API and endpoint behaviour.
