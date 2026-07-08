'use client'

import { useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Fraunces } from 'next/font/google'
import { Check, ShieldCheck, Percent, Truck, Lock, Globe2, FileText, LogIn } from 'lucide-react'
import { useTheme } from '@/components/theme/ThemeProvider'
import ThemeToggle from '@/components/theme/ThemeToggle'
import HeroScene from './HeroScene'
import styles from './Landing.module.css'

const fraunces = Fraunces({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-fraunces' })

function GithubMark({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.1 3.29 9.4 7.86 10.94.57.1.78-.25.78-.55v-2.1c-3.2.7-3.87-1.36-3.87-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.03 1.78 2.71 1.27 3.37.97.1-.75.4-1.27.72-1.56-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a10.9 10.9 0 0 1 5.79 0c2.2-1.5 3.17-1.18 3.17-1.18.63 1.6.23 2.77.11 3.06.75.81 1.19 1.83 1.19 3.09 0 4.41-2.7 5.39-5.26 5.67.41.36.78 1.08.78 2.17v3.22c0 .3.21.66.79.55A11.53 11.53 0 0 0 23.5 12C23.5 5.74 18.27.5 12 .5Z" />
    </svg>
  )
}

const STACK = ['Python', 'FastAPI', 'Alembic', 'WeasyPrint', 'Next.js', 'Supabase', 'PostgreSQL', 'TypeScript', 'Tailwind CSS', 'Recharts']

const FEATURES = [
  { icon: ShieldCheck, title: 'GSTIN validation', body: 'Format and checksum checks run before an invoice is ever created, catching bad GSTINs at the door.' },
  { icon: Percent, title: 'Automatic tax split', body: 'CGST, SGST, IGST and cess computed correctly for intra-state, inter-state, and export cases alike.' },
  { icon: Truck, title: 'E-way bills & RCM', body: 'Generates e-way bills and handles reverse-charge transactions without manual bookkeeping.' },
  { icon: Lock, title: 'Row-level security', body: "Supabase RLS keeps every business's ledger isolated at the database layer, not the app layer." },
  { icon: Globe2, title: 'Export & SEZ support', body: 'Zero-rated and SEZ invoices are handled to spec, alongside full credit and debit note support.' },
  { icon: FileText, title: 'Filing-ready PDFs', body: 'WeasyPrint renders clean, print-ready invoice documents from the same data the dashboard reads.' },
]

const LEDGER_REPO = 'https://github.com/gaurav26kumar/gst-invoice-api'
const GITHUB_PROFILE = 'https://github.com/gaurav26kumar'

export default function Landing() {
  const { theme } = useTheme()
  const navRef = useRef<HTMLElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const revealRefs = useRef<HTMLElement[]>([])

  // Scroll progress + nav border, done via refs to avoid re-rendering on every scroll tick.
  useEffect(() => {
    function onScroll() {
      const y = window.scrollY
      navRef.current?.classList.toggle(styles.navScrolled, y > 8)
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (progressRef.current) progressRef.current.style.width = (max > 0 ? (y / max) * 100 : 0) + '%'
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Reveal-on-scroll for elements registered via registerReveal.
  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      revealRefs.current.forEach((el) => el.classList.add(styles.revealVisible))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.revealVisible)
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 }
    )
    revealRefs.current.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  const registerReveal = useCallback((el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el)
  }, [])

  const tilt1 = useRef<HTMLDivElement>(null)
  const tilt2 = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return
    const cleanups = [tilt1.current, tilt2.current].filter(Boolean).map((el) => {
      const node = el as HTMLDivElement
      function move(e: MouseEvent) {
        const rect = node.getBoundingClientRect()
        const px = (e.clientX - rect.left) / rect.width
        const py = (e.clientY - rect.top) / rect.height
        const rx = (0.5 - py) * 14
        const ry = (px - 0.5) * 14
        node.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`
      }
      function leave() {
        node.style.transform = 'rotateX(0deg) rotateY(0deg)'
      }
      node.addEventListener('mousemove', move)
      node.addEventListener('mouseleave', leave)
      return () => {
        node.removeEventListener('mousemove', move)
        node.removeEventListener('mouseleave', leave)
      }
    })
    return () => cleanups.forEach((fn) => fn())
  }, [])

  return (
    <div className={`${styles.page} ${fraunces.variable}`}>
      <div ref={progressRef} className={styles.progress} />

      <nav ref={navRef} className={styles.nav}>
        <div className={styles.brand}>
          Kosh<span className={styles.brandDot}>.</span>
          <span className={styles.brandTag}>GST TOOLING</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#ledger" className={styles.navLink}>Ledger</a>
          <a href="#dashboard-product" className={styles.navLink}>Dashboard</a>
          <a href="#features" className={styles.navLink}>Features</a>
          <a className={styles.ghLink} href={GITHUB_PROFILE} target="_blank" rel="noopener noreferrer">
            <GithubMark />
            gaurav26kumar
          </a>
          <Link href="/login" className={`${styles.btn} ${styles.btnGhost} ${styles.navLoginBtn}`}>
            <LogIn size={14} />
            Log in
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <main>
        <section className={styles.hero} id="top">
          <HeroScene theme={theme} />
          <div className={styles.heroContent}>
            <div className={styles.eyebrow}>Two tools, one GST stack</div>
            <h1 className={styles.heroTitle}>
              GST compliance,
              <br />
              <em>engineered.</em>
            </h1>
            <p className={styles.heroText}>
              Kosh is an invoicing API that gets CGST, SGST and IGST right down to the paisa, and a compliance
              dashboard that keeps every filing visible — built end-to-end by one engineer.
            </p>
            <div className={styles.heroCtaRow}>
              <a href="#ledger" className={`${styles.btn} ${styles.btnPrimary}`}>Explore Ledger</a>
              <a href="#dashboard-product" className={`${styles.btn} ${styles.btnGhost}`}>Explore Dashboard</a>
            </div>
          </div>
          <div className={styles.scrollCue}>
            <div className={styles.scrollLine} />
            SCROLL
          </div>
        </section>

        <section className={styles.product} id="ledger">
          <div className={`${styles.wrap} ${styles.productGrid}`}>
            <div ref={registerReveal} className={styles.reveal}>
              <div className={styles.pLabel}>Kosh Ledger · REST API</div>
              <h2 className={styles.productTitle}>
                Tax math, handled
                <br />
                at the source.
              </h2>
              <span className={styles.tag}>Python · FastAPI · PostgreSQL · Alembic</span>
              <p className={styles.desc}>
                A GST invoicing API built for how Indian tax actually works — GSTIN checks, correct intra/inter-state
                tax splits, and filing-ready documents on every request.
              </p>
              <ul className={styles.featureList}>
                {[
                  'GSTIN format & checksum validation before an invoice is created',
                  'Automatic CGST / SGST / IGST & cess calculation per transaction',
                  'E-way bills, reverse charge (RCM), and credit/debit notes',
                  'Export & SEZ invoicing, with filing-ready PDFs via WeasyPrint',
                ].map((item) => (
                  <li key={item} className={styles.featureItem}>
                    <Check size={16} />
                    {item}
                  </li>
                ))}
              </ul>
              <div className={styles.productLinks}>
                <a className={styles.linkBtn} href={LEDGER_REPO} target="_blank" rel="noopener noreferrer">
                  View source ↗
                </a>
              </div>
            </div>
            <div className={styles.tiltStage} ref={registerReveal}>
              <div className={styles.tiltCard} ref={tilt1}>
                <div className={styles.mockHead}>
                  <span className={styles.mockHeadTitle}>Invoice · GST-0192</span>
                  <span className={styles.pill}><span className={styles.pillDot} />Filed</span>
                </div>
                <div className={styles.row}><span className={styles.rowKey}>GSTIN</span><span className={styles.rowValue}>07AAAPL1234C1Z5</span></div>
                <div className={styles.row}><span className={styles.rowKey}>Taxable value</span><span className={styles.rowValue}>₹ 1,05,559.00</span></div>
                <div className={styles.row}><span className={styles.rowKey}>CGST · 9%</span><span className={styles.rowValue}>₹ 9,500.31</span></div>
                <div className={styles.row}><span className={styles.rowKey}>SGST · 9%</span><span className={styles.rowValue}>₹ 9,500.31</span></div>
                <div className={`${styles.row} ${styles.rowTotal}`}><span className={styles.rowKey}>Total payable</span><span className={styles.rowValue}>₹ 1,24,559.62</span></div>
                <div className={styles.mockFoot}><Check size={13} />E-way bill generated automatically</div>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.product} ${styles.productReverse}`} id="dashboard-product">
          <div className={`${styles.wrap} ${styles.productGrid}`}>
            <div className={styles.tiltStage} ref={registerReveal}>
              <div className={styles.tiltCard} ref={tilt2}>
                <div className={styles.mockHead}>
                  <span className={styles.mockHeadTitle}>Returns Tracker</span>
                  <span className={styles.pill}><span className={styles.pillDot} />Live</span>
                </div>
                <div className={styles.bars}>
                  {[38, 62, 44, 80, 56, 70].map((h, i) => (
                    <div key={i} className={styles.bar} style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className={styles.statusList}>
                  <div className={styles.statusRow}>
                    <span className={styles.statusKey}><span className={`${styles.statusDot} ${styles.statusDotGreen}`} />GSTR-1</span>
                    <span className={styles.statusValue}>Filed</span>
                  </div>
                  <div className={styles.statusRow}>
                    <span className={styles.statusKey}><span className={`${styles.statusDot} ${styles.statusDotBrass}`} />GSTR-3B</span>
                    <span className={styles.statusValue}>Due in 4 days</span>
                  </div>
                  <div className={styles.statusRow}>
                    <span className={styles.statusKey}><span className={`${styles.statusDot} ${styles.statusDotGrey}`} />GSTR-9</span>
                    <span className={styles.statusValue}>Draft</span>
                  </div>
                </div>
                <div className={styles.mockFoot}><Lock size={13} />Row-level security · ap-south-1 (Mumbai)</div>
              </div>
            </div>
            <div ref={registerReveal}>
              <div className={styles.pLabel}>Kosh Dashboard · Web app</div>
              <h2 className={styles.productTitle}>
                Compliance you can
                <br />
                actually see.
              </h2>
              <span className={styles.tag}>Next.js · Supabase · TypeScript · Recharts</span>
              <p className={styles.desc}>
                A full-stack dashboard on top of Ledger&apos;s data — live tax analytics, a returns tracker, and
                per-business isolation enforced at the database layer, not just in the UI.
              </p>
              <ul className={styles.featureList}>
                {[
                  "Supabase Row-Level Security keeps every business's ledger isolated",
                  'Live tax calculation and analytics, rendered with Recharts',
                  'Returns tracker for GSTR-1, 3B and 9 filing status',
                  'Dark-themed UI built on the Next.js App Router',
                ].map((item) => (
                  <li key={item} className={styles.featureItem}>
                    <Check size={16} />
                    {item}
                  </li>
                ))}
              </ul>
              <div className={styles.productLinks}>
                <Link className={styles.linkBtn} href="/login">Log in to view it ↗</Link>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.stackSection}>
          <div ref={registerReveal} className={`${styles.eyebrow} ${styles.wrap}`} style={{ marginBottom: 34 }}>
            The stack underneath
          </div>
          <div className={styles.marquee}>
            {[...STACK, ...STACK].map((s, i) => (
              <span key={i} className={styles.chip}>{s}</span>
            ))}
          </div>
        </section>

        <section className={styles.featuresSection} id="features">
          <div className={styles.wrap}>
            <div ref={registerReveal} className={`${styles.featuresHead} ${styles.reveal}`}>
              <h2>Built like it has to file on time.</h2>
              <p>Every feature exists because a real GST filing needed it — not because a dashboard template expected it.</p>
            </div>
            <div ref={registerReveal} className={`${styles.fGrid} ${styles.reveal}`}>
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <div key={title} className={styles.fCard}>
                  <Icon size={22} strokeWidth={1.7} />
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.ctaSection} id="contact">
          <div className={styles.wrap}>
            <h2 ref={registerReveal} className={styles.reveal}>
              Built solo, end to end.
            </h2>
            <p ref={registerReveal} className={styles.reveal}>
              Gaurav Kumar — B.Tech CS (Data Science), NSUT New Delhi. Backend, database and frontend, all in one pass.
            </p>
            <div ref={registerReveal} className={`${styles.ctaLinks} ${styles.reveal}`}>
              <a className={`${styles.btn} ${styles.btnPrimary}`} href={LEDGER_REPO} target="_blank" rel="noopener noreferrer">
                View Ledger on GitHub
              </a>
              <a className={`${styles.btn} ${styles.btnGhost}`} href={GITHUB_PROFILE} target="_blank" rel="noopener noreferrer">
                All projects ↗
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerLine}>© 2026 Gaurav Kumar · Built with Next.js, FastAPI, Supabase &amp; Three.js</div>
        <div className={styles.footerLine}>
          <a href={GITHUB_PROFILE} target="_blank" rel="noopener noreferrer">github.com/gaurav26kumar</a>
        </div>
      </footer>
    </div>
  )
}
