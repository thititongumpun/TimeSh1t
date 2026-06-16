// Promise-based confirm. window.confirm() is a no-op in Tauri's macOS WKWebView,
// so we mount a DaisyUI modal and resolve on the user's choice.
// ponytail: plain DOM instead of a Preact component — no mount point or state plumbing needed.
export function confirmDialog(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const root = document.createElement('div')
    root.className = 'modal modal-open'
    root.setAttribute('role', 'dialog')
    root.innerHTML = `
      <div class="modal-box max-w-sm">
        <p class="py-2"></p>
        <div class="modal-action">
          <button class="btn btn-ghost" data-act="cancel">Cancel</button>
          <button class="btn btn-error" data-act="ok">Delete</button>
        </div>
      </div>
      <div class="modal-backdrop" data-act="cancel"></div>`
    root.querySelector('p')!.textContent = message

    function close(result: boolean) {
      root.remove()
      resolve(result)
    }
    root.addEventListener('click', (e) => {
      const act = (e.target as HTMLElement).closest('[data-act]')?.getAttribute('data-act')
      if (act === 'ok') close(true)
      else if (act === 'cancel') close(false)
    })
    document.body.appendChild(root)
  })
}
