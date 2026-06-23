import { supabase } from '../lib/supabase'
import type { ProjectInput } from '../types'

export async function fetchProjects() {
  return supabase.from('projects').select('*').order('inserted_at', { ascending: false })
}

export async function fetchActiveProjects() {
  return supabase.from('projects').select('*').eq('is_active', true).order('project_name')
}

export async function createProject(data: ProjectInput) {
  // ponytail: projects are shared across all users — no user_id on insert
  return supabase.from('projects').insert(data).select().single()
}

export async function updateProject(id: string, data: Partial<ProjectInput>) {
  return supabase.from('projects').update(data).eq('id', id).select().single()
}

export async function deleteProject(id: string) {
  return supabase.from('projects').delete().eq('id', id)
}
