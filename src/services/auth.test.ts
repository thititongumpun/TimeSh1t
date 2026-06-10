import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
    },
  },
}))

import { supabase } from '../lib/supabase'
import { signIn, signOut, getSession } from './auth'
import { currentUser, authLoading } from '../store/auth'

describe('auth service', () => {
  beforeEach(() => {
    currentUser.value = null
    authLoading.value = true
    vi.clearAllMocks()
  })

  it('signIn sets currentUser on success', async () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: mockUser, session: {} },
      error: null,
    } as any)

    await signIn('test@example.com', 'password')
    expect(currentUser.value).toEqual(mockUser)
  })

  it('signIn returns error without setting currentUser on failure', async () => {
    const mockError = { message: 'Invalid credentials' }
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: mockError,
    } as any)

    const { error } = await signIn('bad@example.com', 'wrong')
    expect(error).toEqual(mockError)
    expect(currentUser.value).toBeNull()
  })

  it('signOut clears currentUser on success', async () => {
    currentUser.value = { id: '123' } as any
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null })

    await signOut()
    expect(currentUser.value).toBeNull()
  })

  it('getSession sets currentUser from active session', async () => {
    const mockUser = { id: '456' }
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    } as any)

    await getSession()
    expect(currentUser.value).toEqual(mockUser)
  })

  it('getSession leaves currentUser null when no session', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as any)

    await getSession()
    expect(currentUser.value).toBeNull()
  })
})
