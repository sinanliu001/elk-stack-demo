# ELK stack (`elk/`)

Docker Compose stack for **Elasticsearch 8.12**, **Kibana 8.12**, and **Logstash 8.12** used by the parent repo’s demo API and UI.

## Ports

| Service | Port | URL / use |
|---------|------|-----------|
| **Elasticsearch** | 9200 | `http://localhost:9200` (HTTP API, health). |
| **Kibana** | 5601 | [http://localhost:5601](http://localhost:5601) |
| **Logstash** (TCP input) | 5044 | Send **JSON Lines** (one JSON object + `\n` per event). Matches `logstash.conf`. |

Kibana is **not** on 5044; **5044** is the Logstash TCP input used by `services/server_node.js` when the API runs on the host.

## Start everything

From **this directory** (`elk/`):

```bash
docker compose up -d
```

Compose waits for Elasticsearch to be **healthy** before starting Kibana and Logstash (`depends_on` + healthcheck).

If your Docker CLI still uses the old binary:

```bash
docker-compose up -d
```

## Check status

```bash
docker compose ps
curl -s http://localhost:9200/_cluster/health
```

## Logs pipeline

- **Input**: `logstash.conf` — TCP `5044`, codec `json_lines`.
- **Output**: Elasticsearch index pattern `node-logs-%{+YYYY.MM.dd}`.

The pipeline currently sends data to **`host.docker.internal:9200`**, so Logstash (inside Docker) reaches Elasticsearch on the **host**. That matches typical Docker Desktop on macOS/Windows. If Elasticsearch runs **inside the same Compose project**, you can switch the output hosts to `http://elasticsearch:9200` instead (adjust `logstash.conf` and redeploy Logstash).

`stdout { codec => rubydebug }` is enabled so you can follow parsed events in `docker compose logs -f logstash`.

## Kibana

1. Open [http://localhost:5601](http://localhost:5601).
2. Under **Stack Management → Data views**, create a data view with index pattern **`node-logs-*`** (timestamp field: `@timestamp` if present on your documents).

## Security note

`xpack.security.enabled=false` on Elasticsearch is for **local demos only**. Do not use this configuration on the internet or for real data.

## See also

Repository overview and how to run the API + UI: [../README.md](../README.md).
