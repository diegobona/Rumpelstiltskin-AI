import { createFileRoute } from '@tanstack/react-router'
import { TutorialContent } from '@/components/tutorial-content'
import { pageRegistry } from '@/lib/page-registry'
import { seoHead } from '@/lib/seo'
import '../home.css'
import '../article-pages.css'

const page = pageRegistry.howTo

export const Route = createFileRoute('/how-to-make-rumpelstiltskin-ai-video')({
  ssr: true,
  head: () => seoHead({ title: page.title, description: page.description, canonical: page.path }),
  component: TutorialPage,
})

function TutorialPage() {
  return (
    <main className="home-page article-page">
      <h1 className="home-title">{page.h1}</h1>
      <TutorialContent />
    </main>
  )
}
