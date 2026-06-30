import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchHolidays } from './holidays'

afterEach(() => vi.restoreAllMocks())

describe('fetchHolidays', () => {
  it('returns parsed array on ok response', async () => {
    const holidays = [{ date: '2026-01-01', name: 'New Year' }]
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => holidays }))
    const { data, error } = await fetchHolidays()
    expect(error).toBeNull()
    expect(data).toEqual(holidays)
  })

  it('returns error on non-200', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }))
    const { data, error } = await fetchHolidays()
    expect(data).toBeNull()
    expect(error?.message).toContain('404')
  })

  it('returns error when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))
    const { data, error } = await fetchHolidays()
    expect(data).toBeNull()
    expect(error?.message).toBe('network down')
  })
})
