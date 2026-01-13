# Miranda Morris — Headless Frontend (Next.js + WooCommerce)

## General Project Context

This project is a **headless frontend** built with **Next.js (App Router)** that consumes an existing **WordPress + WooCommerce** production backend.

---

## Architecture Overview

- **WooCommerce backend (production)**  
  https://drukdekoracje.pl

- **Frontend**  
  Next.js (App Router)

- **Deployment platform**  
  Vercel

---

## Project Goal

The goal of this project is to **progressively replace the traditional WordPress frontend** with a modern, fast, and scalable **Next.js frontend**, **without impacting the live production site** during development.

The WordPress installation remains active and untouched while the new frontend is developed and validated.

---

## Current Usage (Preview / Staging)

- The Next.js frontend is currently used as a **preview / staging environment**
- It allows the team to:
  - Review UI/UX changes in real time
  - Validate data consistency with WooCommerce
  - Test performance, caching, and SEO behavior
  - Iterate safely before switching production traffic

Each Pull Request generates a **Vercel Preview URL** that can be shared with the team for review.

---

## Long-Term Vision

- Fully headless architecture
- Improved performance and Core Web Vitals
- SEO-first approach (metadata, schema, canonicals)
- Better developer experience
- Gradual rollout without downtime

---

## Technical Principles

### Security
- WooCommerce API keys are **server-to-server only**
- No secrets are exposed to the browser
- Credentials are stored as **Vercel Environment Variables**
- Read-only keys are used for catalog data
- Separate credentials are reserved for orders / checkout (future)

### Performance
- Uses **ISR (Incremental Static Regeneration)** to reduce load on WordPress
- Categories and products are cached and revalidated at controlled intervals
- Architecture prepared for on-demand revalidation

### SEO
- SEO is treated as a first-class concern from the beginning
- Category and product pages are designed to support:
  - Canonical URLs
  - Metadata generation
  - Structured data (JSON-LD)

---

> ⚠️ The WordPress site remains the **single source of truth** during development.