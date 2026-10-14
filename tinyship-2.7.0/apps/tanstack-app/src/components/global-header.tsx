import { siteCopy } from '@/lib/site-copy'
import { authClientReact } from '@libs/auth/authClient'
import { useState } from 'react'
import { useLocation } from '@tanstack/react-router'
import { authCopy } from '@/lib/auth-copy'
import { safeReturnTo } from '@/lib/auth-navigation'
import { toast } from 'sonner'

export function GlobalHeader() {
  const { data: session } = authClientReact.useSession()
  const location = useLocation()
  const [signingOut, setSigningOut] = useState(false)
  const returnTo = safeReturnTo(location.href)

  const signOut = async () => {
    setSigningOut(true)
    try {
      const { error } = await authClientReact.signOut()
      if (error) throw new Error(error.message)
      window.location.reload()
    } catch {
      toast.error(authCopy.requestFailed)
      setSigningOut(false)
    }
  }

  return (
    <header className="border-b">
      <nav aria-label="Main navigation" className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-5">
        <a href="/" className="font-semibold">{siteCopy.name}</a>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {session?.user && !session.user.isAnonymous ? <>
            <span className="max-w-[180px] truncate" title={session.user.email}>{authCopy.signedInAs} {session.user.name}</span>
            <button type="button" onClick={signOut} disabled={signingOut} className="underline underline-offset-4 disabled:opacity-50">{signingOut ? authCopy.signingOut : authCopy.signOut}</button>
          </> : <a href={`/signin?returnTo=${encodeURIComponent(returnTo)}`}>{siteCopy.nav.signIn}</a>}
        </div>
      </nav>
    </header>
  )
}
