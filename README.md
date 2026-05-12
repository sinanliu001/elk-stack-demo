# ELK stack demo

Local demo that wires a **flaky Express API**, **Angular** client error handling, **Elasticsearch / Logstash / Kibana (ELK)**, and **Prometheus** metrics. Use it to practice logs, metrics, correlation IDs, and UI-side error flows.

## Repository layout

| Path | Purpose |
|------|--------|
| `elk/` | Docker Compose: Elasticsearch, Kibana, Logstash (JSON Lines on TCP). Details: [`elk/README.md`](elk/README.md). |
| `services/` | Node.js Express API on port **3000** — mock products, intentional failures, Prometheus `/metrics`, logs to Logstash. Details: [`services/README.md`](services/README.md). |
| `UI/` | Angular 19 app — HTTP interceptor, global error handler, demo routes. Details: [`UI/README.md`](UI/README.md). |
| `prometheus/` | Example `prometheus.yml` scraping the API metrics endpoint. Details: [`prometheus/README.md`](prometheus/README.md). |

## Ports

| Service | Port | Notes |
|---------|------|--------|
| Express API | **3000** | Run from `services/`. |
| Logstash (TCP input) | **5044** | API sends JSON Lines here (`127.0.0.1` when Node runs on the host). |
| Elasticsearch | **9200** | HTTP API. |
| Kibana | **5601** | UI: `http://localhost:5601` |
| Prometheus (optional) | **9090** | When run via Docker as below. |
| Angular SSR (production build) | **4000** | Default in `UI/src/server.ts` if not overridden by `PORT`. |

## Prerequisites

- **Docker** and Docker Compose (for ELK and Prometheus).
- **Node.js** (project was developed with Node 18+; use an LTS version).
- **Angular CLI** (optional): `npm i -g @angular/cli` or use `npx ng` from `UI/`.

## 1. Start the ELK stack

From the `elk/` directory:

```bash
cd elk
docker compose up -d
```

Wait until Elasticsearch is healthy, then open **Kibana** at [http://localhost:5601](http://localhost:5601). Create a **data view** on index pattern `node-logs-*` if you want to explore API logs in Discover.

Logstash listens for **JSON Lines** on port **5044** (see `elk/logstash.conf`).

## 2. Start the mock API

From the `services/` directory:

```bash
cd services
npm install
node server_node.js
```

The server logs to **Logstash on `127.0.0.1:5044`**, so Logstash must be up and that port published (as in `elk/docker-compose.yml`).

Useful checks:

```bash
curl -s http://localhost:3000/metrics | head
curl -s http://localhost:3000/products
```

### Demo endpoints (intentional behaviour)

| Endpoint | Behaviour |
|----------|-----------|
| `GET /products` | Returns product JSON; **~50%** responses are **500** (mock DB error). |
| `GET /products/:id` | **503** (maintenance). |
| `GET /getIncorrectProducts` | **200** with wrong payload shape (for client / contract demos). |
| `GET /missing-data` | **404**. |
| `GET /metrics` | Prometheus text format. |

See [`services/README.md`](services/README.md) for more detail.

## 3. Start the Angular UI

From the `UI/` directory:

```bash
cd UI
npm install
npm start
```

Then open the URL shown by the dev server (typically [http://localhost:4200](http://localhost:4200)).

The app calls `http://localhost:3000` by default (`UI/src/app/services/products.service.ts`). Start the API first or those requests will fail.

### Production SSR build (optional)

```bash
cd UI
npm run build
npm run serve:ssr:hw-presentation
```

## 4. Prometheus (optional)

From the `prometheus/` directory (so the volume path resolves correctly):

```bash
cd prometheus
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v "$(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml" \
  prom/prometheus
```

The bundled config scrapes **`host.docker.internal:3000`** — suitable when Prometheus runs in Docker on macOS and the API runs on the host. On Linux you may need to adjust `prometheus/prometheus.yml` (for example to `host.docker.internal` alternatives or bridge networking).

Explore: [http://localhost:9090](http://localhost:9090).

## Architecture (high level)

```text
Angular (browser) ──HTTP──► Express :3000 ──TCP JSON Lines──► Logstash :5044 ──► Elasticsearch
                                │
                                ├──► Prometheus scrapes /metrics
                                └──► Correlation ID header: X-Correlation-ID
```

## Notes

- **Security**: Elasticsearch has security disabled in Compose — **local demo only**.
- **Logstash → Elasticsearch** in `elk/logstash.conf` uses the **`elasticsearch`** service URL inside Compose (`http://elasticsearch:9200`). An init job installs the **`node-logs-*`** index template before Logstash starts. See [`elk/README.md`](elk/README.md) for mappings, manual template install, and host-only Elasticsearch options.
- **`.gitignore`**: Do not commit `node_modules`, `UI/dist`, or Angular cache under `UI/.angular/`.
