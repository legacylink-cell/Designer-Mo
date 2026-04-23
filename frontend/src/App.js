import React, { useEffect, useRef, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";
import Admin from "@/Admin";
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
          <a href="#pricing" data-testid="nav-pricing" className="link-underline">
            Pricing
          </a>
          <a href="#book" data-testid="nav-book" className="link-underline">
            Book
          </a>
          <a href="#about" data-testid="nav-about" className="link-underline">
            About
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
          <a href="#pricing" onClick={() => setOpen(false)}>Pricing</a>
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
        { k: "10+", v: "Years in design" },
        { k: "80+", v: "Launched sites" },
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

const Pricing = () => (
  <section id="pricing" className="py-24 md:py-32 border-t border-[#D5D3CB]">
    <div className="max-w-7xl mx-auto px-6 md:px-12">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="overline">Pricing / 03</div>
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
    </div>
  </section>
);

/* ---------- Portfolio ---------- */
const works = [
  {
    t: "Atelier Nord",
    c: "Editorial · Fashion",
    img: "https://images.pexels.com/photos/4884116/pexels-photo-4884116.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1400",
    span: "md:col-span-7",
  },
  {
    t: "Field Coffee Co.",
    c: "E-commerce · Food",
    img: "https://images.pexels.com/photos/6278748/pexels-photo-6278748.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1400",
    span: "md:col-span-5",
  },
  {
    t: "Hestia Studio",
    c: "Agency · Portfolio",
    img: "https://images.unsplash.com/photo-1522199710521-72d69614c702?auto=format&fit=crop&w=1400&q=80",
    span: "md:col-span-5",
  },
  {
    t: "Northwind Finance",
    c: "Marketing · Fintech",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80",
    span: "md:col-span-7",
  },
];

const Portfolio = () => (
  <section id="work" className="py-24 md:py-32 border-t border-[#D5D3CB]">
    <div className="max-w-7xl mx-auto px-6 md:px-12">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="overline">Selected Work / 04</div>
          <h2 className="font-display text-5xl md:text-7xl leading-[0.95] mt-4 tracking-tight">
            A few recent <em className="italic">things</em>.
          </h2>
        </div>
        <p className="max-w-sm text-[#595959]">
          A sample of brands I've helped launch, relaunch, and grow. Full case
          studies on request.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {works.map((w, i) => (
          <figure
            key={w.t}
            data-testid={`work-item-${i}`}
            className={`fade-in group overflow-hidden border border-[#121212] ${w.span}`}
          >
            <div className="overflow-hidden">
              <img
                src={w.img}
                alt={w.t}
                className="w-full h-[420px] md:h-[520px] object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>
            <figcaption className="flex items-center justify-between px-4 py-3 border-t border-[#121212] bg-[#F3F2ED]">
              <div>
                <div className="font-display text-xl leading-none">{w.t}</div>
                <div className="overline mt-1 !text-[0.65rem]">{w.c}</div>
              </div>
              <ArrowUpRight size={18} className="group-hover:text-[#E83B22] transition-colors" />
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  </section>
);

/* ---------- Testimonials ---------- */
const testimonials = [
  {
    q: "Mo redesigned our site and traffic doubled in three months. He gets both the art and the analytics.",
    a: "Lena K.",
    r: "Founder, Atelier Nord",
  },
  {
    q: "Easy to work with, incredibly precise. The site feels like a printed magazine — in the best way.",
    a: "Daniel F.",
    r: "CEO, Field Coffee Co.",
  },
  {
    q: "We finally look like the premium product we are. Our conversion rate jumped 38%.",
    a: "Priya R.",
    r: "Head of Marketing, Northwind",
  },
];

const Testimonials = () => (
  <section className="py-24 md:py-32 border-t border-[#D5D3CB] bg-[#EAE9E4]">
    <div className="max-w-7xl mx-auto px-6 md:px-12">
      <div className="overline">Kind words / 05</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        {testimonials.map((t, i) => (
          <blockquote
            key={i}
            data-testid={`testimonial-${i}`}
            className="fade-in p-8 bg-[#F3F2ED] border border-[#D5D3CB]"
          >
            <div className="flex gap-1 mb-4 text-[#E83B22]">
              {[...Array(5)].map((_, j) => (
                <Star key={j} size={14} fill="currentColor" stroke="none" />
              ))}
            </div>
            <p className="font-display text-2xl leading-snug tracking-tight">
              "{t.q}"
            </p>
            <footer className="mt-6 overline">
              {t.a} — {t.r}
            </footer>
          </blockquote>
        ))}
      </div>
    </div>
  </section>
);

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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start">
          <div className="md:col-span-5">
            <div className="overline">Book / 06</div>
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
            className="md:col-span-7 border border-[#121212] bg-[#F3F2ED] p-8 md:p-10"
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
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-5">
          <div className="overline !text-[#D5D3CB]">Contact / 07</div>
          <h2 className="font-display text-6xl md:text-8xl leading-[0.9] tracking-tight mt-4">
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
          className="md:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8 field-line"
          data-testid="contact-form"
        >
          <div>
            <Label className="overline !text-[#D5D3CB]">Name *</Label>
            <Input
              data-testid="contact-name"
              value={form.name}
              onChange={update("name")}
              placeholder="Your full name"
              className="text-[#F3F2ED]"
              style={{ color: "#F3F2ED", borderBottomColor: "#F3F2ED" }}
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
              style={{ color: "#F3F2ED", borderBottomColor: "#F3F2ED" }}
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
              style={{ color: "#F3F2ED", borderBottomColor: "#F3F2ED" }}
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
                className="bg-transparent text-[#F3F2ED] border-0 border-b-[1.5px] rounded-none px-0 focus:ring-0"
                style={{ color: "#F3F2ED", borderBottomColor: "#F3F2ED" }}
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
                className="bg-transparent text-[#F3F2ED] border-0 border-b-[1.5px] rounded-none px-0 focus:ring-0"
                style={{ color: "#F3F2ED", borderBottomColor: "#F3F2ED" }}
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
              style={{ color: "#F3F2ED", borderBottomColor: "#F3F2ED" }}
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
      <div className="flex items-start justify-between flex-wrap gap-6">
        <div>
          <div className="overline">Index / End</div>
          <p className="mt-2 max-w-sm text-[#595959]">
            Freelance web designer &amp; developer. Available for new projects
            worldwide.
          </p>
        </div>
        <div className="flex flex-col items-end gap-3 text-sm">
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

      <div className="mt-6 flex items-center justify-between text-xs font-mono text-[#595959]">
        <span>© {new Date().getFullYear()} Mohamed Abou Zeid</span>
        <span>Made with care · Cairo ↔ Worldwide</span>
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
        <Pricing />
        <Portfolio />
        <Testimonials />
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
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
