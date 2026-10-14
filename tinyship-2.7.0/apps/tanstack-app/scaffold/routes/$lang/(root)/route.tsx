import { createFileRoute, Outlet } from '@tanstack/react-router'
import Header from '@/components/global-header'
import { SiteFooter } from '@/components/site-footer'

export const Route = createFileRoute('/$lang/(root)')({
  component: RootLayout,
})

function RootLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <SiteFooter />
    </>
  )
}
