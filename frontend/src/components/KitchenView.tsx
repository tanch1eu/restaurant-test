import { useEffect, useState } from 'react'
import { fetchOrders } from '../api/client'
import type { Order } from '../types'

/** How often the kitchen screen refreshes, in milliseconds. */
export const POLL_INTERVAL_MS = 5000

/**
 * Kitchen screen: lists submitted orders, refreshing periodically.
 */
export function KitchenView() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const load = () => {
      fetchOrders(controller.signal)
        .then((data) => {
          setOrders(data)
          setError(null)
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted) return
          setError(err instanceof Error ? err.message : 'Could not load orders.')
        })
    }

    load()
    const timer = window.setInterval(load, POLL_INTERVAL_MS)
    return () => {
      window.clearInterval(timer)
      controller.abort()
    }
  }, [])

  return (
    <section aria-labelledby="kitchen-heading">
      <h2 id="kitchen-heading">Kitchen orders</h2>
      {error && <p role="alert" className="notice error">{error}</p>}
      {orders === null && !error && <p className="muted">Loading orders…</p>}
      {orders?.length === 0 && <p className="muted">No orders yet.</p>}
      <div className="ticket-grid">
        {orders?.map((order) => (
          <article key={order.id} className="ticket">
            <header>
              <strong>Order #{order.id}</strong>
              <time dateTime={order.createdAt}>
                {new Date(order.createdAt).toLocaleTimeString('en-AU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
            </header>
            <ul>
              {order.items.map((item) => (
                <li key={item.name}>
                  <span className="ticket-qty">{item.quantity}×</span> {item.name}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
