import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import * as api from '../api/client'
import { KitchenView } from '../components/KitchenView'

describe('KitchenView', () => {
  it('lists submitted orders', async () => {
    vi.spyOn(api, 'fetchOrders').mockResolvedValue([
      {
        id: 2,
        items: [{ name: 'Noodle', quantity: 3 }],
        status: 'submitted',
        createdAt: '2026-11-26T01:00:00.000Z',
      },
    ])
    render(<KitchenView />)
    expect(await screen.findByText('Order #2')).toBeInTheDocument()
    expect(screen.getByText('Noodle')).toBeInTheDocument()
  })

  it('shows an empty state', async () => {
    vi.spyOn(api, 'fetchOrders').mockResolvedValue([])
    render(<KitchenView />)
    expect(await screen.findByText('No orders yet.')).toBeInTheDocument()
  })
})
