import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockFrom, mockGetAuthenticatedUserId } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockGetAuthenticatedUserId: vi.fn(),
}))
vi.mock('../lib/supabase', () => ({
  supabase: { from: mockFrom },
}))
vi.mock('./auth-user', () => ({
  getAuthenticatedUserId: mockGetAuthenticatedUserId,
}))

import { fetchProjects, fetchActiveProjects, createProject, updateProject, deleteProject } from './projects'

function makeChain(result: any) {
  const chain: any = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue(result),
    single: vi.fn().mockResolvedValue(result),
  }
  return chain
}

describe('projects service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAuthenticatedUserId.mockResolvedValue('user-1')
  })

  it('fetchProjects queries the projects table ordered by inserted_at desc', async () => {
    const chain = makeChain({ data: [], error: null })
    mockFrom.mockReturnValue(chain)

    await fetchProjects()

    expect(mockFrom).toHaveBeenCalledWith('projects')
    expect(chain.select).toHaveBeenCalledWith('*')
    expect(chain.order).toHaveBeenCalledWith('inserted_at', { ascending: false })
  })

  it('fetchActiveProjects filters by is_active = true', async () => {
    const chain = makeChain({ data: [], error: null })
    mockFrom.mockReturnValue(chain)

    await fetchActiveProjects()

    expect(chain.eq).toHaveBeenCalledWith('is_active', true)
  })

  it('createProject inserts and returns single row', async () => {
    const chain = makeChain({ data: { id: '1' }, error: null })
    mockFrom.mockReturnValue(chain)

    await createProject({ project_no: 'P001', project_name: 'Alpha', is_active: true })

    expect(mockGetAuthenticatedUserId).toHaveBeenCalled()
    expect(chain.insert).toHaveBeenCalledWith({
      project_no: 'P001',
      project_name: 'Alpha',
      is_active: true,
      user_id: 'user-1',
    })
    expect(chain.single).toHaveBeenCalled()
  })

  it('does not insert a project when there is no authenticated user', async () => {
    const chain = makeChain({ data: null, error: null })
    mockFrom.mockReturnValue(chain)
    mockGetAuthenticatedUserId.mockRejectedValue(
      new Error('You must be signed in to save data.'),
    )

    await expect(createProject({
      project_no: 'P001',
      project_name: 'Alpha',
      is_active: true,
    })).rejects.toThrow('You must be signed in to save data.')

    expect(chain.insert).not.toHaveBeenCalled()
  })

  it('updateProject applies update by id', async () => {
    const chain = makeChain({ data: { id: '1' }, error: null })
    mockFrom.mockReturnValue(chain)

    await updateProject('1', { project_name: 'Beta' })

    expect(chain.update).toHaveBeenCalledWith({ project_name: 'Beta' })
    expect(chain.eq).toHaveBeenCalledWith('id', '1')
  })

  it('deleteProject deletes by id', async () => {
    const chain = makeChain({ data: null, error: null })
    mockFrom.mockReturnValue(chain)

    await deleteProject('1')

    expect(chain.delete).toHaveBeenCalled()
    expect(chain.eq).toHaveBeenCalledWith('id', '1')
  })
})
