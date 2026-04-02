# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static website for **FC Design Services LLC (FCDS)** — a contract electronics design and manufacturing company in Mason, OH. Replaces a compromised WordPress site at fcdesignservices.com. Hosted on **Cloudflare Pages** via GitHub.

Full requirements are in `claude-code-prompt-static-site.md`.

## Tech Stack

- Pure static HTML5/CSS3/JavaScript — no frameworks, no server-side code, no databases
- Contact form via third-party service (Formspree, Netlify Forms, or similar)
- Deployment: push to GitHub → Cloudflare Pages auto-deploys

## Site Structure

4 pages: Home (`index.html`), About (`about.html`), Services (`services.html`), Contact (`contact.html`)

## Branding

- Primary: Navy `#262D63`
- Secondary: Teal `#276E8B`
- Fonts: Calibri / Proxima Nova (use system fonts or Google Fonts equivalents)
- Logo: `logo_FCDS.png`
- Aesthetic: professional, clean, trustworthy

## Key Details

- Company: FC Design Services LLC, 757 Reading Rd, Suite B2b, Mason, OH 45040
- "FC" stands for "For Christ" (faith-driven mission)
- Services: electronics product design (incl. IoT/complex machines), PCB assembly & manufacturing, box build assembly, custom battery packs (via partner), R&D support
- Terminology: use "design/designer" not "engineer/engineering"
- Tagline: "Customized Product Design Solutions for Every Project"
- Testimonials: simple static cards (no carousel)
- Must be mobile responsive, fast loading, SEO optimized
