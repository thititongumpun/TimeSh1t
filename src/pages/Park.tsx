import { useEffect, useState } from 'preact/hooks'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { writeText } from '@tauri-apps/plugin-clipboard-manager'
import { MSYNC_PARK_URL } from '../lib/msync'
import { fetchVehicles, createVehicle, deleteVehicle, setDefaultVehicle } from '../services/vehicles'
import type { Vehicle } from '../types'

const isTauri = '__TAURI_INTERNALS__' in window

// Text the Msync carpark dropdown shows for each vehicle type.
const MSYNC_TYPE: Record<Vehicle['vehicle_type'], string> = {
  car: 'รถยนต์',
  motorcycle: 'มอเตอร์ไซต์',
}

const TYPE_ICON: Record<Vehicle['vehicle_type'], string> = {
  car: '🚗',
  motorcycle: '🏍️',
}

// One "Send to Msync" run that reached Submit — mirrors the Home fill log.
type ParkRun = { at: string; cardNo: string }

function readParkLog(): ParkRun[] {
  try { return JSON.parse(localStorage.getItem('park_fill_log') ?? '[]') } catch { return [] }
}

export function Park() {
  const [cardNo, setCardNo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [fillLog, setFillLog] = useState<ParkRun[]>(readParkLog)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [newType, setNewType] = useState<Vehicle['vehicle_type']>('car')
  const [newPlate, setNewPlate] = useState('')
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)

  // The vehicle sent to Msync: the default one, else the first.
  const selected = vehicles.find((v) => v.is_default) ?? vehicles[0] ?? null

  async function loadVehicles() {
    const { data, error } = await fetchVehicles()
    if (error) setError(error.message)
    else setVehicles(data ?? [])
  }

  useEffect(() => { loadVehicles() }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function addVehicle() {
    setSaving(true)
    setError(null)
    const { error } = await createVehicle({
      vehicle_type: newType,
      license_plate: newPlate.trim(),
      is_default: vehicles.length === 0, // first vehicle becomes the default
    })
    setSaving(false)
    if (error) setError(error.message)
    else {
      setNewPlate('')
      loadVehicles()
    }
  }

  async function removeVehicle(id: string) {
    const { error } = await deleteVehicle(id)
    if (error) setError(error.message)
    else loadVehicles()
  }

  async function makeDefault(id: string) {
    const { error } = await setDefaultVehicle(id)
    if (error) setError(error.message)
    else loadVehicles()
  }

  async function sendToMsync() {
    if (!selected) return
    setError(null)
    setSending(true)
    try {
      if (isTauri) {
        await writeText(cardNo) // clipboard fallback in case the autofill misses
        await invoke('open_park_window', {
          url: MSYNC_PARK_URL,
          cardNo,
          carType: MSYNC_TYPE[selected.vehicle_type],
          plate: selected.license_plate,
        })
        showToast('Msync opened — autofilling card ' + cardNo)
        // Fired by Rust once the fill script has clicked Submit.
        const unlisten = await listen<string>('park-filled', ({ payload: card }) => {
          unlisten()
          const log = [{ at: new Date().toISOString(), cardNo: card }, ...readParkLog()].slice(0, 50)
          localStorage.setItem('park_fill_log', JSON.stringify(log))
          setFillLog(log)
          showToast(`Card ${card} submitted in Msync`)
        })
      } else {
        await navigator.clipboard.writeText(cardNo)
        window.open(MSYNC_PARK_URL)
        showToast('Card no. copied — paste it in Msync')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to open Msync')
    } finally {
      setSending(false)
    }
  }

  return (
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold">Park</h1>
        <p class="text-sm opacity-60">Validate your carpark card in Msync — type the card no. and send.</p>
      </div>

      {error && (
        <div class="alert alert-error mb-4 max-w-4xl">
          <span>{error}</span>
        </div>
      )}

      <div class="grid gap-6 lg:grid-cols-2 max-w-4xl items-start">
        {/* Send card */}
        <div class="card bg-base-200 shadow-sm">
          <div class="card-body">
            <h2 class="card-title text-base">
              <span aria-hidden="true">🎫</span> Carpark card
            </h2>

            <fieldset class="fieldset">
              <label class="label" for="park-card-no">Card no.</label>
              <label class="otp otp-lg mx-auto">
                <span></span>
                <span></span>
                <span></span>
                <input
                  id="park-card-no"
                  type="text"
                  inputmode="numeric"
                  maxlength={3}
                  pattern="[0-9]{3}"
                  value={cardNo}
                  onInput={(e) => {
                    const digits = e.currentTarget.value.replace(/\D/g, '')
                    e.currentTarget.value = digits
                    setCardNo(digits)
                  }}
                />
              </label>
            </fieldset>

            <div class="card-actions mt-2">
              <button
                class="btn btn-accent btn-block"
                onClick={sendToMsync}
                disabled={!cardNo || !selected || sending}
              >
                {sending && <span class="loading loading-spinner loading-xs" />}
                Send to Msync
              </button>
            </div>
            <p class="text-xs opacity-60 text-center">
              {selected
                ? `Submits as ${TYPE_ICON[selected.vehicle_type]} ${selected.license_plate}`
                : 'Add a vehicle below to enable sending.'}
            </p>
          </div>
        </div>

        {/* Vehicles card */}
        <div class="card bg-base-200 shadow-sm">
          <div class="card-body">
            <h2 class="card-title text-base">
              <span aria-hidden="true">🚙</span> My vehicles
            </h2>

            {vehicles.length === 0 ? (
              <div class="alert alert-warning">
                <span>No vehicles yet — Msync needs a car type and license plate.</span>
              </div>
            ) : (
              <ul>
                {vehicles.map((v) => (
                  <li key={v.id} class="flex items-center gap-3 border-b border-base-300 py-2 last:border-none">
                    <input
                      type="radio"
                      name="default-vehicle"
                      class="radio radio-sm radio-accent"
                      checked={selected?.id === v.id}
                      onChange={() => makeDefault(v.id)}
                      aria-label={`Use ${v.license_plate}`}
                    />
                    <span class="text-xl" aria-hidden="true">{TYPE_ICON[v.vehicle_type]}</span>
                    <span class="flex-1">
                      <span class="font-medium">{v.license_plate}</span>
                      <span class="block text-xs opacity-60">{MSYNC_TYPE[v.vehicle_type]}</span>
                    </span>
                    {v.is_default && <span class="badge badge-accent badge-sm">default</span>}
                    <button
                      class="btn btn-ghost btn-xs text-error"
                      onClick={() => removeVehicle(v.id)}
                      aria-label={`Remove ${v.license_plate}`}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div class="join mt-2 w-full">
              <select
                class="select select-sm join-item w-32"
                value={newType}
                onInput={(e) => setNewType(e.currentTarget.value as Vehicle['vehicle_type'])}
              >
                <option value="car">รถยนต์</option>
                <option value="motorcycle">มอเตอร์ไซต์</option>
              </select>
              <input
                class="input input-sm join-item flex-1"
                placeholder="License plate"
                value={newPlate}
                onInput={(e) => setNewPlate(e.currentTarget.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && newPlate.trim() && !saving) addVehicle() }}
              />
              <button
                class="btn btn-sm btn-primary join-item"
                onClick={addVehicle}
                disabled={!newPlate.trim() || saving}
              >
                {saving && <span class="loading loading-spinner loading-xs" />}
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fill log */}
      {isTauri && fillLog.length > 0 && (
        <div class="card bg-base-200 shadow-sm mt-6 max-w-4xl">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <h2 class="card-title text-base">
                <span aria-hidden="true">🧾</span> Park fill log
                <span class="badge badge-ghost badge-sm">{fillLog.length}</span>
              </h2>
              <button
                class="btn btn-ghost btn-xs"
                onClick={() => {
                  localStorage.removeItem('park_fill_log')
                  setFillLog([])
                }}
              >
                Clear log
              </button>
            </div>
            <ul class="text-sm">
              {fillLog.map((run) => (
                <li key={run.at} class="flex justify-between border-b border-base-300 py-1 last:border-none">
                  <span class="font-mono">Card {run.cardNo}</span>
                  <span class="opacity-60">{new Date(run.at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {toast && (
        <div class="toast toast-end toast-bottom">
          <div class="alert alert-success" role="status">
            <span>{toast}</span>
          </div>
        </div>
      )}
    </div>
  )
}
