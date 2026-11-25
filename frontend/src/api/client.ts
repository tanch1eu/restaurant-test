import type { Order, OrderItem } from '../types'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

/** Raised when the API responds with a non-2xx status. */
export class ApiError extends Error {
  readonly status: number

  /**
   * Creates an API error.
   *
   * Args:
   *   message: Error message returned by the server, or a fallback.
   *   status: HTTP status code.
   */
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  const body: unknown = await res.json().catch(() => null)
  if (!res.ok) {
    const message =
      body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
        ? body.error
        : `Request failed (${res.status})`
    throw new ApiError(message, res.status)
  }
  return body as T
}

/**
 * Fetches the menu.
 *
 * Args:
 *   signal: Optional abort signal.
 *
 * Returns:
 *   Names of dishes that can be ordered.
 */
export async function fetchMenu(signal?: AbortSignal): Promise<string[]> {
  const data = await request<{ items: string[] }>('/menu', { signal })
  return data.items
}

/**
 * Fetches all submitted orders, newest first.
 *
 * Args:
 *   signal: Optional abort signal.
 *
 * Returns:
 *   The submitted orders.
 */
export async function fetchOrders(signal?: AbortSignal): Promise<Order[]> {
  const data = await request<{ orders: Order[] }>('/orders', { signal })
  return data.orders
}

/**
 * Submits an order to the kitchen.
 *
 * Args:
 *   items: Order lines to submit.
 *
 * Returns:
 *   The created order.
 *
 * Raises:
 *   ApiError: If the server rejects the order.
 */
export function submitOrder(items: OrderItem[]): Promise<Order> {
  return request<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify({ items }),
  })
}
