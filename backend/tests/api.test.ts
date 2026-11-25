import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { MENU } from "../src/data/store.js";

describe("Order API", () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp();
  });

  it("returns the menu", async () => {
    const res = await request(app).get("/api/menu");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ items: MENU });
  });

  it("creates an order and lists it newest first", async () => {
    const first = await request(app)
      .post("/api/orders")
      .send({ items: [{ name: "Pasta", quantity: 2 }] });
    expect(first.status).toBe(201);
    expect(first.body).toMatchObject({
      id: 1,
      status: "submitted",
      items: [{ name: "Pasta", quantity: 2 }],
    });
    expect(typeof first.body.createdAt).toBe("string");

    await request(app)
      .post("/api/orders")
      .send({ items: [{ name: "Pizza", quantity: 1 }] });

    const list = await request(app).get("/api/orders");
    expect(list.status).toBe(200);
    expect(list.body.orders.map((o: { id: number }) => o.id)).toEqual([2, 1]);
  });

  it("merges duplicate items", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({
        items: [
          { name: "Burger", quantity: 1 },
          { name: "Burger", quantity: 2 },
        ],
      });
    expect(res.status).toBe(201);
    expect(res.body.items).toEqual([{ name: "Burger", quantity: 3 }]);
  });

  it.each([
    ["missing items", {}],
    ["empty items", { items: [] }],
    ["unknown dish", { items: [{ name: "Sushi", quantity: 1 }] }],
    ["zero quantity", { items: [{ name: "Pasta", quantity: 0 }] }],
    ["fractional quantity", { items: [{ name: "Pasta", quantity: 1.5 }] }],
    ["quantity too large", { items: [{ name: "Pasta", quantity: 100 }] }],
    ["string quantity", { items: [{ name: "Pasta", quantity: "2" }] }],
  ])("rejects %s with 400", async (_label, body) => {
    const res = await request(app).post("/api/orders").send(body);
    expect(res.status).toBe(400);
    expect(typeof res.body.error).toBe("string");
  });

  it("rejects malformed JSON with 400", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Content-Type", "application/json")
      .send("{not json");
    expect(res.status).toBe(400);
  });

  it("returns 404 JSON for unknown API routes", async () => {
    const res = await request(app).get("/api/nope");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Not found." });
  });
});
