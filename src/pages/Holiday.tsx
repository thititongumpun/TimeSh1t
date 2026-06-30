import { useRef, useEffect, useState } from 'preact/hooks'
import { Calendar } from 'vanilla-calendar-pro'
import 'vanilla-calendar-pro/styles/index.css' // DaisyUI v4 doesn't auto-style .vc (that's v5), so ship the lib's own CSS
import { fetchHolidays } from '../services/holidays'
import type { Holiday as HolidayType } from '../types'

export function Holiday() {
  const ref = useRef<HTMLDivElement>(null)
  const [holidays, setHolidays] = useState<HolidayType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cal: Calendar | null = null
    fetchHolidays().then(({ data, error }) => {
      setLoading(false)
      if (error) return setError(error.message)
      const list = (data ?? []).slice().sort((a, b) => a.date.localeCompare(b.date))
      setHolidays(list)
      const popups = Object.fromEntries(
        list.map((h) => [
          h.date,
          { modifier: 'bg-error text-error-content rounded-full', html: h.name },
        ])
      )
      if (!ref.current) return
      cal = new Calendar(ref.current, { popups })
      cal.init()
    })
    return () => cal?.destroy()
  }, [])

  return (
    <div>
      <h1 class="text-2xl font-bold mb-4">Holiday</h1>
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
        <div class="flex flex-col gap-6 md:flex-row md:items-start">
          <div ref={ref} />
          <ul class="menu bg-base-200 rounded-box w-full md:w-96">
            <li class="menu-title">Holidays</li>
            {holidays.length === 0 && <li class="px-4 py-2 text-base-content/50">No holidays found.</li>}
            {holidays.map((h) => (
              <li key={h.date}>
                <div class="flex justify-between">
                  <span>{h.name}</span>
                  <span class="text-base-content/60 whitespace-nowrap">
                    {new Date(h.date).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
