import type { OrderItem } from "./types.js";

/** Maximum quantity allowed for a single order line. */
export const MAX_QUANTITY = 99;

/** Raised when a request payload fails validation; maps to HTTP 400. */
export class ValidationError extends Error {
  /**
   * Creates a validation error.
   *
   * Args:
   *   message: Human-readable reason the input was rejected.
   */
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Validates an order payload against the menu.
 *
 * Duplicate item names are merged by summing their quantities.
 *
 * Args:
 *   body: The raw request body.
 *   menu: Names of dishes that may be ordered.
 *
 * Returns:
 *   The validated, normalised order lines.
 *
 * Raises:
 *   ValidationError: If the payload is malformed, empty, references an
 *     unknown dish, or has an invalid quantity.
 */
export function parseOrderItems(
  body: unknown,
  menu: readonly string[],
): OrderItem[] {
  if (typeof body !== "object" || body === null || !("items" in body)) {
    throw new ValidationError("Request body must include an 'items' array.");
  }
  const { items } = body as { items: unknown };
  if (!Array.isArray(items) || items.length === 0) {
    throw new ValidationError("Order must contain at least one item.");
  }

  const merged = new Map<string, number>();
  for (const raw of items) {
    if (typeof raw !== "object" || raw === null) {
      throw new ValidationError("Each item must be an object.");
    }
    const { name, quantity } = raw as { name?: unknown; quantity?: unknown };
    if (typeof name !== "string" || !menu.includes(name)) {
      throw new ValidationError(`Unknown menu item: ${String(name)}.`);
    }
    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_QUANTITY
    ) {
      throw new ValidationError(
        `Quantity for ${name} must be a whole number from 1 to ${MAX_QUANTITY}.`,
      );
    }
    merged.set(name, (merged.get(name) ?? 0) + quantity);
  }

  const result: OrderItem[] = [];
  for (const [name, quantity] of merged) {
    if (quantity > MAX_QUANTITY) {
      throw new ValidationError(
        `Quantity for ${name} must be a whole number from 1 to ${MAX_QUANTITY}.`,
      );
    }
    result.push({ name, quantity });
  }
  return result;
}
