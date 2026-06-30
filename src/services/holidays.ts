import type { Holiday } from '../types'

// ponytail: hardcoded gist raw URL; move to VITE_HOLIDAYS_URL only if it must differ per env.
// Update holidays = edit the gist's holidays.json (array of { date, name }). No rebuild.
const HOLIDAYS_URL =
  'https://gist.githubusercontent.com/thititongumpun/261e2fa32ac09d59d2e8bab2b54b5b3f/raw/holidays.json'

export async function fetchHolidays(): Promise<{ data: Holiday[] | null; error: Error | null }> {
  try {
    const res = await fetch(HOLIDAYS_URL)
    if (!res.ok) return { data: null, error: new Error(`HTTP ${res.status}`) }
    return { data: await res.json(), error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}
