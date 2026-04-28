import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import './App.css'

/** Files in `public/` — prefix with BASE_URL for GitHub Pages (/repo-name/). */
function publicAsset(path: string) {
  const p = path.startsWith('/') ? path.slice(1) : path
  return `${import.meta.env.BASE_URL}${p}`
}

// Measures work-list top offset from content top.
// Sets spacer height so images initially sit at the work section level,
// and sets scroll-padding-top so snap targets each image at that same level.
function useSpacerHeight(
  workListRef: React.RefObject<HTMLDivElement | null>,
  spacerRef: React.RefObject<HTMLDivElement | null>,
  containerRef: React.RefObject<HTMLDivElement | null>,
) {
  useLayoutEffect(() => {
    const update = () => {
      const list = workListRef.current
      const spacer = spacerRef.current
      const container = containerRef.current
      if (!list || !spacer || !container) return
      const content = list.closest('.content') as HTMLElement | null
      if (!content) return
      const offset = list.getBoundingClientRect().top - content.getBoundingClientRect().top
      spacer.style.height = `${offset}px`
      // scroll-padding-top shifts the snap point so each image snaps to the work-section level
      container.style.scrollPaddingTop = `${offset}px`
      // CSS variable used by .media-card to fill exactly the visible area below the spacer
      container.style.setProperty('--spacer-h', `${offset}px`)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [workListRef, spacerRef, containerRef])
}

const projects = [
  {
    client: 'Heineken',
    years: '2022–2026',
    title: "Creating Crate: Heineken's B2B design language used by 225+ team members",
    image: publicAsset('figma/work-1.png'),
    caseImages: [
      publicAsset('figma/cs-heineken.png'),
      publicAsset('figma/work-1.png'),
      publicAsset('figma/work-2.png'),
    ],
    slug: 'crate',
    body: "Crate is Heineken's internal design system, powering eazle and a suite of supporting tools. I built Crate from the ground up — tokens, components, patterns, and documentation — alongside a team of engineers and a growing contributor community.\n\nThe system is now used by 235 contributors across 8 product teams and has become the connective tissue for Heineken's digital product organisation.\n\n- Designed and documented 80+ components from scratch\n- Established a token architecture covering brand, theme, and density layers\n- Created onboarding guides and a contribution model that scaled to 235 contributors",
    tags: ['heineken', 'design systems', 'tokens', 'community'],
  },
  {
    client: 'Heineken',
    years: '2022–2026',
    title: "Building the brand framework and team culture that launched Eazle, Heineken's B2B platform",
    image: publicAsset('figma/work-2.png'),
    caseImages: [
      publicAsset('figma/work-2.png'),
      publicAsset('figma/cs-heineken.png'),
      publicAsset('figma/work-1.png'),
    ],
    slug: 'eazle',
    body: "Eazle is Heineken's B2B platform connecting sales reps and customers across markets. I led the brand and product design foundation — defining the visual language, establishing design principles, and building the team culture that made rapid scaling possible.\n\nThe platform launched across 5 markets and is now used by thousands of Heineken sales representatives daily.\n\n- Defined brand expression and visual identity for the platform\n- Built the design team structure and collaboration rituals\n- Created the product design framework used across all Eazle surfaces",
    tags: ['heineken', 'brand', 'product design', 'platform'],
  },
  {
    client: 'adidas',
    years: '2022–2026',
    title: 'Product Recommendations framework for adidas.com',
    image: publicAsset('figma/work-3.png'),
    caseImages: [
      publicAsset('figma/work-3.png'),
      publicAsset('figma/work-2.png'),
      publicAsset('figma/work-1.png'),
    ],
    slug: 'adidas',
    body: "I designed the product recommendations framework for adidas.com — a scalable system that surfaces the right products to the right customers at the right moment across the full commerce experience.\n\nThe framework integrates personalisation signals, editorial control, and performance data into a coherent design system that product teams across adidas can build on.\n\n- Designed recommendation patterns across homepage, PDP, cart and checkout\n- Built a shared component library for recommendation surfaces\n- Worked with data science and engineering teams to balance algorithmic and editorial control",
    tags: ['adidas', 'e-commerce', 'recommendations', 'systems'],
  },
]

function App() {
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('luna-theme') as 'dark' | 'light') || 'dark'
  })
  const [activePage, setActivePage] = useState<'home' | 'about'>('home')
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [isContactOpen, setIsContactOpen] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('luna-theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.classList.toggle('about-mode', activePage === 'about')
  }, [activePage])

  const switchTheme = useCallback((next: 'dark' | 'light') => {
    const html = document.documentElement
    html.classList.add('theme-transitioning')
    setTheme(next)
    const id = window.setTimeout(() => html.classList.remove('theme-transitioning'), 650)
    return () => window.clearTimeout(id)
  }, [])

  const copyEmail = useCallback(() => {
    navigator.clipboard.writeText('lunaborgo@gmail.com')
  }, [])

  const openCaseStudy = useCallback((index: number) => {
    setSelectedProject(index)
    setActiveIndex(index)
    // Scroll image column to the selected project
    const container = workMediaRef.current
    const card = cardRefs.current[index]
    const spacerH = spacerRef.current?.offsetHeight ?? 0
    if (container && card) {
      container.scrollTo({ top: card.offsetTop - spacerH, behavior: 'smooth' })
    }
  }, [])

  const closeCaseStudy = useCallback(() => {
    setSelectedProject(null)
    setActiveIndex(-1)
  }, [])

  const goToNext = useCallback(() => {
    if (selectedProject === null) return
    const next = (selectedProject + 1) % projects.length
    openCaseStudy(next)
  }, [selectedProject, openCaseStudy])

  const workMediaRef = useRef<HTMLDivElement>(null)
  const workListRef = useRef<HTMLDivElement>(null)
  const spacerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLElement | null)[]>([])
  const sideMenuRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLElement>(null)
  const pageBodyRef = useRef<HTMLDivElement>(null)
  const csBodyRef = useRef<HTMLDivElement>(null)
  // Lets scrollToProject cancel any in-flight lerp before starting its own scroll
  const cancelLerpRef = useRef<() => void>(() => {})

  useSpacerHeight(workListRef, spacerRef, workMediaRef)

  // On desktop the page itself has overflow:hidden, so wheel events outside
  // the work-media column do nothing. Forward them to the image column so the
  // user can scroll anywhere on the page (except the side menu) to drive the images.
  useEffect(() => {
    if (activePage !== 'home' || selectedProject !== null) return
    const isDesktop = () => window.innerWidth >= 769

    let targetScrollTop = workMediaRef.current?.scrollTop ?? 0
    let rafId: number | null = null
    let lastFrameTime = 0
    let idleTimer: ReturnType<typeof setTimeout> | null = null

    // Find nearest image snap position so we don't land between images
    const nearestSnap = (scrollTop: number) => {
      const spacerH = spacerRef.current?.offsetHeight ?? 0
      const cards = cardRefs.current.filter(Boolean) as HTMLElement[]
      let best = scrollTop
      let minDist = Infinity
      cards.forEach(card => {
        const pos = card.offsetTop - spacerH
        const dist = Math.abs(scrollTop - pos)
        if (dist < minDist) { minDist = dist; best = pos }
      })
      return best
    }

    const snapBack = (container: HTMLDivElement) => {
      container.style.scrollSnapType = ''
      // Smoothly glide to the nearest snap point
      const snap = nearestSnap(container.scrollTop)
      targetScrollTop = snap
      lastFrameTime = 0
      rafId = requestAnimationFrame(animate)
    }

    const animate = (now: number) => {
      const container = workMediaRef.current
      if (!container) { rafId = null; return }

      // Delta-time normalised to 60 fps so speed is screen-refresh-independent
      const dt = lastFrameTime ? Math.min(now - lastFrameTime, 64) : 16.67
      lastFrameTime = now
      const factor = 1 - Math.pow(0.85, dt / 16.67)

      const diff = targetScrollTop - container.scrollTop
      if (Math.abs(diff) < 0.5) {
        container.scrollTop = targetScrollTop
        rafId = null
        lastFrameTime = 0
        return
      }
      container.scrollTop += diff * factor
      rafId = requestAnimationFrame(animate)
    }

    const handleWheel = (e: WheelEvent) => {
      if (!isDesktop()) return
      const target = e.target as Node
      if (sideMenuRef.current?.contains(target)) return   // leave menu alone
      if (workMediaRef.current?.contains(target)) return  // already scrolls naturally

      const container = workMediaRef.current
      if (!container) return

      e.preventDefault()

      // Disable scroll-snap so the lerp can move freely without fighting the browser
      container.style.scrollSnapType = 'none'

      // Re-sync if user scrolled the media column directly in the meantime
      if (Math.abs(container.scrollTop - targetScrollTop) > 40) {
        targetScrollTop = container.scrollTop
      }

      const maxScroll = container.scrollHeight - container.clientHeight
      targetScrollTop = Math.max(0, Math.min(maxScroll, targetScrollTop + e.deltaY * 0.66))

      // Re-enable snap and glide to nearest image after idle
      if (idleTimer) clearTimeout(idleTimer)
      idleTimer = setTimeout(() => snapBack(container), 200)

      if (rafId === null) rafId = requestAnimationFrame(animate)
    }

    // Expose a cancel handle so scrollToProject can stop the lerp before
    // starting its own smooth scroll — prevents the two from fighting each other.
    cancelLerpRef.current = () => {
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null }
      if (idleTimer !== null) { clearTimeout(idleTimer); idleTimer = null }
      const c = workMediaRef.current
      if (c) c.style.scrollSnapType = ''
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      cancelLerpRef.current = () => {}
      window.removeEventListener('wheel', handleWheel)
      if (rafId !== null) cancelAnimationFrame(rafId)
      if (idleTimer !== null) clearTimeout(idleTimer)
    }
  }, [activePage, selectedProject])

  // When entering case study: collapse spacer → images sit at the very top of the right column.
  // When leaving: recalculate spacer so homepage layout is restored.
  useEffect(() => {
    const spacer = spacerRef.current
    const container = workMediaRef.current
    if (!spacer || !container) return

    if (selectedProject !== null) {
      spacer.style.height = '0px'
      container.style.scrollPaddingTop = '0px'
      container.style.setProperty('--spacer-h', '0px')
      container.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    } else {
      // Defer so the home view is visible again before measuring
      requestAnimationFrame(() => {
        const list = workListRef.current
        if (!list || !spacer || !container) return
        const content = list.closest('.content') as HTMLElement | null
        if (!content) return
        const offset = list.getBoundingClientRect().top - content.getBoundingClientRect().top
        spacer.style.height = `${offset}px`
        container.style.scrollPaddingTop = `${offset}px`
        container.style.setProperty('--spacer-h', `${offset}px`)
        container.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
      })
    }
  }, [selectedProject])

  // After any “page” change (home ↔ about, open/close case study), pin scroll at the top so mobile
  // and desktop never open the next view in the middle of a previous scroll.
  useLayoutEffect(() => {
    const opts: ScrollToOptions = { top: 0, left: 0, behavior: 'instant' }
    pageBodyRef.current?.scrollTo(opts)
    contentRef.current?.scrollTo(opts)
    csBodyRef.current?.scrollTo(opts)
    /* Hidden / stacked .view can keep scrollTop in some layouts. */
    contentRef.current?.querySelectorAll<HTMLElement>('.view').forEach((el) => {
      el.scrollTop = 0
    })
    window.scrollTo(opts)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [activePage, selectedProject])

  // Scroll the images column so the image lands at the work-section level (not the container top).
  // spacer height = distance from container top to work section start.
  const scrollToProject = useCallback((index: number) => {
    // Stop any in-flight wheel lerp so it doesn't fight the smooth scroll below
    cancelLerpRef.current()
    const container = workMediaRef.current
    const card = cardRefs.current[index]
    const spacerH = spacerRef.current?.offsetHeight ?? 0
    if (!container || !card) return
    // scrollTop = card.offsetTop - spacerH puts the card's top at viewport y = spacerH (work section level)
    container.scrollTo({ top: card.offsetTop - spacerH, behavior: 'smooth' })
    setActiveIndex(index)
  }, [])

  // Scroll-based activeIndex detection removed:
  // images only activate on work-item hover, never from scrolling.

  return (
    <div className="page">
      <aside className="side-menu" aria-label="Primary navigation" ref={sideMenuRef}>
        <button
          className="side-brand"
          onClick={() => { setActivePage('home'); setSelectedProject(null); setActiveIndex(-1); }}
          aria-label="Go to home"
        >
          <span className="brand-icon" aria-hidden="true" />
          <span className="brand-name">luna</span>
        </button>

        <nav className="menu-links">
          <button
            className={`menu-work menu-btn${activePage === 'home' ? ' is-active' : ''}`}
            onClick={() => { setActivePage('home'); setSelectedProject(null); setActiveIndex(-1); }}
          >
            <span className="menu-work-dot" aria-hidden="true" />
            <span>Work</span>
          </button>
          <button
            className={`menu-about menu-btn menu-work${activePage === 'about' ? ' is-active' : ''}`}
            onClick={() => {
              if (activePage === 'about') {
                setActivePage('home')
              } else {
                setSelectedProject(null)
                setActiveIndex(-1)
                setActivePage('about')
              }
            }}
          >
            <span className="menu-work-dot" aria-hidden="true" />
            <span>About</span>
          </button>
        </nav>

        <div className="side-footer">
          <p className="moon-phase">◑ wanning crescent</p>
          <p className="times">22:00 AMS ✧ 17:00<br />VIX ✧ 09:00 JPN</p>
          <button type="button" className="contact-btn" onClick={() => setIsContactOpen(true)}>
            &gt; contact &lt;
          </button>
          <div className="theme-toggle">
            <button
              className={`theme-btn theme-dark${theme === 'dark' ? ' is-active' : ''}`}
              onClick={() => switchTheme('dark')}
            >DARK</button>
            <button
              className={`theme-btn theme-light${theme === 'light' ? ' is-active' : ''}`}
              onClick={() => switchTheme('light')}
            >LIGHT</button>
            <span>=^,^=</span>
          </div>
        </div>
      </aside>

      <div
        className={`page-body${activePage === 'about' ? ' page-about' : ''}`}
        ref={pageBodyRef}
      >

        {/* ── About page (full replacement of page-body content) ── */}
        {activePage === 'about' && (
          <div className="about-page">
            {/* Left column */}
            <div className="about-left">
              <div className="about-ascii" aria-hidden="true">{'/)/)/)/)/)/)/)/)/)/)/)/)/)/)/)/)/)/)/)/)/)/)/)/)/)/)/)/)/)/)/)/)/)/)/)/)/)/)/)\n(/(/(/(/(/(/(/(/(/(/(/(/(/(/(/(/(/(/(/(/(/(/(/(/(/(/(/(/(/(/(/(/(/(/(/(/(/(/(/(/'}</div>
              <p className="about-hi">/ hi, i&apos;m luna ^^</p>
              <h1 className="about-title">I find beauty in the ordinary, and coherence in messes.</h1>
              <div className="about-bio">
                <p>Brazilian, based in Amsterdam since 2017 — I came for a project and stayed for the light, the bikes, and the stroopwafels. Probably in that order.</p>
                <p>For twelve years I&apos;ve built digital platforms and design systems at the intersection of brand strategy, product thinking, and organizational design. I work where complexity is most interesting — where systems need to scale without losing what makes a brand feel like itself.</p>
                <p>Away from screens: I shoot on film, maintain an ever-evolving Japan itinerary I may or may not act on, and share an apartment with two cats who remain completely unimpressed by design systems.</p>
              </div>
              <a
                className="about-tagline"
                href="#work"
                onClick={e => {
                  e.preventDefault()
                  setSelectedProject(null)
                  setActiveIndex(-1)
                  setActivePage('home')
                }}
              >
                brand expression &amp; scalable digital experiences
              </a>

              <p className="about-section-kicker">latest experience</p>
              <ul className="about-exp">
                <li className="about-exp-item">
                  <span className="about-exp-years">2022–now</span>
                  <span className="about-exp-role">Senior Designer, Design Systems<br />Heineken · Amsterdam</span>
                </li>
                <li className="about-exp-item">
                  <span className="about-exp-years">2019–22</span>
                  <span className="about-exp-role">Product Designer, Browse and Delight<br />Adidas · Amsterdam</span>
                </li>
                <li className="about-exp-item">
                  <span className="about-exp-years">2016–19</span>
                  <span className="about-exp-role">UX/UI Designer<br />Aegon – HCL Technologies</span>
                </li>
                <li className="about-exp-item">
                  <span className="about-exp-years">2016–19</span>
                  <span className="about-exp-role">UX/UI Designer<br />Atabix</span>
                </li>
              </ul>
              <a
                className="about-cv-btn"
                href="#"
                download
                onClick={e => e.preventDefault()}
              >
                &gt; download cv
              </a>
            </div>

            {/* Right column */}
            <div className="about-right">
              <div className="about-right-inner">
                <div className="about-panel">
                  <p className="about-panel-kicker">/ photos</p>
                  <div className="about-photos">
                    <img src={publicAsset('figma/about-photo-1.png')} alt="Luna – photo 1" />
                    <img src={publicAsset('figma/about-photo-2.png')} alt="Luna – photo 2" />
                  </div>
                </div>

                <div className="about-panel">
                  <p className="about-panel-kicker">/ escher quote</p>
                  <p className="about-quote">&ldquo;We adore chaos because we love to produce order.&rdquo;</p>
                </div>

                <div className="about-panel">
                  <p className="about-panel-kicker">/ credits</p>
                  <p className="about-credits">
                    tnx to the creators of these amazing resources found on the world wide web:<br /><br />
                    <a href="https://www.asciiart.eu/gallery" target="_blank" rel="noopener noreferrer">https://www.asciiart.eu/gallery</a><br />
                    <a href="https://fontstruct.com/fontstructions/show/676742/nintendoid_1" target="_blank" rel="noopener noreferrer">https://fontstruct.com/fontstructions/show/676742/nintendoid_1</a>
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="about-bottom">
              <a
                className="about-pong-btn"
                href={`${import.meta.env.BASE_URL}pong.html`}
                target="_self"
              >
                &lt; play pong &gt;
              </a>
            </div>
          </div>
        )}

        <main className="content" ref={contentRef} style={{ display: activePage === 'about' ? 'none' : undefined }}>

          {/* ── Homepage view ── */}
          <div className={`view view-home${selectedProject === null ? ' is-visible' : ''}`}>
            <header className="intro">
              <p className="kicker">
                welcome to my design portfolio \_O_ :&#125;
              </p>
              <p className="hero-copy hero-copy-primary">
                For over twelve years, I&apos;ve helped brands to turn creative
                vision into scalable digital platforms — shaping visual
                languages, defining shared foundations, and aligning teams
                around how we build.
              </p>
              <p className="hero-copy hero-copy-secondary">
                I build systems for teams that need to move at scale
                <em> without losing their soul.</em>
              </p>
            </header>

            <section className="work" id="work" onMouseLeave={() => setActiveIndex(-1)}>
              <div className="work-list" ref={workListRef}>
                <p className="kicker">work / highlights</p>
                {projects.map((project, i) => (
                  <article
                    className={`work-item${activeIndex === i ? ' is-active' : ''}`}
                    key={`${project.client}${project.title}`}
                    onMouseEnter={() => scrollToProject(i)}
                    onClick={() => openCaseStudy(i)}
                  >
                  <figure className="work-item-image">
                    <img src={project.image} alt={project.title} loading="lazy" />
                  </figure>
                  <p className="work-client">{project.client}</p>
                  <div className="work-copy">
                    <p className="work-years">{project.years}</p>
                    <p className="work-title">{project.title}</p>
                  </div>
                </article>
              ))}
              </div>
            </section>
          </div>{/* end .view-home */}

          {/* ── Case study view ── */}
          <div className={`view view-case${selectedProject !== null ? ' is-visible' : ''}`}>
            {selectedProject !== null && (() => {
              const p = projects[selectedProject]
              return (
                <>
                  <header className="cs-header">
                    <p className="kicker">
                      work / {p.years} / {p.slug}
                    </p>
                    <h1 className="cs-title">{p.title}</h1>
                  </header>

                  <div className="cs-body" ref={csBodyRef}>
                    {p.body.split('\n\n').map((para, i) => (
                      <p key={i} className="cs-para">{para}</p>
                    ))}
                  </div>

                  <div className="cs-tags">
                    {p.tags.map((tag, i) => (
                      <span key={tag}>
                        {tag}{i < p.tags.length - 1 && <span className="cs-dot"> • </span>}
                      </span>
                    ))}
                  </div>

                  {/* Desktop nav — inside the text column */}
                  <nav className="cs-nav cs-nav-desktop">
                    <button className="cs-nav-btn" onClick={closeCaseStudy}>
                      &gt; back to all work
                    </button>
                    <button className="cs-nav-btn" onClick={goToNext}>
                      &gt; next project
                    </button>
                  </nav>
                </>
              )
            })()}
          </div>{/* end .view-case */}

          {/* Images column: absolutely positioned from content top so images scroll behind the headline */}
          <div
            className={`work-media${selectedProject !== null ? ' cs-mode' : ''}`}
            ref={workMediaRef}
          >
            <div className="work-media-spacer" ref={spacerRef} aria-hidden="true" />
            {selectedProject !== null
              ? /* Case study: show images specific to the selected project */
                projects[selectedProject].caseImages.map((src, i) => (
                  <figure
                    className="media-card is-active"
                    key={src + i}
                    ref={(el) => { cardRefs.current[i] = el }}
                  >
                    <img src={src} alt={projects[selectedProject].title} loading="lazy" />
                  </figure>
                ))
              : /* Homepage: one image per project, hover/scroll driven */
                projects.map((project, i) => (
                  <figure
                    className={`media-card${activeIndex === i ? ' is-active' : ''}`}
                    key={project.image}
                    ref={(el) => { cardRefs.current[i] = el }}
                    onClick={() => scrollToProject(i)}
                  >
                    <img src={project.image} alt={project.title} loading="lazy" />
                  </figure>
                ))
            }
          </div>

          {/* Mobile nav — below the images */}
          {selectedProject !== null && (
            <nav className="cs-nav cs-nav-mobile">
              <button className="cs-nav-btn" onClick={closeCaseStudy}>
                &gt; back to all work
              </button>
              <button className="cs-nav-btn" onClick={goToNext}>
                &gt; next project
              </button>
            </nav>
          )}
        </main>

        <footer className="site-footer">
          <div className="site-footer-inner">
            <div className="site-footer-row">
              <span>◑ wanning crescent</span>
              <span>22:00 AMS ✧ 17:00 VIX ✧ 09:00 JPN</span>
            </div>
            <div className="site-footer-divider" />
            <div className="site-footer-row">
              <button
                className={`theme-btn theme-dark${theme === 'dark' ? ' is-active' : ''}`}
                onClick={() => switchTheme('dark')}
              >DARK</button>
              <button
                className={`theme-btn theme-light${theme === 'light' ? ' is-active' : ''}`}
                onClick={() => switchTheme('light')}
              >LIGHT</button>
              <span>=^,^=</span>
            </div>
          </div>
        </footer>
      </div>

      {/* ── Contact popup ── */}
      {isContactOpen && (
        <div className="contact-overlay" onClick={() => setIsContactOpen(false)} role="dialog" aria-modal="true">
          <div className="contact-modal" onClick={e => e.stopPropagation()}>

            <div className="contact-modal-header">
              <button className="contact-close" onClick={() => setIsContactOpen(false)}>
                X CLOSE
              </button>
            </div>

            <div className="contact-modal-body">
              <p className="contact-hey">hey ;)</p>
              <p className="contact-msg">
                thx for the interest in my work. feel free to hit me up at{' '}
                <span className="contact-email" onClick={copyEmail} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && copyEmail()}>lunaborgo@gmail.com</span>
              </p>
              <p className="contact-cta">would be nice to hear from you! ^^</p>
            </div>

            <div className="contact-modal-actions">
              <button className="contact-action-btn" onClick={copyEmail}>
                &gt; copy email
              </button>
              <a
                className="contact-action-btn"
                href="https://www.linkedin.com/in/lunaborgo"
                target="_blank"
                rel="noopener noreferrer"
              >
                &gt; connect on linkedin
              </a>
            </div>

            <div className="contact-modal-footer">
              <pre className="contact-cat">{`|\\__/,|   (\`\\
|_ _  |.--.) )
( T   )    /
(((^_((/(((_/`}</pre>
              <p className="contact-sig">~ luna</p>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default App
