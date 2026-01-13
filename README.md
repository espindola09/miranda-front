# Miranda Morris — Headless Frontend (Next.js + WooCommerce)

## General Project Context

This project is a **headless frontend** built with **Next.js (App Router)** that consumes an existing **WordPress + WooCommerce** production backend.

### Architecture Overview

- **WooCommerce backend (production):**  
  https://drukdekoracje.pl

- **Headless frontend:**  
  Next.js (App Router)

- **Deployment:**  
  Vercel

### Project Goal

The goal of this project is to **progressively replace the traditional WordPress frontend** with a modern, fast, and scalable **Next.js frontend**, **without impacting the live production site** during development.

### Current Usage

- The Next.js frontend is currently used as a **preview / staging environment**
- It allows the team to:
  - Review UI/UX changes in real time
  - Validate data consistency with WooCommerce
  - Iterate safely before switching production traffic

### Long-Term Vision

- Fully headless architecture
- Improved performance and Core Web Vitals
- Better developer experience
- Gradual rollout without downtime

---

> ⚠️ The WordPress site remains the **single source of truth** during development.