import type { TimesheetFilters, Project } from '../../types'

interface Props {
  filters: TimesheetFilters
  projects: Project[]
  onChange: (filters: TimesheetFilters) => void
}

export function TimesheetFilters({ filters, projects, onChange }: Props) {
  return (
    <div class="flex flex-wrap gap-4 mb-4 items-end">
      <div class="form-control">
        <label class="label" for="date_from">
          <span class="label-text">From</span>
        </label>
        <input
          id="date_from"
          type="date"
          class="input input-bordered input-sm"
          value={filters.date_from ?? ''}
          onInput={(e) => onChange({ ...filters, date_from: e.currentTarget.value || null })}
        />
      </div>
      <div class="form-control">
        <label class="label" for="date_to">
          <span class="label-text">To</span>
        </label>
        <input
          id="date_to"
          type="date"
          class="input input-bordered input-sm"
          value={filters.date_to ?? ''}
          onInput={(e) => onChange({ ...filters, date_to: e.currentTarget.value || null })}
        />
      </div>
      <div class="form-control">
        <label class="label" for="project_filter">
          <span class="label-text">Project</span>
        </label>
        <select
          id="project_filter"
          class="select select-bordered select-sm"
          value={filters.project_id ?? ''}
          onChange={(e) => onChange({ ...filters, project_id: e.currentTarget.value || null })}
        >
          <option value="">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.project_name}
            </option>
          ))}
        </select>
      </div>
      <div class="form-control">
        <label class="label" for="status_filter">
          <span class="label-text">Status</span>
        </label>
        <select
          id="status_filter"
          class="select select-bordered select-sm"
          value={filters.status}
          onChange={(e) =>
            onChange({ ...filters, status: e.currentTarget.value as TimesheetFilters['status'] })
          }
        >
          <option value="all">All</option>
          <option value="complete">Complete</option>
          <option value="incomplete">Incomplete</option>
        </select>
      </div>
    </div>
  )
}
