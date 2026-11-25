import { Router } from "express";
import type { OrderStore } from "../data/store.js";
import { parseOrderItems } from "../validation.js";

/**
 * Builds the orders router.
 *
 * Args:
 *   store: Where orders are persisted.
 *   menu: Names of dishes that may be ordered.
 *
 * Returns:
 *   A router serving `GET /` (list orders) and `POST /` (submit an order).
 */
export function createOrdersRouter(
  store: OrderStore,
  menu: readonly string[],
): Router {
  const router = Router();

  router.get("/", (_req, res) => {
    res.json({ orders: store.list() });
  });

  router.post("/", (req, res) => {
    const items = parseOrderItems(req.body, menu);
    res.status(201).json(store.create(items));
  });

  return router;
}
