import { MAX_QUANTITY } from '../hooks/useOrder'
import type { OrderItem } from '../types'

/** Props for {@link OrderList}. */
export interface OrderListProps {
  items: OrderItem[]
  submitting: boolean
  onIncrement: (name: string) => void
  onDecrement: (name: string) => void
  onRemove: (name: string) => void
  onClear: () => void
  onSubmit: () => void
}

/**
 * Shows the order being built, with quantity controls and a submit button.
 *
 * Args:
 *   props: Current order lines, submission state and action handlers.
 */
export function OrderList({
  items,
  submitting,
  onIncrement,
  onDecrement,
  onRemove,
  onClear,
  onSubmit,
}: OrderListProps) {
  const isEmpty = items.length === 0

  return (
    <section className="panel" aria-labelledby="order-heading">
      <h2 id="order-heading">Current order</h2>
      {isEmpty ? (
        <p className="muted">No items yet. Add dishes from the menu.</p>
      ) : (
        <ul className="order-list">
          {items.map(({ name, quantity }) => (
            <li key={name}>
              <span className="order-name">{name}</span>
              <div className="qty">
                <button
                  type="button"
                  onClick={() => onDecrement(name)}
                  aria-label={`Decrease ${name}`}
                >
                  −
                </button>
                <span aria-label={`${name} quantity`}>{quantity}</span>
                <button
                  type="button"
                  onClick={() => onIncrement(name)}
                  disabled={quantity >= MAX_QUANTITY}
                  aria-label={`Increase ${name}`}
                >
                  +
                </button>
              </div>
              <button
                type="button"
                className="link"
                onClick={() => onRemove(name)}
                aria-label={`Remove ${name}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="actions">
        <button type="button" className="secondary" onClick={onClear} disabled={isEmpty || submitting}>
          Clear
        </button>
        <button type="button" className="primary" onClick={onSubmit} disabled={isEmpty || submitting}>
          {submitting ? 'Sending…' : 'Submit to kitchen'}
        </button>
      </div>
    </section>
  )
}
