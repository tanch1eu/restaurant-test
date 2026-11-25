import cors from "cors";
import express, {
  type ErrorRequestHandler,
  type Express,
} from "express";
import { MENU, OrderStore } from "./data/store.js";
import { createMenuRouter } from "./routes/menu.js";
import { createOrdersRouter } from "./routes/orders.js";
import { ValidationError } from "./validation.js";

/** Options for building the Express app. */
export interface AppOptions {
  /** Order store to use; a fresh one is created when omitted. */
  store?: OrderStore;
  /** Allowed CORS origin(s); CORS is disabled when omitted. */
  corsOrigin?: string | string[];
}

/**
 * Creates the configured Express application.
 *
 * Args:
 *   options: Optional dependencies and settings.
 *
 * Returns:
 *   An Express app ready to be passed to `listen` or Supertest.
 */
export function createApp(options: AppOptions = {}): Express {
  const store = options.store ?? new OrderStore();
  const app = express();

  app.disable("x-powered-by");
  if (options.corsOrigin) {
    app.use(cors({ origin: options.corsOrigin }));
  }
  app.use(express.json({ limit: "10kb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  app.use("/api/menu", createMenuRouter(MENU));
  app.use("/api/orders", createOrdersRouter(store, MENU));

  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Not found." });
  });

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof ValidationError) {
      res.status(400).json({ error: err.message });
      return;
    }
    // Malformed JSON from express.json().
    if (err?.type === "entity.parse.failed") {
      res.status(400).json({ error: "Request body is not valid JSON." });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error." });
  };
  app.use(errorHandler);

  return app;
}
