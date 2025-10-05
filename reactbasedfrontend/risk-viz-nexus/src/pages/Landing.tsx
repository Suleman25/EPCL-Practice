import { Link } from "react-router-dom";
import * as React from "react";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { LayoutTextFlip } from "@/components/ui/layout-text-flip";
import { Button } from "@/components/ui/button";
import { BlurText } from "@/components/ui/blur-text";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { Navbar } from "@/components/layout/Navbar";
import { LayoutGrid, type LayoutGridCard } from "@/components/ui/layout-grid";
import { MapPin, Phone, Twitter, Github, Linkedin } from "lucide-react";
import { Marquee } from "@/components/magicui/marquee";

// ====== How it works items (use the original cards) ======
const howSteps = [
  { n: 1, title: "Upload", text: "Excel (.xlsx) workbook upload karein." },
  { n: 2, title: "Auto‑Map", text: "Columns ko canonical schema se map karein." },
  { n: 3, title: "Visualize", text: "Trends, departments, and KPIs turant dekhein." },
  { n: 4, title: "Share", text: "Plots/insights ko team ke sath share karein." },
];

export default function Landing() {
  // Section-scoped scroll progress
  const sectionRef = React.useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const spring = { stiffness: 300, damping: 30, bounce: 0 };
  const leftY = useSpring(useTransform(scrollYProgress, [0, 1], [0, -120]), spring);
  const rightY = useSpring(useTransform(scrollYProgress, [0, 1], [0, -200]), spring);
  // Background ripple effect covers the whole page; no parallax needed now
  const fadeIn = useSpring(useTransform(scrollYProgress, [0, 0.2], [0.9, 1]), spring);

  // Page-wide scroll progress (for below sections)
  const pageRef = React.useRef<HTMLDivElement | null>(null);
  const { scrollYProgress: pageProgress } = useScroll({ target: pageRef, offset: ["start start", "end end"] });
  const featuresHeaderY = useSpring(useTransform(pageProgress, [0, 1], [0, -80]), spring);
  const featuresGridY = useSpring(useTransform(pageProgress, [0, 1], [0, -140]), spring);
  const howY = useSpring(useTransform(pageProgress, [0, 1], [0, -160]), spring);
  const ctaY = useSpring(useTransform(pageProgress, [0, 1], [0, -200]), spring);

  // Hover state for "At a glance" tiles
  const [hoveredGlance, setHoveredGlance] = React.useState<number | null>(null);

  // Cards for LayoutGrid on Features section (compact, solid backgrounds)
  const cards: LayoutGridCard[] = [
    {
      id: 1,
      className: "col-span-1",
      content: (
        <div>
          <h3 className="font-bold text-xl text-emerald-300">Dashboard</h3>
          <p className="text-sm mt-2 max-w-md text-neutral-300">KPIs, time‑series and stacked analytics overview.</p>
        </div>
      ),
    },
    {
      id: 2,
      className: "col-span-1",
      content: (
        <div>
          <h3 className="font-bold text-xl text-sky-300">Analytics</h3>
          <p className="text-sm mt-2 max-w-md text-neutral-300">Advanced charts: trends, comparisons, distributions.</p>
        </div>
      ),
    },
    {
      id: 3,
      className: "col-span-1",
      content: (
        <div>
          <h3 className="font-bold text-xl text-amber-300">Workbook</h3>
          <p className="text-sm mt-2 max-w-md text-neutral-300">Upload/inspect workbook, defaults & schema mapping.</p>
        </div>
      ),
    },
    {
      id: 4,
      className: "col-span-1",
      content: (
        <div>
          <h3 className="font-bold text-xl text-violet-300">Hazards & Incidents</h3>
          <p className="text-sm mt-2 max-w-md text-neutral-300">Conversion funnel, time lag, department matrix, risk network.</p>
        </div>
      ),
    },
    {
      id: 5,
      className: "col-span-1",
      content: (
        <div>
          <h3 className="font-bold text-xl text-rose-300">Maps</h3>
          <p className="text-sm mt-2 max-w-md text-neutral-300">Geo visualizations for locations & hotspots.</p>
        </div>
      ),
    },
    {
      id: 6,
      className: "col-span-1",
      content: (
        <div>
          <h3 className="font-bold text-xl text-cyan-300">Wordclouds</h3>
          <p className="text-sm mt-2 max-w-md text-neutral-300">Text insights: frequent terms and categories.</p>
        </div>
      ),
    },
    {
      id: 7,
      className: "col-span-1",
      content: (
        <div>
          <h3 className="font-bold text-xl text-lime-300">AI Agent</h3>
          <p className="text-sm mt-2 max-w-md text-neutral-300">Natural language agent to query and summarize data.</p>
        </div>
      ),
    },
    {
      id: 8,
      className: "col-span-1",
      content: (
        <div>
          <h3 className="font-bold text-xl text-indigo-300">Reports</h3>
          <p className="text-sm mt-2 max-w-md text-neutral-300">Exportable reports (coming soon).</p>
        </div>
      ),
    },
    {
      id: 9,
      className: "col-span-1",
      content: (
        <div>
          <h3 className="font-bold text-xl text-fuchsia-300">Settings</h3>
          <p className="text-sm mt-2 max-w-md text-neutral-300">Preferences and configuration (coming soon).</p>
        </div>
      ),
    },
  ];

  return (
    <div ref={pageRef} className="relative min-h-screen h-full bg-background text-foreground dark">
      <BackgroundRippleEffect
        className="absolute inset-0 z-[1] [--cell-border-color:rgba(245,220,180,0.4)] [--cell-shadow-color:rgba(245,220,180,0.2)]"
      />
      <Navbar />

      {/* Main content (scrollable by default when taller than viewport) */}
      <main className="relative z-10 pb-1">
        {/* Hero */}
        <section ref={sectionRef} className="relative overflow-hidden min-h-[85vh] flex items-center py-12 md:py-20">
          <div className="relative z-10 max-w-7xl mx-auto px-6 mt-12 md:mt-20">
            <div className="grid grid-cols-1 gap-10 items-center justify-items-center">
              <motion.div style={{ opacity: fadeIn }} className="text-center mx-auto max-w-5xl">
                <LayoutTextFlip
                  text="Enhance safety with actionable"
                  words={["analytics.", "insights.", "intelligence.", "decisions."]}
                  className="justify-center"
                  duration={2000}
                  textClassName="font-jakarta text-5xl md:text-7xl font-extrabold leading-tight text-center text-white"
                  pillClassName="font-jakarta text-emerald-400 text-4xl md:text-6xl font-extrabold leading-tight text-center"
                />
                <p className="mt-4 text-lg text-neutral-300 text-center max-w-3xl mx-auto">
                  Upload your workbook and instantly see incident trends, department performance,
                  hazards → incidents conversion, and more — powered by interactive analytics.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Button asChild className="rounded-full h-11 px-6">
                    <Link to="/dashboard">
                      <BlurText
                        as="span"
                        text="Get Started — Dashboard"
                        animateBy="words"
                        delay={80}
                        className="inline-flex"
                        easing="easeOut"
                      />
                    </Link>
                  </Button>
                  <HoverBorderGradient
                    as="button"
                    onClick={() => {
                      const el = document.getElementById("features");
                      el?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    containerClassName="rounded-full"
                    className="rounded-full h-10 px-5 bg-white/10 text-white flex items-center space-x-2"
                  >
                    <span className="font-medium">Explore Features</span>
                    <span aria-hidden>→</span>
                  </HoverBorderGradient>
                </div>
                <div className="mt-3 text-sm text-neutral-400 text-center">
                  Dev tip: You can find the dashboard at <code>/dashboard</code>
                </div>
                </motion.div>

              {/* Full-width At a glance panel under the title */}
              <motion.div style={{ opacity: fadeIn }} className="w-full mt-6">
                <div className="rounded-2xl bg-[#1c1f26] border border-white/10 shadow p-6 md:p-8">
                  <div className="text-sm text-neutral-400 mb-4">At a glance</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 text-sm">
                    <div
                      onMouseEnter={() => setHoveredGlance(0)}
                      onMouseLeave={() => setHoveredGlance(null)}
                      className="rounded-xl border border-emerald-500/20 bg-emerald-950/25 p-5 transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="text-neutral-400">Last 90 days</div>
                      <div className={hoveredGlance === 0 ? "text-2xl font-semibold text-emerald-300 drop-shadow-[0_0_0.45rem_rgba(16,185,129,0.35)]" : "text-2xl font-semibold text-emerald-300 drop-shadow-[0_0_0.45rem_rgba(16,185,129,0.25)]"}>Incidents</div>
                      <div className={"mt-1 font-medium " + (hoveredGlance === 0 ? "text-emerald-400" : "text-emerald-400")}>Live on dashboard</div>
                    </div>
                    <div
                      onMouseEnter={() => setHoveredGlance(1)}
                      onMouseLeave={() => setHoveredGlance(null)}
                      className="rounded-xl border border-sky-500/20 bg-sky-950/20 p-5 transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="text-neutral-400">Real‑time</div>
                      <div className={hoveredGlance === 1 ? "text-2xl font-semibold text-emerald-300 drop-shadow-[0_0_0.45rem_rgba(16,185,129,0.35)]" : "text-2xl font-semibold text-sky-300 drop-shadow-[0_0_0.45rem_rgba(56,189,248,0.25)]"}>Hazards → Incidents</div>
                      <div className={"mt-1 font-medium " + (hoveredGlance === 1 ? "text-emerald-400" : "text-sky-400")}>Conversion</div>
                    </div>
                    <div
                      onMouseEnter={() => setHoveredGlance(2)}
                      onMouseLeave={() => setHoveredGlance(null)}
                      className="rounded-xl border border-amber-500/25 bg-amber-950/15 p-5 transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="text-neutral-400">Maps</div>
                      <div className={hoveredGlance === 2 ? "text-2xl font-semibold text-emerald-300 drop-shadow-[0_0_0.45rem_rgba(16,185,129,0.35)]" : "text-2xl font-semibold text-amber-300 drop-shadow-[0_0_0.45rem_rgba(245,158,11,0.25)]"}>Geo insights</div>
                      <div className={"mt-1 font-medium " + (hoveredGlance === 2 ? "text-emerald-400" : "text-amber-400")}>Hotspots</div>
                    </div>
                    <div
                      onMouseEnter={() => setHoveredGlance(3)}
                      onMouseLeave={() => setHoveredGlance(null)}
                      className="rounded-xl border border-violet-500/20 bg-violet-950/20 p-5 transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="text-neutral-400">AI Agent</div>
                      <div className={hoveredGlance === 3 ? "text-2xl font-semibold text-emerald-300 drop-shadow-[0_0_0.45rem_rgba(16,185,129,0.35)]" : "text-2xl font-semibold text-violet-300 drop-shadow-[0_0_0.45rem_rgba(139,92,246,0.25)]"}>Ask your data</div>
                      <div className={"mt-1 font-medium " + (hoveredGlance === 3 ? "text-emerald-400" : "text-violet-400")}>Natural language</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-12 scroll-mt-24">
          <motion.div style={{ y: featuresHeaderY }}>
            <h2 className="text-3xl font-bold">All Features</h2>
            <p className="mt-2 text-neutral-400">Project ke tamam modules aik jaga — neeche cards se navigate karein.</p>
          </motion.div>

          <motion.div style={{ y: featuresGridY }} className="mt-8">
            <LayoutGrid
              cards={cards}
              rowHeightClass="auto-rows-[11rem]"
              solidColors={[
                "bg-emerald-950/20",
                "bg-sky-950/20",
                "bg-amber-950/15",
                "bg-violet-950/20",
                "bg-rose-950/15",
                "bg-cyan-950/20",
                "bg-lime-950/15",
                "bg-indigo-950/20",
                "bg-fuchsia-950/20",
              ]}
              borderOverrides={[
                "border-emerald-500/20",
                "border-sky-500/20",
                "border-amber-500/25",
                "border-violet-500/20",
                "border-rose-500/20",
                "border-cyan-500/20",
                "border-lime-500/20",
                "border-indigo-500/20",
                "border-fuchsia-500/20",
              ]}
            />
          </motion.div>
        </section>

        {/* How it works (Marquee with original HowStep cards) */}
        <section id="how" className="max-w-7xl mx-auto px-6 py-12 scroll-mt-24">
          <motion.h2 style={{ y: howY }} className="text-3xl font-bold">How it works</motion.h2>
          <motion.div style={{ y: howY }} className="relative mt-6 flex w-full flex-col items-center justify-center overflow-hidden">
            <Marquee pauseOnHover className="[--duration:20s]" gap="0px">
              {howSteps.map((s) => (
                <div key={`how-1-${s.n}`} className="w-72 h-44 m-3 shrink-0">
                  <HowStep n={s.n} title={s.title} text={s.text} />
                </div>
              ))}
            </Marquee>
            <Marquee reverse pauseOnHover className="[--duration:20s]" gap="0px">
              {howSteps.map((s) => (
                <div key={`how-2-${s.n}`} className="w-72 h-44 m-3 shrink-0">
                  <HowStep n={s.n} title={s.title} text={s.text} />
                </div>
              ))}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-[#0f1115] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-[#0f1115] to-transparent" />
          </motion.div>
        </section>

        {/* Final CTA */}
        <section id="cta" className="max-w-7xl mx-auto px-6 py-12 scroll-mt-24">
          <motion.div style={{ y: ctaY }} className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 shadow p-8 text-center text-neutral-200">
            <h3 className="text-2xl font-semibold">Ready to explore your HSE data?</h3>
            <p className="mt-2 text-neutral-400">Dashboard par jayein aur interactive analytics se insights hasil karein.</p>
            <div className="mt-6">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-full px-6 py-3 bg-emerald-600 text-white"
              >
                Go to Dashboard
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer (rounded, dark, multi-column) */}
      <footer className="relative z-10 mx-auto max-w-7xl px-6 py-10 pb-20">
        <div className="rounded-3xl bg-[#1a1d22] border border-white/10 p-8 md:p-10 text-neutral-300">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Brand + blurb */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-lime-500 shadow-md shadow-emerald-500/30" />
                <span className="text-white font-semibold text-lg">Safety Copilot</span>
              </div>
              <p className="mt-3 text-sm text-neutral-400">
                AI‑powered safety analysis and visualization across incidents, hazards, audits and inspections.
              </p>
              <div className="mt-3 flex items-center gap-2 text-neutral-400 text-sm">
                <MapPin className="h-4 w-4" /> Karachi, PK
              </div>
              <div className="mt-4 flex items-center gap-3 text-neutral-300">
                <a href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition" aria-label="Twitter"><Twitter className="h-4 w-4" /></a>
                <a href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition" aria-label="GitHub"><Github className="h-4 w-4" /></a>
                <a href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition" aria-label="LinkedIn"><Linkedin className="h-4 w-4" /></a>
              </div>
            </div>

            {/* Links */}
            <div>
              <div className="text-white font-medium">Product</div>
              <ul className="mt-3 space-y-2 text-sm text-neutral-400">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#how" className="hover:text-white transition">Use Cases</a></li>
                <li><a href="#" className="hover:text-white transition">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <div className="text-white font-medium">Resources</div>
              <ul className="mt-3 space-y-2 text-sm text-neutral-400">
                <li><Link to="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
                <li><a href="#features" className="hover:text-white transition">Analytics</a></li>
                <li><a href="#" className="hover:text-white transition">Copilot</a></li>
              </ul>
            </div>
            <div>
              <div className="text-white font-medium">Contact</div>
              <ul className="mt-3 space-y-2 text-sm text-neutral-400">
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> 8th Floor, The Harbour Front Building, Marine Drive, Block 4, Clifton, Karachi</li>
                <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +92 21 111 411 411</li>
                <li>
                  <div className="text-neutral-300">Office Hours</div>
                  <div className="text-neutral-400">Mon to Fri: 9 am – 5 pm (PST)</div>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
            <div className="flex items-center gap-2">
              <span>© 2025 Engro Polymer & Chemicals. All rights reserved.</span>
              <span className="hidden md:inline">•</span>
              <span>Powered by Safety Copilot</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-neutral-300 transition">Privacy Policy</a>
              <a href="#" className="hover:text-neutral-300 transition">Disclaimer</a>
              <a href="#" className="hover:text-neutral-300 transition">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// removed old FeatureCard as HoverEffect is now used for Features

function HowStep({ n, title, text }: { n: number; title: string; text: string }) {
  return (
    <div className="group h-full box-border rounded-xl bg-[#1c1f26] border border-white/10 p-5 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md hover:border-white/20 hover:bg-[#22262e]">
      <div className="text-xs font-medium text-neutral-400">Step {n}</div>
      <div className="mt-1 font-semibold text-neutral-100">{title}</div>
      <div className="mt-1 text-sm text-neutral-300">{text}</div>
    </div>
  );
}
