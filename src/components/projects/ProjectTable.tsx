import type { Project } from '../../types'

interface Props {
  projects: Project[]
  onEdit: (p: Project) => void
  onDelete: (id: string) => void
}

export function ProjectTable({ projects, onEdit, onDelete }: Props) {
  if (projects.length === 0) {
    return <p class="text-base-content/50 py-8 text-center">No projects yet.</p>
  }

  return (
    <div class="overflow-x-auto">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>Project No.</th>
            <th>Project Name</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id}>
              <td>{p.project_no}</td>
              <td>{p.project_name}</td>
              <td>
                <span class={`badge ${p.is_active ? 'badge-success' : 'badge-ghost'}`}>
                  {p.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>{new Date(p.inserted_at).toLocaleDateString()}</td>
              <td class="flex gap-1">
                <button class="btn btn-ghost btn-xs" onClick={() => onEdit(p)}>
                  Edit
                </button>
                <button class="btn btn-ghost btn-xs text-error" onClick={() => onDelete(p.id)}>
                  Del
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
