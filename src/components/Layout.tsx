import type { ComponentChildren } from 'preact'
import { Sidebar } from './Sidebar'
import { UpdateBadge } from './UpdateBadge'

interface LayoutProps {
  children: ComponentChildren
}

export function Layout({ children }: LayoutProps) {
  return (
    <div class="flex h-screen overflow-hidden bg-base-100">
      <UpdateBadge />
      <Sidebar />
      <main class="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
