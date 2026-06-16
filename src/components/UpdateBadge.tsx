import { useEffect, useState } from 'preact/hooks'
import { check, type Update } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'

export function UpdateBadge() {
  const [update, setUpdate] = useState<Update | null>(null)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    check().then(setUpdate).catch(() => {})
  }, [])

  if (!update) return null

  async function install() {
    if (!update) return
    setInstalling(true)
    try {
      await update.downloadAndInstall()
      await relaunch()
    } catch {
      setInstalling(false)
    }
  }

  return (
    <button
      class="btn btn-primary btn-sm fixed right-4 top-4 z-50 shadow-lg"
      disabled={installing}
      onClick={install}
    >
      {installing && <span class="loading loading-spinner loading-xs" />}
      Update to {update.version}
    </button>
  )
}
