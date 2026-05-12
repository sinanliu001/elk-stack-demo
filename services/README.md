# Mock API (`services/`)

Express server for the **ELK stack demo**: mock product JSON, **intentional failures** for UI and observability exercises, **Prometheus** metrics, and **JSON Lines** logs to **Logstash** on `127.0.0.1:5044`.

## Requirements

- **Node.js** 18+ (LTS recommended).
- **Logstash** listening on **5044** (start the stack in [`../elk/README.md`](../elk/README.md) first) if you want logs to reach Elasticsearch.

## Install and run

```bash
cd services
npm install
node server_node.js
```

Server listens on **http://localhost:3000**.

## Automated tests

[Jest](https://jestjs.io/) + [Supertest](https://github.com/ladjs/supertest) exercise the HTTP API without starting Logstash (`net` is mocked).

```bash
cd services
npm test
```

## Endpoints (demo behaviour)

| Method / path | Response |
|---------------|----------|
| `GET /products` | Product list JSON; **~50%** of requests return **500** (mock database error). |
| `GET /products/:id` | **503** (service unavailable / maintenance). |
| `GET /getIncorrectProducts` | **200** with intentionally wrong shape (`productions`, bad fields) for contract / UI demos. |
| `GET /missing-data` | **404** (JSONP-style payload in current implementation). |
| `GET /metrics` | **Prometheus** exposition format (`prom-client`). |

Responses may include header **`X-Correlation-ID`** (generated or echoed from `x-correlation-id`).

## Quick checks (`curl`)

```bash
curl -s http://localhost:3000/metrics | head
curl -s http://localhost:3000/products
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/products/1
curl -s http://localhost:3000/getIncorrectProducts
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/missing-data
```

## See also

- [../README.md](../README.md) — full stack run order.
- [../prometheus/README.md](../prometheus/README.md) — scraping this service’s `/metrics`.
- [../UI/README.md](../UI/README.md) — Angular client that calls this API.
