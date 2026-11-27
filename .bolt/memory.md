# Project memory

## Product intent & audience

- Spanish-language workplace wellness auditing platform ("bienestar laboral").
- Companies receive an exclusive control panel to run anonymous employee surveys by department and review results.
- Employees complete a short (<5 min) web questionnaire via a unique, 100% anonymous link received by email.
- Platform generates metrics, a final score, and personalized action plans; official certificate + PDF report available when score ≥ 70/100.

## Brand personality & voice

- Spanish content throughout; formal but accessible tone.
- Emphasis on confidentiality, anonymity, and trust ("100% anónimo", "sello de valor", "certificación oficial").
- Enterprise SaaS B2B aesthetic: corporate, clean, maximum business trust.

## Visual design & UX direction

- Stack: Vite + React (JSX), Tailwind CSS, Lucide React icons, `@/` path alias → `src/`.
- Typography: headings use `tracking-tight`; secondary text in elegant neutral grays for readability and contrast hierarchy.
- Depth: 1px low-opacity borders + multi-layer soft shadows on cards/containers; glassmorphism (`backdrop-blur-md`) on fixed access bar and modal.
- Micro-interactions: `duration-200` transitions on buttons and cards; hover elevation + border enhancement on pricing plans and steps; `brightness-110` on primary CTAs.
- Icons: consistent `strokeWidth={1.75}`, rounded containers with soft brand-color tint and subtle `ring-1`.
- Spacing: card padding `p-7`/`p-8`; balanced vertical section spacing; soft gradient separators for breathing room.
- "Cómo Funciona" as 4 numbered step cards (01–04); FAQ uses `ChevronDown`; reusable helpers (`HowItWorksStep`, `FeatureRow`).

## Decisions, constraints & rationale

- Visual polish pass applied globally without altering structure, section order, texts, or existing logic/functionality.
- Public landing page no longer exposes "Correo Trabajador"; worker email intake lives only in Admin control panel.
- Admin panel supports department management and worker email entry (manual + CSV) — preserved as-is.
- "Cómo Funciona" replaced former "Garantía Antifraude Auditable" section.
- Certification threshold fixed at 70/100 for official certificate + PDF report.
- Avoid unused imports/components after refactors.

## Open questions & assumptions

- Scoring methodology and questionnaire content not yet detailed in context.
- PDF certificate/report generation mechanism not yet specified.