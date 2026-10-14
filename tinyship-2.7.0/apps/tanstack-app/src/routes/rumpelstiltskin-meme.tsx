import { createFileRoute } from '@tanstack/react-router'
import { MemeArticle } from '@/components/meme-articles'
import { pageRegistry } from '@/lib/page-registry'
import { seoHead } from '@/lib/seo'
import '../home.css'
import '../article-pages.css'

const page = pageRegistry.meme

export const Route = createFileRoute('/rumpelstiltskin-meme')({
  ssr: true,
  head: () => seoHead({ title: page.title, description: page.description, canonical: page.path, og: { type: 'article' } }),
  component: MemePage,
})

function MemePage() {
  return <main className="home-page article-page"><article><h1 className="home-title">{page.h1}</h1><MemeArticle /></article></main>
}
