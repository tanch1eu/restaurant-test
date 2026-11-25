import { Router } from "express";

/**
 * Builds the menu router.
 *
 * Args:
 *   menu: Names of dishes to expose.
 *
 * Returns:
 *   A router serving `GET /` with `{ items: string[] }`.
 */
export function createMenuRouter(menu: readonly string[]): Router {
  const router = Router();
  router.get("/", (_req, res) => {
    res.json({ items: menu });
  });
  return router;
}
