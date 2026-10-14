import { createFileRoute } from '@tanstack/react-router'
import { seoHead } from '@/lib/seo'
import { pageRegistry } from '@/lib/page-registry'
import { comparisonCopy, generatorComparison } from '@/lib/generator-comparison'
import '../home.css'
import '../comparison.css'

const page = pageRegistry.bestGenerators

export const Route = createFileRoute('/best-rumpelstiltskin-ai-generators')({
  ssr: true,
  head: () => seoHead({ title: page.title, description: page.description, canonical: page.path }),
  component: BestGeneratorsPage,
})

function BestGeneratorsPage() {
  return (
    <main className="home-page comparison-page">
      <h1 className="home-title">{page.h1}</h1>
      <p className="home-intro">{comparisonCopy.intro}</p>

      <section className="home-section" aria-labelledby="generator-comparison">
        <h2 id="generator-comparison">{comparisonCopy.heading}</h2>
        <p className="section-note">{comparisonCopy.method}</p>
        <p className="mb-3 text-sm text-muted-foreground lg:hidden">{comparisonCopy.scrollHint}</p>
        <div className="comparison-scroll" role="region" aria-label={comparisonCopy.tableLabel} tabIndex={0}>
          <table className="generator-comparison">
            <caption>{comparisonCopy.caption}</caption>
            <thead><tr>{comparisonCopy.columns.map((column) => <th key={column} scope="col">{column}</th>)}</tr></thead>
            <tbody>
              {generatorComparison.map((tool) => (
                <tr key={tool.name}>
                  <th scope="row">
                    <a href={tool.href} rel={tool.href.startsWith('https:') ? 'nofollow' : undefined}>{tool.name}</a>
                    {tool.source && <a href={tool.source.href} rel={tool.source.href.startsWith('https:') ? 'nofollow' : undefined} className="comparison-source">{tool.source.label}</a>}
                  </th>
                  <td>{tool.freeAllowance}</td>
                  <td>{tool.login}</td>
                  <td>{tool.speed}</td>
                  <td>{tool.useCase}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="home-section" aria-labelledby="choose-generator">
        <h2 id="choose-generator">{comparisonCopy.chooseHeading}</h2>
        {comparisonCopy.selectionNotes.map((note) => <p className="comparison-paragraph" key={note}>{note}</p>)}
      </section>
      <p className="home-intro comparison-entry">
        {comparisonCopy.sitePosition}{' '}<a href={pageRegistry.home.path}>{pageRegistry.home.anchorText}</a>{' '}{comparisonCopy.entrySuffix}
      </p>
    </main>
  )
}
