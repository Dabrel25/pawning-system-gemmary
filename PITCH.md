# Gemmary - Pawning System POC

## The Problem

Traditional pawnshops operate on paper tickets, manual calculations, and scattered records. This leads to:

- **Calculation errors** on interest and gold valuations
- **Lost tickets** and disputed transactions
- **No visibility** into daily cash flow or outstanding capital
- **Compliance gaps** with incomplete customer records
- **Slow redemptions** searching through physical files

---

## The Solution

**Gemmary** is a modern, digital pawnshop management system designed specifically for jewelry and pawn operators.

One platform to handle the entire pawn lifecycle—from customer onboarding to loan creation, redemption, and reporting.

---

## What This POC Demonstrates

### 1. Smart Loan Creation

A guided 4-step workflow that captures everything:

| Step | What It Does |
|------|--------------|
| **Customer** | Search existing customers or register new ones with full KYC (photos, ID capture, signature) |
| **Item Details** | Categorize collateral (Gold, Electronics, Mobile) with specialized fields per type |
| **Loan Terms** | Set principal, interest rate, period—system auto-calculates totals and maturity date |
| **Review & Print** | Generate QR-coded ticket ready for printing |

### 2. Gold Valuation Engine

For jewelry items, the system automatically calculates value based on:

- Weight (grams)
- Karat rating (10k–24k)
- Current price per gram
- Purity conversion (e.g., 18k = 75% pure)

**Result**: `Value = Weight × Price/Gram × Purity%`

No more manual lookups or calculator mistakes.

### 3. Real-Time Dashboard

At a glance, operators see:

- Cash disbursed today
- Cash collected today
- Active loans count
- Total capital outstanding
- Loans due within 7 days
- Recent activity feed

### 4. Quick Redemption

Customer walks in with their ticket?

1. Scan or enter ticket number
2. System pulls up loan details instantly
3. Process payment (Cash, Bank Transfer, GCash)
4. Done.

### 5. Customer KYC Capture

Built for compliance from day one:

- Face photo
- ID front & back photos
- Signature capture
- Multiple ID types supported (Driver's License, UMID, PhilHealth, SSS, Passport)
- Watch-list status tracking

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript |
| Build | Vite |
| UI Components | shadcn/ui + Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| State | Zustand + React Query |
| Hosting | Vercel |

**Why this matters**: Modern, maintainable, and scales with your business.

---

## Key Differentiators

| Feature | Traditional Systems | Gemmary |
|---------|---------------------|---------|
| Gold valuation | Manual calculator | Auto-calculated by karat & weight |
| Customer lookup | Paper files | Instant search |
| Ticket tracking | Physical tickets | QR-coded digital tickets |
| Cash flow visibility | End-of-day counting | Real-time dashboard |
| Compliance records | Scattered photos/IDs | Unified customer profiles |

---

## What's Next

This POC validates the core workflow. A full product would add:

- **User authentication** & role-based access
- **Multi-branch support** with consolidated reporting
- **Loan renewals** & partial payment tracking
- **Auction management** for forfeited items
- **Advanced analytics** & exportable reports
- **SMS/notification** reminders for due dates
- **Mobile app** for field appraisals

---

## See It In Action

**Live Demo**: [Your Vercel URL]

### Test Scenarios

1. **Create a new loan** — Go through the 4-step process
2. **Check the dashboard** — See metrics update
3. **Process a redemption** — Search by ticket number
4. **Browse active loans** — Filter by status

---

## The Bottom Line

Gemmary proves that pawnshop operations can be:

- **Faster** — Digital workflows vs. paper shuffling
- **Accurate** — Automated calculations vs. manual errors
- **Visible** — Real-time metrics vs. end-of-day surprises
- **Compliant** — Complete records vs. scattered documentation

**This is the foundation for a modern pawnshop.**

---

*Built with React, TypeScript, Supabase, and deployed on Vercel.*
