import { supabase } from '../lib/supabase'
import type { VehicleInput } from '../types'

export async function fetchVehicles() {
  return supabase.from('vehicles').select('*').order('inserted_at')
}

export async function createVehicle(data: VehicleInput) {
  return supabase.from('vehicles').insert(data).select().single()
}

export async function deleteVehicle(id: string) {
  return supabase.from('vehicles').delete().eq('id', id)
}

// One default overall: clear all of the user's defaults (RLS scopes the update), then set one.
export async function setDefaultVehicle(id: string) {
  const cleared = await supabase.from('vehicles').update({ is_default: false }).eq('is_default', true)
  if (cleared.error) return cleared
  return supabase.from('vehicles').update({ is_default: true }).eq('id', id)
}
