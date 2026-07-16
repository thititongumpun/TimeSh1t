import { signal } from '@preact/signals'
import type { User } from '@supabase/supabase-js'

export const currentUser = signal<User | null>(null)
export const authLoading = signal<boolean>(true)
export const approved = signal<boolean | null>(null) // null = not yet checked
