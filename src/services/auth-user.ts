import { supabase } from '../lib/supabase'

export async function getAuthenticatedUserId() {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw new Error(error.message)
  }

  if (!data.user) {
    throw new Error('You must be signed in to save data.')
  }

  return data.user.id
}
