import { useState } from 'preact/hooks'
import { createProject, updateProject } from '../../services/projects'
import type { Project, ProjectInput } from '../../types'

interface Props {
  project: Project | null
  onClose: () => void
}

export function ProjectModal({ project, onClose }: Props) {
  const [projectNo, setProjectNo] = useState(project?.project_no ?? '')
  const [projectName, setProjectName] = useState(project?.project_name ?? '')
  const [isActive, setIsActive] = useState(project?.is_active ?? true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: Event) {
    e.preventDefault()
    const trimmedNo = projectNo.trim()
    const trimmedName = projectName.trim()
    if (!trimmedNo || !trimmedName) {
      setError('Project No. and Project Name are required.')
      return
    }
    setLoading(true)
    setError(null)
    const payload: ProjectInput = { project_no: trimmedNo, project_name: trimmedName, is_active: isActive }
    const { error } = project
      ? await updateProject(project.id, payload)
      : await createProject(payload)
    if (error) setError(error.message)
    else onClose()
    setLoading(false)
  }

  return (
    <dialog class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">{project ? 'Edit Project' : 'New Project'}</h3>
        <form onSubmit={handleSubmit}>
          {error && (
            <div class="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}
          <div class="form-control mb-3">
            <label class="label" for="project_no">
              <span class="label-text">Project No.</span>
            </label>
            <input
              id="project_no"
              type="text"
              class="input input-bordered"
              value={projectNo}
              onInput={(e) => setProjectNo(e.currentTarget.value)}
              required
            />
          </div>
          <div class="form-control mb-3">
            <label class="label" for="project_name">
              <span class="label-text">Project Name</span>
            </label>
            <input
              id="project_name"
              type="text"
              class="input input-bordered"
              value={projectName}
              onInput={(e) => setProjectName(e.currentTarget.value)}
              required
            />
          </div>
          <div class="form-control mb-4">
            <label class="label cursor-pointer">
              <span class="label-text">Active</span>
              <input
                type="checkbox"
                class="toggle toggle-primary"
                checked={isActive}
                onChange={(e) => setIsActive(e.currentTarget.checked)}
              />
            </label>
          </div>
          <div class="modal-action">
            <button type="button" class="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              disabled={loading}
            >
              {loading && <span class="loading loading-spinner loading-xs mr-2" />}
              {project ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
      <div class="modal-backdrop" onClick={onClose} />
    </dialog>
  )
}
