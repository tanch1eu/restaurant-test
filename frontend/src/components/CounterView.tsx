import { useEffect, useState } from 'react'
import { fetchMenu, submitOrder } from '../api/client'
import { useOrder } from '../hooks/useOrder'
import { MenuList } from './MenuList'
import { OrderList } from './OrderList'

type Notice = { kind: 'success' | 'error'; text: string } | null

/**
 * Counter screen: pick dishes from the menu, build an order and submit it.
 */
export function CounterView() {
  const [menu, setMenu] = useState<string[]>([])
  const [menuError, setMenuError] = useState<string | null>(null)
  const [loadingMenu, setLoadingMenu] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)
  const order = useOrder()

  useEffect(() => {
    const controller = new AbortController()
    fetchMenu(controller.signal)
      .then(setMenu)
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setMenuError(err instanceof Error ? err.message : 'Could not load the menu.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingMenu(false)
      })
    return () => controller.abort()
  }, [])

  async function handleSubmit() {
    setSubmitting(true)
    setNotice(null)
    try {
      const created = await submitOrder(order.items)
      order.clear()
      setNotice({ kind: 'success', text: `Order #${created.id} sent to kitchen.` })
    } catch (err) {
      setNotice({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Could not submit the order.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  function handleAdd(name: string) {
    setNotice(null)
    order.add(name)
  }

  if (loadingMenu) return <p className="muted">Loading menu…</p>
  if (menuError) return <p role="alert" className="notice error">{menuError}</p>

  return (
    <>
      {notice && (
        <p role={notice.kind === 'error' ? 'alert' : 'status'} className={`notice ${notice.kind}`}>
          {notice.text}
        </p>
      )}
      <div className="counter-grid">
        <MenuList items={menu} onAdd={handleAdd} />
        <OrderList
          items={order.items}
          submitting={submitting}
          onIncrement={order.add}
          onDecrement={order.decrement}
          onRemove={order.remove}
          onClear={order.clear}
          onSubmit={handleSubmit}
        />
      </div>
    </>
  )
}
