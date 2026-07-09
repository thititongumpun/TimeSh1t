import type { Holiday } from '../types'

// ponytail: hardcoded R2 URL; move to VITE_HOLIDAYS_URL only if it must differ per env.
// Update holidays = re-upload holidays.json (array of { date, name }) to the R2 bucket. No rebuild.
const HOLIDAYS_URL =
  'https://pub-5c0c8cf0929a4656bf8c7b2ac4279feb.r2.dev/holidays.json'

export async function fetchHolidays(): Promise<{ data: Holiday[] | null; error: Error | null }> {
  try {
    const res = await fetch(HOLIDAYS_URL)
    if (!res.ok) return { data: null, error: new Error(`HTTP ${res.status}`) }
    return { data: await res.json(), error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}
