import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as api from '../api/client'
import { CounterView } from '../components/CounterView'

const MENU = ['Pasta', 'Burger', 'Pizza']

describe('CounterView', () => {
  beforeEach(() => {
    vi.spyOn(api, 'fetchMenu').mockResolvedValue(MENU)
  })

  it('shows the menu and an empty order', async () => {
    render(<CounterView />)
    expect(await screen.findByRole('button', { name: 'Add Pasta' })).toBeInTheDocument()
    expect(screen.getByText(/No items yet/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit to kitchen' })).toBeDisabled()
  })

  it('adds items and adjusts quantities', async () => {
    const user = userEvent.setup()
    render(<CounterView />)

    await user.click(await screen.findByRole('button', { name: 'Add Pasta' }))
    await user.click(screen.getByRole('button', { name: 'Add Pasta' }))
    expect(screen.getByLabelText('Pasta quantity')).toHaveTextContent('2')

    await user.click(screen.getByRole('button', { name: 'Decrease Pasta' }))
    expect(screen.getByLabelText('Pasta quantity')).toHaveTextContent('1')

    await user.click(screen.getByRole('button', { name: 'Decrease Pasta' }))
    expect(screen.queryByLabelText('Pasta quantity')).not.toBeInTheDocument()
  })

  it('submits the order and clears it on success', async () => {
    const user = userEvent.setup()
    const submit = vi.spyOn(api, 'submitOrder').mockResolvedValue({
      id: 7,
      items: [{ name: 'Burger', quantity: 2 }],
      status: 'submitted',
      createdAt: new Date().toISOString(),
    })
    render(<CounterView />)

    await user.click(await screen.findByRole('button', { name: 'Add Burger' }))
    await user.click(screen.getByRole('button', { name: 'Increase Burger' }))
    await user.click(screen.getByRole('button', { name: 'Submit to kitchen' }))

    expect(submit).toHaveBeenCalledWith([{ name: 'Burger', quantity: 2 }])
    expect(await screen.findByRole('status')).toHaveTextContent('Order #7 sent to kitchen.')
    const orderPanel = screen.getByRole('region', { name: 'Current order' })
    expect(within(orderPanel).getByText(/No items yet/)).toBeInTheDocument()
  })

  it('keeps the order and shows an error when submission fails', async () => {
    const user = userEvent.setup()
    vi.spyOn(api, 'submitOrder').mockRejectedValue(new api.ApiError('Kitchen offline', 500))
    render(<CounterView />)

    await user.click(await screen.findByRole('button', { name: 'Add Pizza' }))
    await user.click(screen.getByRole('button', { name: 'Submit to kitchen' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Kitchen offline')
    expect(screen.getByLabelText('Pizza quantity')).toHaveTextContent('1')
  })

  it('shows an error when the menu fails to load', async () => {
    vi.mocked(api.fetchMenu).mockRejectedValue(new Error('Network down'))
    render(<CounterView />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Network down')
  })
})
