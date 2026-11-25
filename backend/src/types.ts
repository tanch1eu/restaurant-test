/** A single line on an order: a menu item and how many of it. */
export interface OrderItem {
  name: string;
  quantity: number;
}

/** Lifecycle state of an order. */
export type OrderStatus = "submitted";

/** An order that has been submitted to the kitchen. */
export interface Order {
  id: number;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string;
}
