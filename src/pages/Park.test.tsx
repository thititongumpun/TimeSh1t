import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/preact'
import type { Vehicle } from '../types'

const { mockListen, mockUnlisten } = vi.hoisted(() => ({
  mockListen: vi.fn(),
  mockUnlisten: vi.fn(),
}))

vi.mock('@tauri-apps/api/event', () => ({ listen: mockListen }))
vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn().mockResolvedValue(undefined) }))
vi.mock('@tauri-apps/plugin-clipboard-manager', () => ({ writeText: vi.fn().mockResolvedValue(undefined) }))

const vehicle: Vehicle = {
  id: 'v1',
  user_id: 'u1',
  vehicle_type: 'car',
  license_plate: 'ABC1234',
  is_default: true,
  inserted_at: '2026-01-01T00:00:00Z',
}

vi.mock('../services/vehicles', () => ({
  fetchVehicles: vi.fn().mockResolvedValue({ data: [vehicle], error: null }),
  createVehicle: vi.fn(),
  deleteVehicle: vi.fn(),
  setDefaultVehicle: vi.fn(),
}))

// `isTauri` is read from `window` at module-eval time, so the flag must be set
// before Park.tsx is first imported — a dynamic import() after the mocks and
// the flag are both in place guarantees that ordering.
;(window as any).__TAURI_INTERNALS__ = {}

describe('Park park-filled listener', () => {
  it('registers the listener once across multiple sends and unlistens on unmount', async () => {
    mockListen.mockResolvedValue(mockUnlisten)

    const { Park } = await import('./Park')
    const { unmount } = render(<Park />)

    // Mount effect registers the listener exactly once, up front.
    await waitFor(() => expect(mockListen).toHaveBeenCalledTimes(1))
    expect(mockListen).toHaveBeenCalledWith('park-filled', expect.any(Function))
    const onParkFilled = mockListen.mock.calls[0][1]

    fireEvent.input(screen.getByLabelText(/card no/i), { target: { value: '123' } })
    const sendButton = await screen.findByRole('button', { name: /send to msync/i })
    await waitFor(() => expect(sendButton).not.toBeDisabled())

    // First send.
    fireEvent.click(sendButton)
    await waitFor(() => expect(sendButton).toBeDisabled())
    onParkFilled({ payload: '123' }) // simulate Rust emitting park-filled
    await waitFor(() => expect(sendButton).not.toBeDisabled())

    // Second send — must reuse the same listener, not register a new one.
    fireEvent.click(sendButton)
    await waitFor(() => expect(sendButton).toBeDisabled())
    onParkFilled({ payload: '123' })
    await waitFor(() => expect(sendButton).not.toBeDisabled())

    expect(mockListen).toHaveBeenCalledTimes(1)

    unmount()
    await waitFor(() => expect(mockUnlisten).toHaveBeenCalledTimes(1))
  })
})
