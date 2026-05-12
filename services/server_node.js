const express = require("express");
const client = require("prom-client");
const cors = require("cors");
const bodyParser = require("body-parser");
const net = require("net");
const crypto = require("crypto");
const { products } = require("./utils");

const app = express();
const port = 3000;

// Helper function to send logs directly to Logstash
const sendToLogstash = (level, message, extra = {}) => {
  const client = new net.Socket();

  // 127.0.0.1 is the bridge to your Logstash Docker container
  client.connect(5044, "127.0.0.1", () => {
    const logData = {
      "@timestamp": new Date().toISOString(),
      level: level,
      message: message,
      ...extra,
    };

    // CRITICAL: The '\n' is required for the Logstash 'json_lines' codec
    client.write(JSON.stringify(logData) + "\n");
    client.end();
  });

  client.on("error", (err) => {
    // This will tell you EXACTLY if the connection is refused
    console.error("Logstash Connection Error:", err.message);
  });
};

// --- PROMETHEUS SETUP ---
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "code"],
  buckets: [0.1, 0.5, 1, 2, 5],
});
const productsViewedCounter = new client.Counter({
  name: "business_products_viewed_total",
  help: "Total number of products viewed by users",
  labelNames: ["category"],
});
register.registerMetric(httpRequestDuration);
register.registerMetric(productsViewedCounter);

// --- MIDDLEWARE ---
app.use(cors());
app.use(bodyParser.json());

// Metrics Middleware: Records every request
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  const correlationId = req.header("x-correlation-id") || crypto.randomUUID();
  res.setHeader("X-Correlation-ID", correlationId);
  req.correlationId = correlationId;
  res.on("finish", () => {
    end({ method: req.method, route: req.path, code: res.statusCode });
  });
  next();
});

app.get("/products/:id", async (req, res) => {
  sendToLogstash("error", "503 Service Unavailable", {
    method: req.method,
    path: req.path,
  });
  res.status(503).json({
    error: "Service Unavailable",
    message: "The database is currently under maintenance.",
  });
});

app.get("/products", (req, res) => {
  const shouldFail = Math.random() < 0.5; // 50% chance
  productsViewedCounter.labels("beauty").inc(2); // Simulate 2 products viewed per request

  if (shouldFail) {
    sendToLogstash("error", "Database Connection Failed (Mock Error)", {
      method: req.method,
      path: req.path,
    });
    res.status(500).json({ error: "Database Connection Failed (Mock Error)" });
    return;
  }
  sendToLogstash("info", "200 OK: Products Retrieved", {
    method: req.method,
    path: req.path,
  });
  res.status(200).json(products);
});

app.get("/getIncorrectProducts", (req, res) => {
  sendToLogstash("info", "200 OK with Incorrect Data Format", {
    method: req.method,
    path: req.path,
  });
  res.status(200).json({
    productions: [
      {
        id: 1,
        name: "Incorrect Product 1", // missing title field
        price: "N/A", // Invalid price format
      },
    ],
  });
});

app.get("/missing-data", (req, res) => {
  sendToLogstash("error", "404 Not Found", {
    method: req.method,
    path: req.path,
  });
  res.status(404).jsonp({
    error: "Not Found",
    suggestion: "Check your API endpoint spelling.",
  });
});

app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.send(await register.metrics());
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`🚀 Mock Server running at http://localhost:${port}`);
    console.log(`📊 Prometheus Metrics at http://localhost:${port}/metrics`);
  });
}

module.exports = app;
