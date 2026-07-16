import { describe, it, expect } from 'vitest'
import { periodRange, projectOptions, filterByProject, NO_PROJECT } from './Archived'
import type { TimesheetWithProject } from '../types'

function row(id: string, projectName: string | null): TimesheetWithProject {
  return {
    id,
    user_id: 'u',
    date_memo: '2026-01-01',
    description: 'd',
    project_id: projectName ? 'p' : null,
    inserted_at: '2026-01-01',
    is_complete: false,
    ai_summary: null,
    start_time: null,
    end_time: null,
    projects: projectName ? { project_name: projectName, project_no: '1' } : null,
  }
}

describe('periodRange (26th→25th cutoff)', () => {
  it('Jan–Mar 2026 spans 26 Dec 2025 to 25 Mar 2026', () => {
    expect(periodRange('2026-01', '2026-03')).toEqual({ from: '2025-12-26', to: '2026-03-25' })
  })

  it('single month covers prev-26th to this-25th', () => {
    expect(periodRange('2026-06', '2026-06')).toEqual({ from: '2026-05-26', to: '2026-06-25' })
  })

  it('handles year rollover for January start', () => {
    expect(periodRange('2026-01', '2026-01')).toEqual({ from: '2025-12-26', to: '2026-01-25' })
  })
})

describe('project filter', () => {
  const rows = [row('1', 'Zeta'), row('2', 'Alpha'), row('3', null), row('4', 'Alpha')]

  it('projectOptions returns distinct names sorted, with NO_PROJECT last when unassigned rows exist', () => {
    expect(projectOptions(rows)).toEqual(['Alpha', 'Zeta', NO_PROJECT])
  })

  it('projectOptions omits NO_PROJECT when every row has a project', () => {
    expect(projectOptions([row('1', 'Zeta'), row('2', 'Alpha')])).toEqual(['Alpha', 'Zeta'])
  })

  it('filterByProject returns all rows when filter is empty', () => {
    expect(filterByProject(rows, '')).toEqual(rows)
  })

  it('filterByProject matches by project name', () => {
    expect(filterByProject(rows, 'Alpha').map((r) => r.id)).toEqual(['2', '4'])
  })

  it('filterByProject with NO_PROJECT matches rows without a project', () => {
    expect(filterByProject(rows, NO_PROJECT).map((r) => r.id)).toEqual(['3'])
  })
})
