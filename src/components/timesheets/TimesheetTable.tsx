import type { TimesheetWithProject } from '../../types'

interface Props {
  timesheets: TimesheetWithProject[]
  onEdit: (t: TimesheetWithProject) => void
  onDelete: (id: string) => void
}

export function TimesheetTable({ timesheets, onEdit, onDelete }: Props) {
  if (timesheets.length === 0) {
    return <p class="text-base-content/50 py-8 text-center">No timesheet entries found.</p>
  }

  return (
    <div class="overflow-x-auto">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Project</th>
            <th>Complete</th>
            <th>AI Summary</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {timesheets.map((t) => (
            <tr key={t.id}>
              <td class="whitespace-nowrap">
                {new Date(t.date_memo).toLocaleDateString()}
              </td>
              <td class="max-w-xs">
                <span class="line-clamp-2">{t.description}</span>
              </td>
              <td>{t.projects?.project_name ?? <span class="text-base-content/30">—</span>}</td>
              <td>
                <input type="checkbox" class="checkbox checkbox-sm" checked={t.is_complete} disabled />
              </td>
              <td class="max-w-xs">
                {t.ai_summary ? (
                  <div class="tooltip" data-tip={t.ai_summary}>
                    <span class="line-clamp-1 text-sm text-base-content/60">{t.ai_summary}</span>
                  </div>
                ) : (
                  <span class="text-base-content/30">—</span>
                )}
              </td>
              <td class="flex gap-1">
                <button class="btn btn-ghost btn-xs" onClick={() => onEdit(t)}>
                  Edit
                </button>
                <button class="btn btn-ghost btn-xs text-error" onClick={() => onDelete(t.id)}>
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
