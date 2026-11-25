import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 4000);
const corsOrigin = process.env.CORS_ORIGIN?.split(",").map((o) => o.trim());

const app = createApp({ corsOrigin });

const server = app.listen(port, () => {
  console.log(`Order API listening on http://localhost:${port}`);
});

/** Closes the HTTP server cleanly on shutdown signals. */
function shutdown(): void {
  server.close(() => process.exit(0));
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
