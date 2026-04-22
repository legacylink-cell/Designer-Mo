# Mo Studio — Landing Page PRD

## Original problem statement
"i design websites, i want to create a webpage to promote my services. below are my pricing. create a logo for me and add a contact form. make the landing page the best you can do. my name is Mo and this is my Linkedin page: https://www.linkedin.com/in/mohamed-abou-zeid-681a6732/"

## User personas
- **Mo (site owner)**: freelance web designer promoting services; needs leads via contact form.
- **Prospective clients**: founders, marketers, creative teams evaluating Mo for a web project.

## Architecture
- Backend: FastAPI (/api prefix) + MongoDB (motor)
- Frontend: React + Tailwind + Shadcn UI + lucide-react + sonner
- Fonts: Gloock (display) + Outfit (body) + JetBrains Mono (accent)
- Palette: #F3F2ED bg, #121212 ink, #E83B22 vermillion accent, #D5D3CB hairline

## Core requirements (static)
- Bold editorial landing page (magazine feel)
- Monogram "Mo." logo (typographic, no image)
- Services: full-service (design + dev + SEO + maintenance)
- Pricing: 3 tiers (Starter, Professional, Premium) — agent-authored
- Contact form with name, email, company, project type, budget, message
- LinkedIn deep-link in header/about/contact/footer

## Implemented (Dec 2025)
- Backend: POST /api/contact, GET /api/contact (MongoDB contact_submissions), Pydantic EmailStr validation
- Frontend sections: Header, Hero (massive "I DESIGN WEBSITES."), Marquee, Trust strip, About, Services (Bento 4-card), Pricing (3 tiers), Portfolio (4 items), Testimonials (3), Contact form, Footer with giant MO.
- Shadcn Input / Textarea / Select / Label for contact form; sonner toasts
- Scroll reveals, marquee, spinning availability badge, grain overlay
- Accessibility: data-testid on all interactive elements, keyboard-focusable nav

## NOT implemented / deferred
- Resend email integration (user skipped — submissions saved to DB only)
- Admin page to view submissions (use GET /api/contact)
- Custom domain for sender email
- Real portfolio case studies (placeholder brands + stock imagery)
- CMS / blog

## Prioritized backlog
### P0 (next session if requested)
- Add Resend integration when user provides API key + verified domain
- Admin dashboard at /admin to view/filter submissions

### P1
- Real portfolio case-study pages
- Testimonial logos / client list section
- Calendly / Cal.com booking embed

### P2
- Blog / writing section (Sanity or MDX)
- Analytics (Plausible / GA4)
- Multi-language (EN / AR)

## Test credentials
N/A — no auth in this app.
