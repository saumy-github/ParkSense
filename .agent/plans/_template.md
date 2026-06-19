# Plan: [short title]

> Copy this file to `.agent/plans/[name].md` before starting work.
> Plans are recommended, not mandatory — but write one whenever the scope is non-trivial
> or when you need to align on approach before spending time on it.

---

## Type
<!-- tick one -->
- [ ] ML / data analysis
- [ ] Feature engineering
- [ ] Website — backend
- [ ] Website — frontend / UX
- [ ] Integration (ML model → website)

---

## Objective
One sentence. What specific problem or capability does this work deliver?

---

## Why this matters for the demo
How does this make the prototype more compelling to judges?
> e.g. "Adds a live heatmap overlay — makes the parking hotspot insight immediately visible without explanation."

---

## Hypothesis / expected outcome
What do you believe will happen? Be specific enough that you can confirm or refute it after.
> e.g. "Clustering violations by 500m grid cells will reveal 3–5 dense hotspots near metro stations."

---

## Approach
Step-by-step — what will be built, in what order.
1.
2.
3.

---

## Inputs
- Datasets / files needed
- Processed parquets or model outputs this work depends on

---

## ML details *(skip if this is a website-only plan)*
- Algorithm / technique:
- CV strategy:
- Params file: `params/_____.yml`
- Expected CV score improvement: current `___` → target `___`
- Basis for estimate:

---

## Website details *(skip if this is an ML-only plan)*
- Page / component affected:
- API endpoint(s) needed:
- What the user/judge will see or be able to do after this:

---

## What success looks like
Define before starting. How will you know this worked?
- [ ] (measurable outcome 1)
- [ ] (measurable outcome 2)

---

## Risks / unknowns
What could block this or make it take longer than expected?

---

## Outputs
Files or changes this work will produce:
- `ML/notebooks/…` — 
- `ML/data/processed/…` — 
- `website/backend/…` — 
- `website/frontend/…` — 

---

*Date:* ___
*Status:* [ ] draft → [ ] in progress → [ ] done
