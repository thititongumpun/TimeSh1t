import { useRef, useEffect, useState } from 'preact/hooks'
import { Calendar } from 'vanilla-calendar-pro'
import 'vanilla-calendar-pro/styles/index.css' // DaisyUI v4 doesn't auto-style .vc (that's v5), so ship the lib's own CSS
import { fetchHolidays } from '../services/holidays'
import type { Holiday as HolidayType } from '../types'

export function Holiday() {
  const ref = useRef<HTMLDivElement>(null)
  const calRef = useRef<Calendar | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [holidays, setHolidays] = useState<HolidayType[]>([])

  // click a table date → jump the calendar to that month (date is "YYYY-MM-DD")
  const jumpTo = (date: string) => {
    const [year, month] = date.split('-').map(Number)
    calRef.current?.set({
      selectedYear: year,
      selectedMonth: (month - 1) as never,
      selectedDates: [date],
    })
  }

  useEffect(() => {
    fetchHolidays().then(({ data, error }) => {
      setLoading(false)
      if (error) return setError(error.message)
      const list = data ?? []
      setHolidays(list)
      if (!ref.current) return
      const cal = new Calendar(ref.current, {
        // highlight every gist date (adds data-vc-date-holiday → styled by the lib)
        selectedHolidays: list.map((h) => h.date),
        // click/hover a highlighted date → show its holiday name
        popups: Object.fromEntries(list.map((h) => [h.date, { html: h.name }])),
      })
      cal.init()
      calRef.current = cal
    })
    return () => calRef.current?.destroy()
  }, [])

  return (
    <div>
      <header class="flex items-end justify-between gap-4 mb-6">
        <div>
          <h1 class="font-display font-bold text-2xl">Holiday</h1>
          <p class="text-sm opacity-60 font-mono">{loading ? 'loading…' : `${holidays.length} holiday${holidays.length === 1 ? '' : 's'}`}</p>
        </div>
      </header>

      {error && (
        <div class="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}
      {loading && (
        <div class="flex justify-center py-8">
          <span class="loading loading-spinner loading-md" />
        </div>
      )}

      {/* always mounted so ref.current exists when fetch resolves and inits the calendar */}
      <div class="card border-2 border-base-300 mb-6">
        <div class="card-body p-4">
          {/* min-h reserves vanilla-calendar-pro's real mounted height (verified from its
              shipped layout.css + default displayDatesOutside:true → fixed 6-week grid):
              2×1rem container padding + 44px header + 24px weekday row + 6×34px date rows = 304px */}
          <div ref={ref} class="min-h-[304px]" />
        </div>
      </div>

      {!loading && !error && holidays.length === 0 && (
        <div class="py-12 text-center">
          <p class="font-mono text-sm opacity-60">No holidays found.</p>
        </div>
      )}

      {holidays.length > 0 && (
        <div class="card overflow-x-auto border-2 border-base-300">
          <table class="table">
            <thead>
              <tr>
                <th class="w-40 text-xs uppercase tracking-wide opacity-60">Date</th>
                <th class="text-xs uppercase tracking-wide opacity-60">Holiday</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((h) => (
                <tr key={h.date} class="cursor-pointer hover:bg-base-200" onClick={() => jumpTo(h.date)}>
                  <td class="font-mono text-sm opacity-70 whitespace-nowrap">{h.date}</td>
                  <td>{h.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
