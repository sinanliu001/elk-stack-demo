# prometheus

visit following url:
http://localhost:9090/query

## install

Mac: in terminal, run following code

```bash
docker run -d \
 --name prometheus \
 -p 9090:9090 \
 -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
 prom/prometheus
```
