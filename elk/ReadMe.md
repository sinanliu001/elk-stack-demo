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

Compose does the following:

1. **Elasticsearch** starts and passes its healthcheck.
2. **`es-templates`** runs once and registers the composable index template **`node-logs`** (see `templates/node-logs-index-template.json`) so new indices **`node-logs-*`** get explicit field types.
3. **Kibana** and **Logstash** start; Logstash waits for **`es-templates`** to finish successfully before ingesting.

If your Docker CLI still uses the old binary:

```bash
docker-compose up -d
```

### Init container and Compose compatibility

Logstash **`depends_on`** the **`es-templates`** service with **`condition: service_completed_successfully`** so the index template exists before the first document creates an index. If your Compose build does not support **`service_completed_successfully`**, install the template manually (see **Install template manually** below), then remove the **`es-templates`** service and its entry under Logstash **`depends_on`** in `docker-compose.yml`.

## Check status

```bash
docker compose ps
curl -s http://localhost:9200/_cluster/health
curl -s http://localhost:9200/_index_template/node-logs
```

## Logs pipeline (`logstash.conf`)

| Stage | Behaviour |
|-------|------------|
| **Input** | TCP **5044**, **`json_lines`** codec (matches the mock API). |
| **Filter** | Converts **`statusCode`** to integer when present; adds **`service`** = `mock-api` for filtering in Kibana. |
| **Output** | Writes to **`http://elasticsearch:9200`** (same Compose network), index **`node-logs-%{+YYYY.MM.dd}`**, **`ilm_enabled => false`**, **`manage_template => false`** (template is installed by **`es-templates`**, not Logstash). |

`stdout { codec => rubydebug }` is enabled so you can follow parsed events in `docker compose logs -f logstash`.

### Elasticsearch not in Docker

If Elasticsearch runs on the **host** instead of this Compose file, change the **`hosts`** line in `logstash.conf` to reach it (for example `http://host.docker.internal:9200` on Docker Desktop) and run **`scripts/install-index-template.sh`** against that cluster (set **`ELASTICSEARCH_URL`** if needed).

## Index template & mappings

Template file: **`templates/node-logs-index-template.json`**. It applies to **`node-logs-*`** and defines:

| Field | ES type | Notes |
|-------|---------|--------|
| `@timestamp` | `date` | From your JSON payload. |
| `level` | `keyword` | e.g. `info`, `error`. |
| `message` | `text` + `.keyword` | Full-text + sortable/aggregate subfield. |
| `statusCode` | `integer` | HTTP status. |
| `method` | `keyword` | `GET`, `POST`, … |
| `path` | `keyword` | Request path. |
| `correlationId` | `keyword` | Tie to API / browser header. |
| `service` | `keyword` | Added by Logstash (`mock-api`). |

### Install template manually

If the init container did not run (or you recreated ES without Compose):

```bash
chmod +x scripts/install-index-template.sh   # once
./scripts/install-index-template.sh
```

Or with a custom URL:

```bash
ELASTICSEARCH_URL=http://127.0.0.1:9200 ./scripts/install-index-template.sh
```

**Note:** Mappings apply to **indices created after** the template exists. Delete old `node-logs-*` indices if you need to re-apply mappings during development:

```bash
curl -X DELETE "http://localhost:9200/node-logs-*"
```

## Kibana

1. Open [http://localhost:5601](http://localhost:5601).
2. **Stack Management → Data views → Create data view**  
   - Index pattern: **`node-logs-*`**  
   - Timestamp field: **`@timestamp`**
3. In **Discover**, add columns such as **`@timestamp`**, **`statusCode`**, **`method`**, **`path`**, **`correlationId`**, **`level`**, **`message`**, **`service`**.

Saved searches and dashboards are not shipped in this repo; build them from the data view above.

## Security note

`xpack.security.enabled=false` on Elasticsearch is for **local demos only**. Do not use this configuration on the internet or for real data.

## See also

Repository overview and how to run the API + UI: [../README.md](../README.md).
