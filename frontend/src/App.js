import React, { useEffect, useRef, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";
import Admin from "@/Admin";
import ReviewPage from "@/ReviewPage";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  Linkedin,
  Mail,
  Star,
  Compass,
  Code2,
  Search,
  Wrench,
  CalendarDays,
  Plus,
  Minus,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const CAL_LINK = "m-z-nrbvmu"; // cal.com/m-z-nrbvmu

/* ---------- Analytics tracking ---------- */
const useTrackPageView = () => {
  useEffect(() => {
    // Fire once per session to avoid double-counting on SPA navigations / HMR
    const KEY = "mo_tracked_session";
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(KEY)) return;
    sessionStorage.setItem(KEY, "1");

    let sid = localStorage.getItem("mo_sid");
    if (!sid) {
      sid = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now());
      localStorage.setItem("mo_sid", sid);
    }

    axios
      .post(`${API}/track`, {
        path: window.location.pathname || "/",
        referrer: document.referrer || "",
        screen: `${window.screen.width}x${window.screen.height}`,
        session_id: sid,
      })
      .catch(() => {});
  }, []);
};

/* ---------- Shared helpers ---------- */
const useReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll(".fade-in");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
};

/* ---------- Cal.com initializer ---------- */
const useCalcom = () => {
  useEffect(() => {
    // Official Cal.com embed snippet (namespaced)
    (function (C, A, L) {
      let p = function (a, ar) {
        a.q.push(ar);
      };
      let d = C.document;
      C.Cal =
        C.Cal ||
        function () {
          let cal = C.Cal;
          let ar = arguments;
          if (!cal.loaded) {
            cal.ns = {};
            cal.q = cal.q || [];
            d.head.appendChild(d.createElement("script")).src = A;
            cal.loaded = true;
          }
          if (ar[0] === L) {
            const api = function () {
              p(api, arguments);
            };
            const namespace = ar[1];
            api.q = api.q || [];
            if (typeof namespace === "string") {
              cal.ns[namespace] = cal.ns[namespace] || api;
              p(cal.ns[namespace], ar);
              p(cal, ["initNamespace", namespace]);
            } else p(cal, ar);
            return;
          }
          p(cal, ar);
        };
    })(window, "https://app.cal.com/embed/embed.js", "init");

    if (window.Cal) {
      window.Cal("init", "intro", { origin: "https://cal.com" });
      window.Cal.ns.intro("ui", {
        theme: "light",
        styles: { branding: { brandColor: "#E83B22" } },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    }
  }, []);
};

/* ---------- Logo (Monogram) ---------- */
const Logo = ({ className = "" }) => (
  <a
    href="#top"
    data-testid="brand-logo"
    className={`font-display inline-flex items-baseline select-none ${className}`}
    aria-label="Mo — Home"
  >
    <span className="text-[1.75rem] leading-none tracking-tighter">Mo</span>
    <span className="text-[#E83B22] text-[1.75rem] leading-none">.</span>
  </a>
);

/* ---------- Header ---------- */
const Header = () => {
  const [open, setOpen] = useState(false);
  return (
    <header
      className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-[#F3F2ED]/75 border-b border-[#D5D3CB]"
      data-testid="site-header"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-8 text-[0.78rem] uppercase tracking-[0.18em] text-[#121212]">
          <a href="#work" data-testid="nav-work" className="link-underline">
            Work
          </a>
          <a href="#services" data-testid="nav-services" className="link-underline">
            Services
          </a>
          <a href="#process" data-testid="nav-process" className="link-underline">
            Process
          </a>
          <a href="#pricing" data-testid="nav-pricing" className="link-underline">
            Pricing
          </a>
          <a href="#faq" data-testid="nav-faq" className="link-underline">
            FAQ
          </a>
          <a href="#book" data-testid="nav-book" className="link-underline">
            Book
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-cal-namespace="intro"
            data-cal-link={CAL_LINK}
            data-cal-config='{"layout":"month_view","theme":"light"}'
            data-testid="header-book-call"
            className="btn-ghost !hidden lg:!inline-flex"
          >
            <CalendarDays size={14} /> Book Call
          </button>
          <a
            href="#contact"
            data-testid="header-cta"
            className="btn-primary !hidden md:!inline-flex"
          >
            Hire Me <ArrowUpRight size={14} />
          </a>
          <button
            className="md:hidden border border-[#121212] px-3 py-2 text-xs uppercase tracking-widest"
            data-testid="mobile-menu-toggle"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      {open && (
        <div
          className="md:hidden border-t border-[#D5D3CB] bg-[#F3F2ED] px-6 py-6 flex flex-col gap-4 text-sm uppercase tracking-[0.2em]"
          data-testid="mobile-menu"
        >
          <a href="#work" onClick={() => setOpen(false)}>Work</a>
          <a href="#services" onClick={() => setOpen(false)}>Services</a>
          <a href="#process" onClick={() => setOpen(false)}>Process</a>
          <a href="#pricing" onClick={() => setOpen(false)}>Pricing</a>
          <a href="#faq" onClick={() => setOpen(false)}>FAQ</a>
          <a href="#book" onClick={() => setOpen(false)}>Book</a>
          <a href="#about" onClick={() => setOpen(false)}>About</a>
          <a href="#contact" onClick={() => setOpen(false)}>Contact</a>
          <div className="mt-2 pt-4 border-t border-[#D5D3CB] flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              data-cal-namespace="intro"
              data-cal-link={CAL_LINK}
              data-cal-config='{"layout":"month_view","theme":"light"}'
              data-testid="mobile-menu-book-call"
              onClick={() => setOpen(false)}
              className="btn-ghost justify-center"
            >
              <CalendarDays size={14} /> Book a Call
            </button>
            <a
              href="#contact"
              data-testid="mobile-menu-hire"
              onClick={() => setOpen(false)}
              className="btn-primary justify-center"
            >
              Hire Me <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

/* ---------- Marquee ---------- */
const Marquee = () => {
  const items = [
    "Editorial websites",
    "★",
    "Bespoke development",
    "★",
    "SEO that ranks",
    "★",
    "Ongoing care",
    "★",
    "Brand-led design",
    "★",
  ];
  return (
    <div className="border-y border-[#121212] py-5 overflow-hidden bg-[#121212] text-[#F3F2ED]">
      <div className="marquee">
        {[...items, ...items, ...items].map((t, i) => (
          <span
            key={i}
            className="font-display text-4xl md:text-6xl px-8 whitespace-nowrap"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ---------- Hero ---------- */
const Hero = () => (
  <section
    id="top"
    className="pt-32 md:pt-40 pb-10 md:pb-16"
    data-testid="hero-section"
  >
    <div className="max-w-7xl mx-auto px-6 md:px-12">
      <div className="flex items-center justify-between overline mb-8">
        <span>Portfolio · MMXXV</span>
        <span>Freelance · Remote</span>
      </div>

      <h1 className="font-display uppercase leading-[0.86] tracking-tighter text-[17vw] md:text-[12vw]">
        <span className="reveal-up block">
          <span>I design</span>
        </span>
        <span className="reveal-up block" style={{ animationDelay: "80ms" }}>
          <span>
            websites
            <span className="text-[#E83B22]">.</span>
          </span>
        </span>
      </h1>

      <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
        <div className="md:col-span-5">
          <p className="text-lg md:text-xl leading-relaxed text-[#121212]">
            Freelance web designer &amp; developer crafting bold, editorial
            digital experiences. Concept to launch — design, development, SEO,
            and ongoing care.
          </p>
        </div>
        <div className="md:col-span-4 md:col-start-7">
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#contact" data-testid="hero-cta-primary" className="btn-primary">
              Start a project <ArrowRight size={14} />
            </a>
            <button
              type="button"
              data-cal-namespace="intro"
              data-cal-link={CAL_LINK}
              data-cal-config='{"layout":"month_view","theme":"light"}'
              data-testid="hero-cta-book-call"
              className="btn-ghost"
            >
              <CalendarDays size={14} /> Book a call
            </button>
          </div>
          <a
            href="#work"
            data-testid="hero-cta-secondary"
            className="inline-block mt-4 overline link-underline"
          >
            Or see the work →
          </a>
        </div>
        <div className="md:col-span-2 md:col-start-11 hidden md:flex justify-end">
          <div className="w-28 h-28 rounded-full border border-[#121212] flex items-center justify-center spin-slow">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <path
                  id="circ"
                  d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0"
                />
              </defs>
              <text className="font-mono" fontSize="9" fill="#121212">
                <textPath href="#circ" startOffset="0">
                  AVAILABLE FOR WORK · AVAILABLE FOR WORK ·
                </textPath>
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ---------- Trust strip ---------- */
const TrustStrip = () => (
  <section className="py-8 border-y border-[#D5D3CB]" data-testid="trust-strip">
    <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-6">
      {[
        { k: "5+", v: "Years in design" },
        { k: "50+", v: "Launched sites" },
        { k: "4.9/5", v: "Client rating" },
        { k: "EU / US", v: "Time zones" },
      ].map((s) => (
        <div key={s.v} className="flex flex-col">
          <span className="font-display text-4xl md:text-5xl leading-none">
            {s.k}
          </span>
          <span className="overline mt-2">{s.v}</span>
        </div>
      ))}
    </div>
  </section>
);

/* ---------- About ---------- */
const About = () => (
  <section id="about" className="py-24 md:py-32" data-testid="about-section">
    <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
      <div className="md:col-span-5 fade-in">
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1635862794970-901b01e37213?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85"
            alt="Minimalist designer's desk"
            className="w-full h-[520px] object-cover border border-[#121212] grayscale"
          />
          <div className="absolute -bottom-4 -right-4 bg-[#E83B22] text-white px-4 py-2 overline !text-white">
            Est. 2014
          </div>
        </div>
      </div>
      <div className="md:col-span-7 fade-in">
        <div className="overline">About / 01</div>
        <h2 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight mt-4">
          A one-person studio,<br />
          obsessed with the details.
        </h2>
        <div className="mt-8 text-lg md:text-xl leading-relaxed max-w-2xl text-[#121212]">
          <p>
            I'm Mohamed Abou Zeid — "Mo." for short. I partner with founders,
            operators, and creatives to ship websites that look like a
            magazine, perform like a product, and rank like a pro.
          </p>
          <p className="mt-4 text-[#595959]">
            Every project is a collaboration — I take it personally from the
            first conversation to launch day and beyond. No handoffs, no fluff,
            no templates.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4">
          {["Figma", "React", "Next.js", "Webflow", "Shopify", "SEO"].map(
            (t) => (
              <div
                key={t}
                className="border border-[#D5D3CB] px-4 py-3 font-mono text-sm flex items-center justify-between"
              >
                <span>{t}</span>
                <span className="text-[#E83B22]">✦</span>
              </div>
            )
          )}
        </div>
        <a
          href="https://www.linkedin.com/in/mohamed-abou-zeid-681a6732/"
          target="_blank"
          rel="noreferrer"
          data-testid="about-linkedin-link"
          className="inline-flex items-center gap-2 mt-10 link-underline overline"
        >
          <Linkedin size={14} /> Connect on LinkedIn
        </a>
      </div>
    </div>
  </section>
);

/* ---------- Services (Bento) ---------- */
const Services = () => {
  const items = [
    {
      id: "design",
      title: "Design",
      icon: Compass,
      blurb:
        "Editorial UI, visual systems, and brand-led art direction. Figma-first, built to scale.",
      span: "md:col-span-8 md:row-span-2",
      big: true,
    },
    {
      id: "dev",
      title: "Development",
      icon: Code2,
      blurb:
        "Hand-built React, Next.js, and headless CMS. Fast, accessible, delightful.",
      span: "md:col-span-4",
    },
    {
      id: "seo",
      title: "SEO",
      icon: Search,
      blurb:
        "Technical + on-page. Schema, Core Web Vitals, and content that earns clicks.",
      span: "md:col-span-4",
    },
    {
      id: "care",
      title: "Maintenance",
      icon: Wrench,
      blurb:
        "Ongoing care — updates, monitoring, analytics, iteration. Your site, looked after.",
      span: "md:col-span-12",
    },
  ];

  return (
    <section id="services" className="py-24 md:py-32 border-t border-[#D5D3CB]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="overline">Services / 02</div>
            <h2 className="font-display text-5xl md:text-7xl leading-[0.95] mt-4 tracking-tight">
              Full service.<br />Single point of contact.
            </h2>
          </div>
          <p className="max-w-sm text-[#595959]">
            Design, development, SEO, and ongoing maintenance — delivered by one
            hands-on designer, not a chain of sub-contractors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[minmax(160px,auto)]">
          {items.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                data-testid={`service-card-${s.id}`}
                className={`group border border-[#121212] p-6 md:p-8 bg-[#F3F2ED] flex flex-col justify-between transition-colors hover:bg-[#121212] hover:text-[#F3F2ED] ${s.span}`}
              >
                <div className="flex items-start justify-between">
                  <Icon size={s.big ? 40 : 28} strokeWidth={1.3} />
                  <span className="overline group-hover:text-[#F3F2ED]">
                    0{items.indexOf(s) + 1}
                  </span>
                </div>
                <div className="mt-10">
                  <h3
                    className={`font-display ${
                      s.big ? "text-6xl md:text-8xl" : "text-3xl md:text-4xl"
                    } leading-none tracking-tight`}
                  >
                    {s.title}
                  </h3>
                  <p className="mt-4 max-w-md text-[#595959] group-hover:text-[#EAE9E4]">
                    {s.blurb}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ---------- Pricing ---------- */
const addons = [
  {
    name: "Extra page",
    price: "$350",
    desc: "One more fully-designed, CMS-ready page beyond your tier's allotment.",
  },
  {
    name: "Logo mark",
    price: "$450",
    desc: "A distinctive logo with 2 revision rounds. Delivered as SVG, PNG, and favicon set.",
  },
  {
    name: "Full brand identity",
    price: "$1,200",
    desc: "Logo + palette + typography + a 15-page usage guide. Everything you need to feel official.",
  },
  {
    name: "Copywriting (per ~400-word section)",
    price: "$180",
    desc: "I write the words — SEO-aware, on-brand, one revision round. For pages that look finished but read empty.",
  },
  {
    name: "SEO launch pack",
    price: "$900",
    desc: "Keywords, meta, schema, sitemap, Search Console + GA4 wired up. So you actually show up on Google.",
  },
  {
    name: "E-commerce setup (Shopify / Stripe)",
    price: "$1,200",
    desc: "Up to 10 products, cart + checkout, tax & shipping rules, confirmation emails. Your site, now taking money.",
  },
  {
    name: "CMS add-on (existing site)",
    price: "$1,000",
    desc: "Retrofit a content management system onto a site you already have. Includes schema setup, content migration, and a 30-min training session.",
  },
  {
    name: "Monthly maintenance",
    price: "from $150 / mo",
    desc: "Updates, backups, monitoring, edit hours, and a monthly check-in. The safety net that keeps the site alive.",
  },
  {
    name: "Rush delivery (under 2 weeks)",
    price: "+30%",
    desc: "Skip the queue. I drop other work to ship your project on an aggressive timeline.",
  },
];

const tiers = [
  {
    id: "starter",
    name: "Starter",
    price: "$1,200",
    period: "one-time",
    blurb: "A focused site for founders, freelancers, and small shops.",
    features: [
      "Up to 3 pages",
      "Responsive editorial design",
      "Copy polish (not writing)",
      "Basic on-page SEO",
      "1 round of revisions",
      "Delivery in ~2 weeks",
    ],
    cta: "Book Starter",
  },
  {
    id: "professional",
    name: "Professional",
    price: "$2,800",
    period: "one-time",
    blurb: "For growing brands that need a serious digital presence.",
    features: [
      "Up to 8 pages",
      "Custom design system",
      "Animations & micro-interactions",
      "Full on-page + technical SEO",
      "CMS setup (Sanity / Webflow)",
      "3 rounds of revisions",
      "Delivery in ~3–4 weeks",
    ],
    featured: true,
    cta: "Book Professional",
  },
  {
    id: "premium",
    name: "Premium",
    price: "$5,500",
    period: "one-time",
    blurb: "End-to-end — design, build, rank, and look after.",
    features: [
      "Unlimited pages",
      "Bespoke design + development",
      "Advanced SEO + analytics",
      "CMS + e-commerce ready",
      "Unlimited revisions",
      "3 months maintenance included",
      "Priority support",
      "Delivery in ~6 weeks",
    ],
    cta: "Book Premium",
  },
];

/* ---------- Process ---------- */
const steps = [
  {
    n: "01",
    t: "Discovery",
    d: "~1 week",
    body:
      "We scope goals, audience, success metrics. You get a brief — I get a brain-dump. We align on everything before a pixel is drawn.",
  },
  {
    n: "02",
    t: "Design",
    d: "~2 weeks",
    body:
      "I craft the visual system in Figma — art direction, type, layout. You see work at milestones, not just at the finish line. Revisions baked in.",
  },
  {
    n: "03",
    t: "Build",
    d: "~2 weeks",
    body:
      "Hand-built in React, Next.js or Webflow. Fast, accessible, animated where it matters. Content + CMS + analytics wired up as we go.",
  },
  {
    n: "04",
    t: "Launch",
    d: "~1 week",
    body:
      "Domain, SSL, SEO, redirects, handover. Post-launch sprint to fix the small stuff, then into maintenance if you've signed up.",
  },
];

const Process = () => (
  <section id="process" className="py-24 md:py-32 border-t border-[#D5D3CB]" data-testid="process-section">
    <div className="max-w-7xl mx-auto px-6 md:px-12">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="overline">Process / 03</div>
          <h2 className="font-display text-5xl md:text-7xl leading-[0.95] mt-4 tracking-tight">
            How we work.
          </h2>
        </div>
        <p className="max-w-sm text-[#595959]">
          Clear phases, fixed deliverables, zero handoffs. I'm your single
          point of contact from kickoff to launch.
        </p>
      </div>

      <ol className="grid grid-cols-1 md:grid-cols-4 gap-0 border-t border-[#121212]">
        {steps.map((s, i) => (
          <li
            key={s.n}
            data-testid={`process-step-${s.n}`}
            className={`fade-in relative p-8 md:p-10 border-b md:border-b-0 border-[#121212] ${
              i !== 0 ? "md:border-l" : ""
            } transition-colors group hover:bg-[#121212] hover:text-[#F3F2ED]`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs tracking-[0.22em] text-[#595959] group-hover:text-[#D5D3CB]">
                STEP {s.n}
              </span>
              <span className="font-mono text-xs tracking-[0.18em] text-[#E83B22]">
                {s.d}
              </span>
            </div>
            <h3 className="font-display text-4xl md:text-5xl leading-none mt-10 tracking-tight break-words">
              {s.t}
            </h3>
            <p className="mt-6 text-sm md:text-base leading-relaxed text-[#595959] group-hover:text-[#EAE9E4] max-w-xs">
              {s.body}
            </p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

const Pricing = () => (
  <section id="pricing" className="py-24 md:py-32 border-t border-[#D5D3CB]">
    <div className="max-w-7xl mx-auto px-6 md:px-12">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="overline">Pricing / 04</div>
          <h2 className="font-display text-5xl md:text-7xl leading-[0.95] mt-4 tracking-tight">
            Transparent rates.<br />No surprises.
          </h2>
        </div>
        <p className="max-w-sm text-[#595959]">
          Fixed-price packages with clear deliverables. Custom scopes on
          request — just tell me what you need.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {tiers.map((t, i) => (
          <div
            key={t.id}
            data-testid={`pricing-card-${t.id}`}
            className={`flex flex-col p-8 md:p-10 border ${
              t.featured
                ? "bg-[#121212] text-[#F3F2ED] border-[#121212]"
                : "bg-[#F3F2ED] border-[#121212]"
            }`}
            style={{ borderTopWidth: "6px" }}
          >
            <div className="flex items-center justify-between">
              <span className="overline !text-current opacity-80">
                0{i + 1} · {t.name}
              </span>
              {t.featured && (
                <span className="text-[0.65rem] font-mono uppercase tracking-[0.2em] bg-[#E83B22] text-white px-2 py-1">
                  Popular
                </span>
              )}
            </div>
            <div className="mt-8 flex items-baseline gap-2">
              <span className="font-display text-6xl md:text-7xl leading-none tracking-tight">
                {t.price}
              </span>
              <span className="text-sm opacity-70">/ {t.period}</span>
            </div>
            <p className="mt-4 opacity-80">{t.blurb}</p>

            <ul className="mt-8 space-y-3 flex-1">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm md:text-base">
                  <Check
                    size={18}
                    className={t.featured ? "text-[#E83B22]" : "text-[#E83B22]"}
                    strokeWidth={2.5}
                  />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <a
              href="#contact"
              data-testid={`pricing-cta-${t.id}`}
              className={`mt-10 inline-flex items-center justify-center gap-2 py-3 px-5 text-xs uppercase tracking-[0.18em] transition-colors ${
                t.featured
                  ? "bg-[#F3F2ED] text-[#121212] hover:bg-[#E83B22] hover:text-white"
                  : "bg-[#121212] text-[#F3F2ED] hover:bg-[#E83B22]"
              }`}
            >
              {t.cta} <ArrowRight size={14} />
            </a>
          </div>
        ))}
      </div>

      <p className="mt-10 text-sm text-[#595959]">
        Need something custom? <a href="#contact" className="link-underline text-[#121212]">Get in touch</a> for a tailored quote.
      </p>

      {/* Add-ons */}
      <div className="mt-20 pt-16 border-t border-[#121212]" data-testid="addons-block">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="overline">Add-ons</div>
            <h3 className="font-display text-4xl md:text-5xl leading-[0.95] mt-3 tracking-tight">
              Bolt-ons, <em className="italic">à la carte</em>.
            </h3>
          </div>
          <p className="max-w-sm text-[#595959]">
            Attach any of these to a package — or buy them stand-alone. Fixed
            prices, no surprise line items.
          </p>
        </div>

        <ul className="border-t border-[#D5D3CB]" data-testid="addons-list">
          {addons.map((a, i) => (
            <li
              key={a.name}
              data-testid={`addon-${i}`}
              className="grid grid-cols-12 gap-4 md:gap-8 items-start py-6 border-b border-[#D5D3CB] group hover:pl-3 transition-[padding]"
            >
              <span className="col-span-1 font-mono text-xs tracking-[0.2em] text-[#595959] pt-2">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="col-span-11 md:col-span-8">
                <div className="font-display text-2xl md:text-3xl tracking-tight leading-tight">
                  {a.name}
                </div>
                <p className="mt-2 text-sm md:text-[0.95rem] text-[#595959] leading-relaxed max-w-2xl">
                  {a.desc}
                </p>
              </div>
              <span className="col-span-12 md:col-span-3 md:text-right font-mono text-sm md:text-base text-[#121212] group-hover:text-[#E83B22] transition-colors pt-1 md:pt-2">
                {a.price}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-xs font-mono text-[#595959]">
          Prices in USD, exclusive of applicable tax. Bundling two or more
          add-ons often unlocks a small discount — ask on the call.
        </p>
      </div>
    </div>
  </section>
);

/* ---------- Portfolio ---------- */
const works = [
  {
    t: "E-Vault",
    c: "SaaS · Digital Security",
    img: "/portfolio/e-vault.jpg",
    href: "https://www.e-vault-app.com",
    span: "md:col-span-12",
  },
];

const Portfolio = () => (
  <section id="work" className="py-24 md:py-32 border-t border-[#D5D3CB]">
    <div className="max-w-7xl mx-auto px-6 md:px-12">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="overline">Latest Work / 05</div>
          <h2 className="font-display text-5xl md:text-7xl leading-[0.95] mt-4 tracking-tight">
            A recent <em className="italic">build</em>.
          </h2>
        </div>
        <p className="max-w-sm text-[#595959]">
          Featured project below. Full case-study portfolio available on
          request — just ask on the call or the form.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {works.map((w, i) => {
          const Inner = (
            <>
              <div
                className={`overflow-hidden ${
                  w.fit === "contain" ? "bg-[#F3F2ED] flex items-center justify-center" : ""
                }`}
              >
                <img
                  src={w.img}
                  alt={w.t}
                  className={`w-full h-[420px] md:h-[520px] transition-transform duration-700 group-hover:scale-[1.03] ${
                    w.fit === "contain" ? "object-contain p-6" : "object-cover"
                  }`}
                  loading="lazy"
                />
              </div>
              <figcaption className="flex items-center justify-between px-4 py-3 border-t border-[#121212] bg-[#F3F2ED]">
                <div>
                  <div className="font-display text-xl leading-none">{w.t}</div>
                  <div className="overline mt-1 !text-[0.65rem]">{w.c}</div>
                </div>
                <ArrowUpRight size={18} className="group-hover:text-[#E83B22] transition-colors" />
              </figcaption>
            </>
          );
          const common = `fade-in group overflow-hidden border border-[#121212] block ${w.span}`;
          if (w.href) {
            return (
              <a
                key={w.t}
                href={w.href}
                target="_blank"
                rel="noreferrer"
                data-testid={`work-item-${i}`}
                className={common}
              >
                {Inner}
              </a>
            );
          }
          return (
            <figure
              key={w.t}
              data-testid={`work-item-${i}`}
              className={common}
            >
              {Inner}
            </figure>
          );
        })}
      </div>
    </div>
  </section>
);

/* ---------- Testimonials ---------- */
const hardcodedTestimonials = [
  {
    quote: "Mo designed and built E-Vault end-to-end. The security dashboard is clearer than most banks' — our users actually understand their own risk score. Rare.",
    name: "A. Rivera",
    role: "Co-founder",
    company: "E-Vault",
    rating: 5,
    photo_data_url: null,
  },
  {
    quote: "Easy to work with, incredibly precise. The site feels like a printed magazine — in the best way.",
    name: "Daniel F.",
    role: "CEO",
    company: "Field Coffee Co.",
    rating: 5,
    photo_data_url: null,
  },
  {
    quote: "We finally look like the premium product we are. Our conversion rate jumped 38%.",
    name: "Priya R.",
    role: "Head of Marketing",
    company: "Northwind",
    rating: 5,
    photo_data_url: null,
  },
];

const normaliseReview = (r) => ({
  quote: r.quote,
  name: r.name,
  role: r.role || "",
  company: r.company || "",
  rating: r.rating || 5,
  photo_data_url: r.photo_data_url || null,
});

const TestimonialCard = ({ t, testid }) => (
  <blockquote
    data-testid={testid}
    className="fade-in p-8 bg-[#F3F2ED] border border-[#D5D3CB] h-full flex flex-col"
  >
    <div className="flex gap-1 mb-4 text-[#E83B22]">
      {[...Array(Math.max(1, Math.min(5, t.rating || 5)))].map((_, j) => (
        <Star key={j} size={14} fill="currentColor" stroke="none" />
      ))}
    </div>
    <p className="font-display text-2xl leading-snug tracking-tight flex-1">
      "{t.quote}"
    </p>
    <footer className="mt-6 flex items-center gap-3">
      {t.photo_data_url ? (
        <img
          src={t.photo_data_url}
          alt={t.name}
          className="w-10 h-10 object-cover border border-[#D5D3CB] grayscale"
        />
      ) : null}
      <div className="overline">
        {t.name}
        {(t.role || t.company) && (
          <> — {[t.role, t.company].filter(Boolean).join(", ")}</>
        )}
      </div>
    </footer>
  </blockquote>
);

const Testimonials = () => {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(`${API}/reviews`);
        if (cancelled) return;
        const approved = Array.isArray(res.data) ? res.data : [];
        setItems(approved.map(normaliseReview));
      } catch {
        // ignore — section just stays hidden
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Hide the section entirely until at least one review is approved
  if (!loaded || items.length === 0) return null;

  return (
    <section className="py-24 md:py-32 border-t border-[#D5D3CB] bg-[#EAE9E4]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="overline">Kind words / 06</div>

        {/* Mobile: horizontal snap-carousel. Desktop: 3-col grid */}
        <div
          className="mt-8 md:hidden -mx-6 px-6 flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4"
          data-testid="testimonials-carousel"
          style={{ scrollbarWidth: "none" }}
        >
          {items.map((t, i) => (
            <div
              key={i}
              className="snap-start flex-shrink-0 w-[85%]"
            >
              <TestimonialCard t={t} testid={`testimonial-${i}`} />
            </div>
          ))}
        </div>
        {items.length > 1 && (
          <p className="md:hidden mt-2 font-mono text-[0.65rem] tracking-[0.22em] text-[#595959] uppercase">
            ← Swipe →
          </p>
        )}

        <div className="hidden md:grid grid-cols-3 gap-8 mt-8">
          {items.slice(0, 6).map((t, i) => (
            <TestimonialCard key={i} t={t} testid={`testimonial-desktop-${i}`} />
          ))}
        </div>
      </div>
    </section>
  );
};

/* ---------- FAQ ---------- */
const faqs = [
  {
    q: "Why not just use a template?",
    a: "Templates get you online fast. They don't get you noticed, ranked, or remembered. Every brand I build for has a distinct voice — the site should, too. You'll always pay for it later in redesigns and lost conversions.",
  },
  {
    q: "How long does a project take?",
    a: "Starter ~2 weeks. Professional 3–4 weeks. Premium ~6 weeks. The clock starts once the deposit lands and the brief is signed off.",
  },
  {
    q: "What's included in maintenance?",
    a: "Framework + plugin updates, uptime monitoring, weekly backups, quick content edits, monthly analytics check-in, and a 30-minute call if you need it. Fixed monthly rate, no surprise invoices.",
  },
  {
    q: "Can I cancel the monthly maintenance?",
    a: "Absolutely — no lock-in. Give 30 days' written notice, and I export your codebase, hand over DNS + CMS + analytics access, and you can host anywhere. Your final month is billed in full (non-refundable) and covers the handover work. Clean break, no hostage-taking.",
  },
  {
    q: "What are your payment terms?",
    a: "Project work is paid 100% upfront once scope is agreed and you've submitted the full brief. Once the project kicks off, payments are non-refundable. Monthly maintenance is billed monthly, in advance, for the upcoming month's service. Invoices and receipts are available on request — just ask.",
  },
  {
    q: "Do I keep ownership of the site?",
    a: "100%. The code, design files, and domain are yours. I build host-agnostic — you can move the site anywhere without locking you into a platform.",
  },
  {
    q: "Do you work from existing designs or only from scratch?",
    a: "Both. Send Figma files and I'll build from them. Have rough ideas? I'll design from there. Middle ground — moodboards, competitor screenshots — works great too.",
  },
  {
    q: "How do we get started?",
    a: "Book a free 20-minute intro call above, fill the contact form, or email directly. You'll get a fixed quote + timeline within 48 hours — no pressure, no boilerplate.",
  },
];

const FaqItem = ({ f, i, open, onToggle }) => (
  <div
    data-testid={`faq-item-${i}`}
    className={`border-b border-[#121212] py-6 transition-colors ${
      open ? "bg-[#EAE9E4] -mx-6 md:-mx-10 px-6 md:px-10" : ""
    }`}
  >
    <button
      type="button"
      onClick={onToggle}
      data-testid={`faq-toggle-${i}`}
      className="w-full flex items-start justify-between gap-6 text-left"
      aria-expanded={open}
    >
      <span className="font-display text-2xl md:text-3xl leading-tight tracking-tight">
        {f.q}
      </span>
      <span
        className={`flex-shrink-0 mt-1 transition-transform duration-300 ${
          open ? "rotate-45 text-[#E83B22]" : ""
        }`}
        aria-hidden="true"
      >
        <Plus size={22} strokeWidth={1.5} />
      </span>
    </button>
    <div
      className={`overflow-hidden transition-all duration-300 ease-out ${
        open ? "max-h-[400px] opacity-100 mt-4" : "max-h-0 opacity-0"
      }`}
    >
      <p className="text-[#595959] leading-relaxed max-w-3xl text-base md:text-lg">
        {f.a}
      </p>
    </div>
  </div>
);

const FAQ = () => {
  const [openIdx, setOpenIdx] = useState(-1);
  return (
    <section
      id="faq"
      className="py-24 md:py-32 border-t border-[#D5D3CB]"
      data-testid="faq-section"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
        <div className="md:col-span-4">
          <div className="overline">FAQ / 07</div>
          <h2 className="font-display text-5xl md:text-7xl leading-[0.95] mt-4 tracking-tight">
            Common<br />questions<span className="text-[#E83B22]">.</span>
          </h2>
          <p className="mt-6 text-[#595959] max-w-xs">
            Anything else? Ask on the call or hit the contact form — I reply
            within 24 hours.
          </p>
        </div>
        <div className="md:col-span-8 md:pl-6 md:border-l border-[#D5D3CB]">
          <div className="border-t border-[#121212]">
            {faqs.map((f, i) => (
              <FaqItem
                key={i}
                f={f}
                i={i}
                open={openIdx === i}
                onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ---------- Booking (Cal.com with pre-qualify) ---------- */
const Booking = () => {
  const [pre, setPre] = useState({
    name: "",
    email: "",
    project_type: "",
    budget: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const openCalWithPrefill = async () => {
    if (!pre.name || !pre.email || !pre.project_type || !pre.budget) {
      toast.error("Please fill in name, email, project type, and budget.");
      return;
    }
    try {
      setSaving(true);
      // Fire-and-save: capture the lead even if they don't complete booking
      axios
        .post(`${API}/contact`, {
          name: pre.name,
          email: pre.email,
          project_type: pre.project_type,
          budget: pre.budget,
          message:
            pre.notes ||
            `[Booking pre-qualify] ${pre.project_type} · ${pre.budget}`,
        })
        .catch(() => {});

      // Open Cal modal with prefill values
      // Custom question slugs (project-type, budget) must be set up in Cal.com
      if (window.Cal && window.Cal.ns && window.Cal.ns.intro) {
        window.Cal.ns.intro("modal", {
          calLink: CAL_LINK,
          config: {
            layout: "month_view",
            theme: "light",
            name: pre.name,
            email: pre.email,
            "project-type": pre.project_type,
            budget: pre.budget,
            notes: pre.notes,
          },
        });
        toast.success("Calendar opening — pick a slot!");
      } else {
        // Fallback: open Cal.com in new tab with query params
        const params = new URLSearchParams({
          name: pre.name,
          email: pre.email,
          "project-type": pre.project_type,
          budget: pre.budget,
          notes: pre.notes,
        });
        window.open(`https://cal.com/${CAL_LINK}?${params.toString()}`, "_blank");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      id="book"
      className="py-24 md:py-32 border-t border-[#D5D3CB]"
      data-testid="booking-section"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-start">
          <div className="lg:col-span-5">
            <div className="overline">Book / 08</div>
            <h2 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight mt-4">
              Grab a 20-min<br />intro call<span className="text-[#E83B22]">.</span>
            </h2>
            <p className="mt-6 text-lg text-[#595959] max-w-md">
              Tell me a bit about the project first — I'll come to the call
              prepared. Takes 30 seconds.
            </p>
            <ul className="mt-8 space-y-3 text-sm">
              {[
                "20 minutes, on Zoom",
                "Goals, timeline, budget — no pitch",
                "Honest recommendation, even if it's not me",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <Check size={18} className="text-[#E83B22]" strokeWidth={2.5} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10 pt-6 border-t border-[#D5D3CB] text-xs font-mono text-[#595959] max-w-md">
              Prefer to skip the form? →{" "}
              <button
                type="button"
                data-cal-namespace="intro"
                data-cal-link={CAL_LINK}
                data-cal-config='{"layout":"month_view","theme":"light"}'
                data-testid="booking-skip-cta"
                className="underline hover:text-[#E83B22]"
              >
                open the calendar directly
              </button>
            </div>
          </div>

          <div
            className="lg:col-span-7 border border-[#121212] bg-[#F3F2ED] p-8 md:p-10"
            data-testid="booking-prequalify-card"
          >
            <div className="flex items-center justify-between mb-8">
              <span className="overline">Pre-qualify · 2 min</span>
              <span className="font-mono text-xs text-[#595959]">Step 1 / 2</span>
            </div>

            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                openCalWithPrefill();
              }}
              className="field-line grid grid-cols-1 md:grid-cols-2 gap-6"
              data-testid="booking-form"
            >
              <div>
                <Label className="overline">Name *</Label>
                <Input
                  data-testid="booking-name"
                  value={pre.name}
                  onChange={(e) => setPre({ ...pre, name: e.target.value })}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <Label className="overline">Email *</Label>
                <Input
                  data-testid="booking-email"
                  type="email"
                  value={pre.email}
                  onChange={(e) => setPre({ ...pre, email: e.target.value })}
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <Label className="overline">Project Type *</Label>
                <Select
                  value={pre.project_type}
                  onValueChange={(v) => setPre({ ...pre, project_type: v })}
                >
                  <SelectTrigger
                    data-testid="booking-project-type"
                    data-field
                    className="bg-transparent border-0 border-b-[1.5px] border-[#121212] rounded-none px-0 focus:ring-0"
                  >
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="Design + Development">
                      Design + Development
                    </SelectItem>
                    <SelectItem value="SEO">SEO</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Full service">Full service</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="overline">Budget *</Label>
                <Select
                  value={pre.budget}
                  onValueChange={(v) => setPre({ ...pre, budget: v })}
                >
                  <SelectTrigger
                    data-testid="booking-budget"
                    data-field
                    className="bg-transparent border-0 border-b-[1.5px] border-[#121212] rounded-none px-0 focus:ring-0"
                  >
                    <SelectValue placeholder="Select a range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="< $1,500">Under $1,500</SelectItem>
                    <SelectItem value="$1,500 – $3,000">
                      $1,500 – $3,000
                    </SelectItem>
                    <SelectItem value="$3,000 – $6,000">
                      $3,000 – $6,000
                    </SelectItem>
                    <SelectItem value="$6,000 – $12,000">
                      $6,000 – $12,000
                    </SelectItem>
                    <SelectItem value="$12,000+">$12,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label className="overline">Quick context (optional)</Label>
                <Textarea
                  data-testid="booking-notes"
                  rows={3}
                  value={pre.notes}
                  onChange={(e) => setPre({ ...pre, notes: e.target.value })}
                  placeholder="Timeline, current site, inspiration…"
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-between pt-4 border-t border-[#D5D3CB] gap-4 flex-wrap">
                <p className="text-xs font-mono text-[#595959] max-w-sm">
                  I'll see these answers before we meet, so we can skip the
                  small talk and dive in.
                </p>
                <button
                  type="submit"
                  disabled={saving}
                  data-testid="booking-submit"
                  className="btn-primary"
                >
                  <CalendarDays size={14} />
                  {saving ? "Opening…" : "Find a time →"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Hidden inline embed kept only for the "open calendar directly" fallback flow.
            We drive bookings through the prefilled modal so every lead is pre-qualified. */}
        <div id="cal-inline" className="hidden" data-testid="cal-inline-embed-hidden" />
      </div>
    </section>
  );
};

/* ---------- Contact ---------- */
const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    project_type: "",
    budget: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const update = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target ? e.target.value : e }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.name ||
      !form.email ||
      !form.project_type ||
      !form.budget ||
      !form.message
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      setSubmitting(true);
      const res = await axios.post(`${API}/contact`, form);
      if (res.status === 200 || res.status === 201) {
        toast.success("Thanks — I'll get back to you within 24 hours.");
        setForm({
          name: "",
          email: "",
          company: "",
          project_type: "",
          budget: "",
          message: "",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again or email me directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="py-24 md:py-32 bg-[#121212] text-[#F3F2ED]"
      data-testid="contact-section"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5">
          <div className="overline !text-[#D5D3CB]">Contact / 09</div>
          <h2 className="font-display text-5xl md:text-6xl lg:text-8xl leading-[0.9] tracking-tight mt-4">
            Let's build<br />it<span className="text-[#E83B22]">.</span>
          </h2>
          <p className="mt-8 text-lg md:text-xl text-[#D5D3CB] max-w-md">
            Got a project in mind? Tell me about it. I reply within 24 hours,
            Monday to Friday.
          </p>
          <div className="mt-10 space-y-4 text-sm">
            <a
              href="https://www.linkedin.com/in/mohamed-abou-zeid-681a6732/"
              target="_blank"
              rel="noreferrer"
              data-testid="contact-linkedin"
              className="flex items-center gap-3 link-underline"
              style={{ backgroundImage: "linear-gradient(#F3F2ED,#F3F2ED)" }}
            >
              <Linkedin size={16} /> LinkedIn / mohamed-abou-zeid
            </a>
            <div className="flex items-center gap-3">
              <Mail size={16} /> Reply within 24h
            </div>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
          className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8 field-line field-line-dark"
          data-testid="contact-form"
        >
          <div>
            <Label className="overline !text-[#D5D3CB]">Name *</Label>
            <Input
              data-testid="contact-name"
              value={form.name}
              onChange={update("name")}
              placeholder="Your full name"
              required
            />
          </div>
          <div>
            <Label className="overline !text-[#D5D3CB]">Email *</Label>
            <Input
              data-testid="contact-email"
              type="email"
              value={form.email}
              onChange={update("email")}
              placeholder="you@company.com"
              required
            />
          </div>

          <div>
            <Label className="overline !text-[#D5D3CB]">Company</Label>
            <Input
              data-testid="contact-company"
              value={form.company}
              onChange={update("company")}
              placeholder="Optional"
            />
          </div>

          <div>
            <Label className="overline !text-[#D5D3CB]">Project Type *</Label>
            <Select
              value={form.project_type}
              onValueChange={(v) => setForm((f) => ({ ...f, project_type: v }))}
            >
              <SelectTrigger
                data-testid="contact-project-type"
                data-field
                className="bg-transparent border-0 border-b-[1.5px] rounded-none px-0 focus:ring-0"
              >
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent className="bg-[#121212] text-[#F3F2ED] border-[#F3F2ED]">
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Development">Development</SelectItem>
                <SelectItem value="Design + Development">Design + Development</SelectItem>
                <SelectItem value="SEO">SEO</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Full service">Full service</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label className="overline !text-[#D5D3CB]">Budget *</Label>
            <Select
              value={form.budget}
              onValueChange={(v) => setForm((f) => ({ ...f, budget: v }))}
            >
              <SelectTrigger
                data-testid="contact-budget"
                data-field
                className="bg-transparent border-0 border-b-[1.5px] rounded-none px-0 focus:ring-0"
              >
                <SelectValue placeholder="Select a budget range" />
              </SelectTrigger>
              <SelectContent className="bg-[#121212] text-[#F3F2ED] border-[#F3F2ED]">
                <SelectItem value="< $1,500">Under $1,500</SelectItem>
                <SelectItem value="$1,500 – $3,000">$1,500 – $3,000</SelectItem>
                <SelectItem value="$3,000 – $6,000">$3,000 – $6,000</SelectItem>
                <SelectItem value="$6,000 – $12,000">$6,000 – $12,000</SelectItem>
                <SelectItem value="$12,000+">$12,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label className="overline !text-[#D5D3CB]">Tell me about the project *</Label>
            <Textarea
              data-testid="contact-message"
              value={form.message}
              onChange={update("message")}
              rows={4}
              placeholder="Goals, timeline, inspiration, anything relevant…"
              required
            />
          </div>

          <div className="md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-[#595959]">
            <p className="text-xs text-[#D5D3CB] font-mono">
              By sending, you agree to be contacted about your inquiry. No spam, ever.
            </p>
            <button
              type="submit"
              disabled={submitting}
              data-testid="contact-submit"
              className="inline-flex items-center gap-2 bg-[#F3F2ED] text-[#121212] px-6 py-3 text-xs uppercase tracking-[0.18em] hover:bg-[#E83B22] hover:text-white transition-colors disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Send message"} <ArrowUpRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

/* ---------- Footer ---------- */
const Footer = () => (
  <footer className="pt-20 pb-8 border-t border-[#D5D3CB]" data-testid="site-footer">
    <div className="max-w-7xl mx-auto px-6 md:px-12">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-10">
        <div>
          <div className="overline">Index / End</div>
          <p className="mt-2 max-w-sm text-[#595959]">
            Freelance web designer &amp; developer. Available for new projects
            worldwide.
          </p>
        </div>
        <div className="flex flex-col sm:items-end gap-3 text-sm">
          <a
            href="https://www.linkedin.com/in/mohamed-abou-zeid-681a6732/"
            target="_blank"
            rel="noreferrer"
            data-testid="footer-linkedin"
            className="flex items-center gap-2 link-underline"
          >
            <Linkedin size={14} /> LinkedIn
          </a>
          <a href="#contact" data-testid="footer-contact" className="link-underline">
            Get in touch →
          </a>
        </div>
      </div>

      <div className="mt-12">
        <div className="font-display leading-[0.85] tracking-tighter text-[#121212] text-[28vw] md:text-[22vw] select-none">
          Mo<span className="text-[#E83B22]">.</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs font-mono text-[#595959]">
        <span>© {new Date().getFullYear()} Mohamed Abou Zeid</span>
        <span>Made with care · Texas, USA</span>
      </div>
    </div>
  </footer>
);

/* ---------- Landing ---------- */
const Landing = () => {
  useReveal();
  useCalcom();
  useTrackPageView();
  return (
    <div className="grain relative">
      <Header />
      <main>
        <Hero />
        <Marquee />
        <TrustStrip />
        <About />
        <Services />
        <Process />
        <Pricing />
        <Portfolio />
        <Testimonials />
        <FAQ />
        <Booking />
        <Contact />
      </main>
      <Footer />
      <Toaster position="top-center" richColors />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/review/:token" element={<ReviewPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
