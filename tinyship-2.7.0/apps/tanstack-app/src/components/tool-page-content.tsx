import { pageRegistry } from '@/lib/page-registry'
import { toolPageCopy } from '@/lib/tool-page-copy'

type Step = { title: string; body: string }
type Question = { question: string; answer: string }

function ToolSteps({ id, heading, steps }: { id: string; heading: string; steps: readonly Step[] }) {
  return (
    <section className="home-section" aria-labelledby={id}>
      <h2 id={id}>{heading}</h2>
      <ol className="step-grid tool-step-grid">
        {steps.map((step, index) => (
          <li className="step-card" key={step.title}>
            <div className="step-copy">
              <h3><span className="step-number" aria-hidden="true">{index + 1}</span>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

function ToolFaq({ id, heading, items }: { id: string; heading: string; items: readonly Question[] }) {
  return (
    <section className="home-section section-faq" aria-labelledby={id}>
      <h2 id={id}>{heading}</h2>
      <div className="faq-list">
        {items.map((item) => (
          <div className="faq-item" key={item.question}>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function VideoGeneratorContent() {
  const copy = toolPageCopy.videoGenerator
  const related = [pageRegistry.home, pageRegistry.danceVideo, pageRegistry.bestGenerators]
  return (
    <div className="home-content">
      <p className="home-intro">{copy.intro}</p>
      <p className="section-note">
        {copy.links.danceLead} <a href={pageRegistry.danceVideo.path}>{pageRegistry.danceVideo.anchorText}</a>.{' '}
        {copy.links.guideLead} <a href={pageRegistry.howTo.path}>{pageRegistry.howTo.anchorText}</a>.
      </p>
      <ToolSteps id="generator-how-it-works" heading={copy.how.heading} steps={copy.how.steps} />
      <section className="home-section section-examples" aria-labelledby="generator-examples">
        <h2 id="generator-examples">{copy.examples.heading}</h2>
        <p className="section-note">{copy.examples.note}</p>
        <div className="example-grid">
          {copy.examples.items.map((example) => (
            <figure className="example-card" key={example.image}>
              <img src={example.image} alt={example.alt} width={768} height={768} loading="lazy" decoding="async" />
              <figcaption>
                <span className="example-kind">{example.kind}</span>
                <h3>{example.title}</h3>
                <p>{example.body}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      <ToolFaq id="generator-faq" heading={copy.faq.heading} items={copy.faq.items} />
      <section className="home-section section-related" aria-labelledby="generator-related">
        <h2 id="generator-related">{copy.relatedHeading}</h2>
        <div className="related-grid">
          {related.map((page) => (
            <article className="related-card" key={page.path}>
              <p className="related-category">{page.category}</p>
              <h3><a href={page.path}>{page.anchorText}</a></h3>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export function DanceVideoContent() {
  const copy = toolPageCopy.danceVideo
  return (
    <div className="home-content">
      <p className="home-intro">{copy.intro}</p>
      <section className="home-section" aria-labelledby="dance-appearance">
        <h2 id="dance-appearance">{copy.appearance.heading}</h2>
        <div className="tool-dance-appearance">
          <div className="tool-prose">
            {copy.appearance.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <figure className="example-card">
            <img src={copy.appearance.image} alt={copy.appearance.alt} width={768} height={768} loading="lazy" decoding="async" />
            <figcaption><p>{copy.appearance.caption}</p></figcaption>
          </figure>
        </div>
      </section>
      <ToolSteps id="dance-how-to-make" heading={copy.how.heading} steps={copy.how.steps} />
      <p className="section-note">
        {copy.links.generatorLead} <a href={pageRegistry.videoGenerator.path}>{pageRegistry.videoGenerator.anchorText}</a>.{' '}
        {copy.links.guideLead} <a href={pageRegistry.howTo.path}>{pageRegistry.howTo.anchorText}</a> {copy.links.guideEnd}
      </p>
      <ToolFaq id="dance-faq" heading={copy.faq.heading} items={copy.faq.items} />
      <nav className="tool-page-navigation" aria-label={copy.navigationLabel}>
        <a href={pageRegistry.home.path}>{pageRegistry.home.anchorText}</a>
        <a href={pageRegistry.videoGenerator.path}>{pageRegistry.videoGenerator.anchorText}</a>
        <a href={pageRegistry.bestGenerators.path}>{pageRegistry.bestGenerators.anchorText}</a>
      </nav>
    </div>
  )
}
