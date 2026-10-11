# Forever IT Institute Management System — Web Application

[![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-v19-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript)](https://www.typescriptlang.org/)

Production-ready responsive web application for **Forever IT Institute** institute management, student registration, course enrollments, payments tracking, printable registration forms, and money receipts.

---

## 1. Prerequisites

- **Node.js**: `v20.x`, `v22.x`, or `v24.x`
- **npm**: `v10.x` or higher
- **Backend API**: Running instance of `forever-it-institute-management-api`

---

## 2. Environment Configuration

Copy the template file to `.env.local`:

```bash
cp .env.example .env.local
```

### Environment Variables:
```env
# Backend API URL (Ensure it matches your API's host and prefix)
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# Institute Branding & Metadata
NEXT_PUBLIC_INSTITUTE_NAME=FOREVER IT INSTITUTE
NEXT_PUBLIC_INSTITUTE_TAGLINE=দক্ষতা গড়ুন, গড়ুন সফল ভবিষ্যৎ
NEXT_PUBLIC_INSTITUTE_WEBSITE=www.foreveritbd.com
```

In production, change `NEXT_PUBLIC_API_URL` to your production API URL (e.g. `https://api.foreveritbd.com/api/v1`).

---

## 3. Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run production build
npm run build

# Start production server
npm run start

# Run unit tests
npm run test

# Run ESLint
npm run lint
```

The web client runs by default on `http://localhost:3000`.

---

## 4. Features & Pages

- **Authentication (`/login`)**: Secure role-based login (Admin, Staff, Viewer) with demo credential shortcuts.
- **Executive Dashboard (`/dashboard`)**: Live KPI metrics (Students, Active Courses, Total Enrollments, Collected Revenue, Outstanding Balance), recent admissions, payment ledger, and distribution charts.
- **Student Registration (`/students/new`)**: Direct digitization of the official Forever IT Institute registration form:
  - Student details (Name, NID/Birth Certificate, Present Address, Mobile, Parents' Name & Mobile).
  - Dynamic course selection with fees fetched from backend API.
  - Advance payment entry, real-time outstanding due calculation, and amount-in-words conversion.
  - Instant print registration form and money receipt generation.
- **Student Directory (`/students`)**: Server-paginated listing with multi-field search and status filters.
- **Student Detail Profile (`/students/[id]`)**: Full student profile with enrollment history, payment transactions, balance summary, and quick "Record Payment" modal.
- **Course Catalog (`/courses`)**: Program management with fee structure, duration, and status toggle.
- **Enrollment Ledger (`/enrollments`)**: Association between students and courses with fee snapshots and discount records.
- **Payments & Receipts (`/payments`)**: Complete transaction ledger, amount-in-words, and authorized reversal workflow.
- **Institutional Reports (`/reports`)**: Dues reconciliation, payment collections breakdown, and enrollment statistics.
- **Printable Registration Form (`/print/registration/[id]`)**: High-fidelity reproduction of the institute's physical admission form optimized for standard A4 paper with student and authorized signature lines.
- **Printable Money Receipt (`/print/receipt/[id]`)**: Official digital money receipt with receipt number, payment details, amount in words, and balance statement.

---

## 5. Print & PDF Optimization

All print templates (`/print/registration/[id]` and `/print/receipt/[id]`) feature:
- Clean `@media print` styling that hides headers, footers, buttons, and navigation elements.
- Optimized margins (`@page { size: A4 portrait; margin: 12mm 15mm; }`).
- High contrast, ink-efficient layouts matching physical document standards.
- Browser "Save as PDF" produces crystal-clear vector documents without UI chrome.

---

## 6. Troubleshooting

- **CORS Error**: Ensure the backend API's `CORS_ORIGIN` environment variable includes your frontend domain (e.g. `http://localhost:3000` or `https://app.foreveritbd.com`).
- **401 Unauthorized**: If a session expires, the client automatically clears stored tokens and redirects to `/login?expired=true`.
