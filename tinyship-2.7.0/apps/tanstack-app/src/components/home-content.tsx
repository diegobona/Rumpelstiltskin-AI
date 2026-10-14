import { homeCopy } from '@/lib/home-copy'
import { moreAiVideoTools } from '@/lib/page-registry'

type RelatedTool = {
  category: string
  href: string
  anchorText: string
}

type HomeContentProps = {
  relatedTools?: readonly RelatedTool[]
}

export function HomeContent({ relatedTools = moreAiVideoTools }: HomeContentProps) {
  return (
    <div className="home-content">
      <p className="home-intro">{homeCopy.intro}</p>

      <section className="home-section section-how" aria-labelledby="how-to-make">
        <h2 id="how-to-make">{homeCopy.how.heading}</h2>
        <ol className="step-grid">
          {homeCopy.how.steps.map((step, index) => (
            <li className="step-card" key={step.title}>
              <img src={step.image} alt={step.alt} width={640} height={400} loading="lazy" decoding="async" />
              <div className="step-copy">
                <h3><span className="step-number" aria-hidden="true">{index + 1}</span>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="home-section section-examples" aria-labelledby="video-examples">
        <h2 id="video-examples">{homeCopy.examples.heading}</h2>
        <p className="section-note">{homeCopy.examples.note}</p>
        <div className="example-grid">
          {homeCopy.examples.items.map((example) => (
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

      <section className="home-section section-faq" aria-labelledby="video-faq">
        <h2 id="video-faq">{homeCopy.faq.heading}</h2>
        <div className="faq-list">
          {homeCopy.faq.items.map((item) => (
            <div className="faq-item" key={item.question}>
              <h3>{item.question}</h3>
              <p>
                {item.answer}
                {item.source && <> <a href={item.source.href} rel="nofollow">{item.source.label}</a>.</>}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-section section-related" aria-labelledby="more-video-tools">
        <h2 id="more-video-tools">{homeCopy.related.heading}</h2>
        <div className="related-grid">
          {relatedTools.map((tool) => (
            <article className="related-card" key={tool.href}>
              <p className="related-category">{tool.category}</p>
              <h3><a href={tool.href}>{tool.anchorText}</a></h3>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
