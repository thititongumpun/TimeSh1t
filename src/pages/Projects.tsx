import { useState, useEffect } from 'preact/hooks'
import { fetchProjects, deleteProject } from '../services/projects'
import { ProjectTable } from '../components/projects/ProjectTable'
import { ProjectModal } from '../components/projects/ProjectModal'
import { confirmDialog } from '../lib/confirm'
import type { Project } from '../types'

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    const { data, error } = await fetchProjects()
    if (error) setError(error.message)
    else setProjects((data as Project[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function handleEdit(p: Project) {
    setEditingProject(p)
    setModalOpen(true)
  }

  async function handleDelete(id: string) {
    if (!(await confirmDialog('Delete this project?'))) return
    const { error } = await deleteProject(id)
    if (error) setError(error.message)
    else load()
  }

  function handleModalClose() {
    setModalOpen(false)
    setEditingProject(null)
    load()
  }

  return (
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Projects</h1>
        <button class="btn btn-primary btn-circle text-xl" onClick={() => setModalOpen(true)}>
          +
        </button>
      </div>
      {error && (
        <div class="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}
      {loading ? (
        <div class="flex justify-center py-8">
          <span class="loading loading-spinner loading-md" />
        </div>
      ) : (
        <ProjectTable projects={projects} onEdit={handleEdit} onDelete={handleDelete} />
      )}
      {modalOpen && <ProjectModal project={editingProject} onClose={handleModalClose} />}
    </div>
  )
}
