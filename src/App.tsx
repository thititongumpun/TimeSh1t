import { useEffect } from 'preact/hooks'
import { LocationProvider, Router, Route } from 'preact-iso'
import type { User } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { currentUser, authLoading, approved } from './store/auth'
import { refreshUser, getMyApproval } from './services/auth'
import { startPresence, stopPresence, updatePresence, type OnlineUser } from './store/presence'
import { Login } from './pages/Login'
import { PendingApproval } from './pages/PendingApproval'
import { Home } from './pages/Home'
import { Projects } from './pages/Projects'
import { Archived } from './pages/Archived'
import { Holiday } from './pages/Holiday'
import { Notes } from './pages/Notes'
import { Ask } from './pages/Ask'
import { JiraAssistant } from './pages/JiraAssistant'
import { Timeline } from './pages/Timeline'
import { Park } from './pages/Park'
import { Layout } from './components/Layout'

function toOnlineUser(user: User): OnlineUser {
  return {
    email: user.email ?? 'unknown',
    name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? (user.email ?? 'unknown').split('@')[0],
    avatar: user.user_metadata?.avatar_url,
  }
}

export function App() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null
      currentUser.value = user
      authLoading.value = false
      if (user) {
        // defer to dodge the Supabase deadlock warning about awaiting inside this callback.
        // fail closed: any error or missing row → not approved. Presence only starts once
        // approved — unapproved signups must not show up in the online-users list.
        setTimeout(() => {
          getMyApproval().then(({ data, error }) => {
            const ok = !error && data?.approved === true
            approved.value = ok
            if (!ok) { stopPresence(); return }
            startPresence(toOnlineUser(user))
            // getUser() returns fresh metadata → re-broadcast it to presence
            refreshUser().then(({ data }) => data?.user && updatePresence(toOnlineUser(data.user)))
          })
        }, 0)
      } else {
        stopPresence()
        approved.value = null
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  if (authLoading.value) {
    return (
      <div class="min-h-screen flex items-center justify-center bg-base-100">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  if (!currentUser.value) {
    return <Login />
  }

  if (approved.value === null) {
    return (
      <div class="min-h-screen flex items-center justify-center bg-base-100">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  if (approved.value === false) {
    return <PendingApproval />
  }

  return (
    <LocationProvider>
      <Layout>
        <Router>
          <Route path="/" component={Home} />
          <Route path="/projects" component={Projects} />
          <Route path="/archived" component={Archived} />
          <Route path="/holiday" component={Holiday} />
          <Route path="/notes" component={Notes} />
          <Route path="/ask" component={Ask} />
          <Route path="/jira" component={JiraAssistant} />
          <Route path="/timeline" component={Timeline} />
          <Route path="/park" component={Park} />
        </Router>
      </Layout>
    </LocationProvider>
  )
}

export default App
