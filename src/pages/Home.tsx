import { useState, useEffect } from 'preact/hooks'
import { fetchTimesheets, deleteTimesheet } from '../services/timesheets'
import { fetchActiveProjects } from '../services/projects'
import { TimesheetTable } from '../components/timesheets/TimesheetTable'
import { TimesheetFilters } from '../components/timesheets/TimesheetFilters'
import { TimesheetModal } from '../components/timesheets/TimesheetModal'
import type { TimesheetWithProject, TimesheetFilters as Filters, Project } from '../types'

function defaultFilters(): Filters {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    date_from: firstDay.toISOString().slice(0, 10),
    date_to: lastDay.toISOString().slice(0, 10),
    project_id: null,
    status: 'all',
  }
}

export function Home() {
  const [timesheets, setTimesheets] = useState<TimesheetWithProject[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [filters, setFilters] = useState<Filters>(defaultFilters())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTimesheet, setEditingTimesheet] = useState<TimesheetWithProject | null>(null)

  async function loadTimesheets() {
    setLoading(true)
    const { data, error } = await fetchTimesheets(filters)
    if (error) setError(error.message)
    else setTimesheets((data as TimesheetWithProject[]) ?? [])
    setLoading(false)
  }

  async function loadProjects() {
    const { data } = await fetchActiveProjects()
    setProjects((data as Project[]) ?? [])
  }

  useEffect(() => { loadProjects() }, [])
  useEffect(() => { loadTimesheets() }, [filters])

  function handleEdit(t: TimesheetWithProject) {
    setEditingTimesheet(t)
    setModalOpen(true)
  }

  async function handleDelete(id: string) {
    const { error } = await deleteTimesheet(id)
    if (error) setError(error.message)
    else loadTimesheets()
  }

  function handleModalClose() {
    setModalOpen(false)
    setEditingTimesheet(null)
    loadTimesheets()
  }

  return (
    <div>
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold">Timesheets</h1>
        <button
          class="btn btn-primary btn-circle text-xl"
          onClick={() => setModalOpen(true)}
        >
          +
        </button>
      </div>
      {error && (
        <div class="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}
      <TimesheetFilters filters={filters} projects={projects} onChange={setFilters} />
      {loading ? (
        <div class="flex justify-center py-8">
          <span class="loading loading-spinner loading-md" />
        </div>
      ) : (
        <TimesheetTable
          timesheets={timesheets}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      {modalOpen && (
        <TimesheetModal
          timesheet={editingTimesheet}
          projects={projects}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}
