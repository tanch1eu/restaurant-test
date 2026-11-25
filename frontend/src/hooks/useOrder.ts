import { useCallback, useState } from 'react'
import type { OrderItem } from '../types'

/** Maximum quantity per order line; matches the backend limit. */
export const MAX_QUANTITY = 99

/** State and actions returned by {@link useOrder}. */
export interface UseOrderResult {
  items: OrderItem[]
  totalQuantity: number
  add: (name: string) => void
  decrement: (name: string) => void
  remove: (name: string) => void
  clear: () => void
}

/**
 * Manages the order currently being built at the counter.
 *
 * Adding a dish already on the order increases its quantity (up to
 * MAX_QUANTITY); decrementing to zero removes the line.
 *
 * Returns:
 *   The current order lines and actions to change them.
 */
export function useOrder(): UseOrderResult {
  const [items, setItems] = useState<OrderItem[]>([])

  const add = useCallback((name: string) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.name === name)
      if (!existing) return [...prev, { name, quantity: 1 }]
      return prev.map((item) =>
        item.name === name
          ? { ...item, quantity: Math.min(item.quantity + 1, MAX_QUANTITY) }
          : item,
      )
    })
  }, [])

  const decrement = useCallback((name: string) => {
    setItems((prev) =>
      prev
        .map((item) => (item.name === name ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0),
    )
  }, [])

  const remove = useCallback((name: string) => {
    setItems((prev) => prev.filter((item) => item.name !== name))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)

  return { items, totalQuantity, add, decrement, remove, clear }
}
