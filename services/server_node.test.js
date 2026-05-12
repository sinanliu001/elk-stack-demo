/**
 * HTTP tests for server_node.js (Express mock API).
 * Run from `services/`: npm test
 */
jest.mock("net", () => ({
  Socket: jest.fn().mockImplementation(() => ({
    connect: jest.fn((_port, _host, cb) => {
      if (typeof cb === "function") cb();
    }),
    write: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
  })),
}));

const request = require("supertest");
const app = require("./server_node");
const { products } = require("./utils");

describe("server_node API", () => {
  afterEach(() => {
    jest.spyOn(Math, "random").mockRestore();
  });

  describe("GET /products/:id", () => {
    it("returns 503 maintenance payload", async () => {
      const res = await request(app).get("/products/42");

      expect(res.status).toBe(503);
      expect(res.body).toMatchObject({
        error: "Service Unavailable",
        message: "The database is currently under maintenance.",
      });
    });
  });

  describe("GET /products", () => {
    it("returns the full product list when random path succeeds", async () => {
      jest.spyOn(Math, "random").mockReturnValue(0.99);

      const res = await request(app).get("/products");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(products.length);
      expect(res.body[0]).toMatchObject({ id: products[0].id, title: products[0].title });
    });

    it("returns 500 when random path fails", async () => {
      jest.spyOn(Math, "random").mockReturnValue(0.01);

      const res = await request(app).get("/products");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        error: "Database Connection Failed (Mock Error)",
      });
    });
  });

  describe("GET /getIncorrectProducts", () => {
    it("returns intentionally malformed payload with 200", async () => {
      const res = await request(app).get("/getIncorrectProducts");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("productions");
      expect(res.body.productions[0]).toMatchObject({
        id: 1,
        name: "Incorrect Product 1",
        price: "N/A",
      });
    });
  });

  describe("GET /missing-data", () => {
    it("returns 404", async () => {
      const res = await request(app).get("/missing-data");

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        error: "Not Found",
        suggestion: "Check your API endpoint spelling.",
      });
    });
  });

  describe("GET /metrics", () => {
    it("returns Prometheus exposition format", async () => {
      const res = await request(app).get("/metrics");

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/text/);
      expect(res.text).toContain("http_request_duration_seconds");
      expect(res.text).toContain("business_products_viewed_total");
    });
  });

  describe("correlation middleware", () => {
    it("echoes X-Correlation-ID when provided", async () => {
      const id = "test-correlation-uuid";
      const res = await request(app)
        .get("/metrics")
        .set("x-correlation-id", id);

      expect(res.headers["x-correlation-id"]).toBe(id);
    });

    it("sets X-Correlation-ID when header omitted", async () => {
      const res = await request(app).get("/metrics");

      expect(res.headers["x-correlation-id"]).toBeDefined();
      expect(typeof res.headers["x-correlation-id"]).toBe("string");
      expect(res.headers["x-correlation-id"].length).toBeGreaterThan(0);
    });
  });
});
