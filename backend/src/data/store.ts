import type { Order, OrderItem } from "../types.js";

/** Dishes available to order. Kept in memory by design (see CLAUDE.md). */
export const MENU: readonly string[] = [
  "Pasta",
  "Burger",
  "Noodle",
  "Beefsteak",
  "Banhmi",
  "Pizza",
];

/**
 * In-memory order store. Data is lost when the process restarts.
 */
export class OrderStore {
  private orders: Order[] = [];
  private nextId = 1;

  /**
   * Records a new order.
   *
   * Args:
   *   items: Validated order lines.
   *
   * Returns:
   *   The stored order, including its assigned ID and timestamp.
   */
  create(items: OrderItem[]): Order {
    const order: Order = {
      id: this.nextId++,
      items: items.map((item) => ({ ...item })),
      status: "submitted",
      createdAt: new Date().toISOString(),
    };
    this.orders.push(order);
    return order;
  }

  /**
   * Lists all orders.
   *
   * Returns:
   *   Orders sorted newest first.
   */
  list(): Order[] {
    return [...this.orders].reverse();
  }
}
