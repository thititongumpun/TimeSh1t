import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetUser = vi.hoisted(() => vi.fn())
vi.mock('../lib/supabase', () => ({
  supabase: { auth: { getUser: mockGetUser } },
}))

import { getAuthenticatedUserId } from './auth-user'

describe('getAuthenticatedUserId', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns the authenticated Supabase user id', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    await expect(getAuthenticatedUserId()).resolves.toBe('user-1')
  })

  it('throws when there is no authenticated user', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    await expect(getAuthenticatedUserId()).rejects.toThrow(
      'You must be signed in to save data.',
    )
  })
})
