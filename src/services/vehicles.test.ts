import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockFrom } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
}))
vi.mock('../lib/supabase', () => ({
  supabase: { from: mockFrom },
}))

import { fetchVehicles, createVehicle, deleteVehicle, setDefaultVehicle } from './vehicles'

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

describe('vehicles service', () => {
  beforeEach(() => {
    mockFrom.mockReset()
  })

  it('fetchVehicles selects ordered by inserted_at', async () => {
    const chain = makeChain({ data: [], error: null })
    mockFrom.mockReturnValue(chain)

    await fetchVehicles()

    expect(mockFrom).toHaveBeenCalledWith('vehicles')
    expect(chain.select).toHaveBeenCalledWith('*')
    expect(chain.order).toHaveBeenCalledWith('inserted_at')
  })

  it('createVehicle inserts and returns single row', async () => {
    const chain = makeChain({ data: { id: '1' }, error: null })
    mockFrom.mockReturnValue(chain)

    await createVehicle({ vehicle_type: 'car', license_plate: '6ขค5101', is_default: true })

    expect(chain.insert).toHaveBeenCalledWith({
      vehicle_type: 'car',
      license_plate: '6ขค5101',
      is_default: true,
    })
    expect(chain.single).toHaveBeenCalled()
  })

  it('deleteVehicle deletes by id', async () => {
    const chain = makeChain({ data: null, error: null })
    mockFrom.mockReturnValue(chain)

    await deleteVehicle('1')

    expect(chain.delete).toHaveBeenCalled()
    expect(chain.eq).toHaveBeenCalledWith('id', '1')
  })

  it('setDefaultVehicle clears old default then sets the new one', async () => {
    const chain = makeChain({ data: null, error: null })
    mockFrom.mockReturnValue(chain)

    await setDefaultVehicle('2')

    expect(chain.update).toHaveBeenNthCalledWith(1, { is_default: false })
    expect(chain.eq).toHaveBeenNthCalledWith(1, 'is_default', true)
    expect(chain.update).toHaveBeenNthCalledWith(2, { is_default: true })
    expect(chain.eq).toHaveBeenNthCalledWith(2, 'id', '2')
  })
})
