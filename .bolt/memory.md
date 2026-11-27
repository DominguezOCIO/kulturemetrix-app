# Project memory

## Product intent & audience

- Spanish-language workplace wellness auditing platform ("bienestar laboral").
- Companies receive an exclusive control panel to run anonymous employee surveys by department and review results.
- Employees complete a short (<5 min) web questionnaire via a unique, 100% anonymous link received by email.
- Platform generates metrics, a final score, and personalized action plans; official certificate + PDF report available when score ≥ 70/100.

## Brand personality & voice

- Spanish content throughout; formal but accessible tone.
- Emphasis on confidentiality, anonymity, and trust ("100% anónimo", "sello de valor", "certificación oficial").

## Visual design & UX direction

- Stack: Vite + React (JSX), Tailwind CSS, Lucide React icons, `@/` path alias → `src/`.
- Aesthetic: production-grade, distinctive, not cookie-cutter; keep existing colors, typography, and style consistent across edits.
- "Cómo Funciona" rendered as 4 numbered step cards (01–04), styled to match existing section/card patterns.
- FAQ uses `ChevronDown` for expand/collapse interaction.
- Reusable helper components preferred for repeated patterns (e.g. `HowItWorksStep`, `FeatureRow`).

## Decisions, constraints & rationale

- Public landing page no longer exposes "Correo Trabajador"; worker email intake lives only in the Admin control panel.
- Admin panel already supports department management and worker email entry (manual + CSV upload) — preserved as-is.
- Replaced "Garantía Antifraude Auditable · Nuestro Sello de Valor" section with "Cómo Funciona" to better explain the workflow.
- Certification threshold fixed at 70/100 for downloadable official certificate + PDF report.
- Avoid unused imports/components after refactors (e.g. removed `ContactoTrabajadorForm`, `EmpresaOption`, related lib calls/icons).

## Open questions & assumptions

- Scoring methodology and questionnaire content not yet detailed in context.
- PDF certificate/report generation mechanism not yet specified.