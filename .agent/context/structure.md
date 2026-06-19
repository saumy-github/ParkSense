# Project Structure

> **Rule: whenever this file is updated, verify it by running `find` on the actual codebase — never update from memory.**

This is a two-part hackathon prototype:
- **ML/** — model development, data, notebooks, experiments
- **website/** — prototype web application that demos the solution to judges

```
Poor-Visibility-on-Parking-Induced-Congestion/
  CLAUDE.md                        ← AI instructions and project summary
  .gitignore
  README.md
  requirements.txt
  .vscode/
    settings.json
  .agent/
    context/
      overview.txt                 ← hackathon brief, timeline, prizes, sources
      data.txt                     ← dataset column definitions and notes
      structure.md                 ← this file
      workflow-ML.md               ← notebook boilerplate, logging, run checklist
    plans/
      _template.md                 ← plan template; copy for every new notebook

  ML/
    experiments.csv                ← central run tracker; one row per training run
    configs/
      global.yml                   ← seed, n_folds, target col, id col, paths (all relative to ML/)
    src/
      io.py                        ← load_raw(), load/save processed parquets, save_outputs()
      features.py                  ← feature engineering functions
      cv.py                        ← CV strategy and generic fold runner
      metrics.py                   ← rmse(), mae(), score_report()
    data/
      raw/                         ← original data files; NEVER modify
        jan to may police violation_anonymized791b166.csv
      processed/
        features_index.md          ← index of every saved parquet (name, cols, notebook)
    notebooks/
      1.ipynb                      ← scratch / exploratory notebook
      Data Cleaning/
        initial_cleaning.ipynb
      shared/                      ← reference notebooks; do not run as-is
    Data Cleaning/
      initial_cleaning.ipynb       ← (legacy location; prefer notebooks/Data Cleaning/)

  website/
    backend/
    frontend/
```

## Key rules

- Nothing in `ML/data/raw/` is ever modified. Derived files go to `ML/data/processed/`.
- Every ML notebook has a plan in `.agent/plans/` before coding begins.
- Every training run is logged to `ML/experiments.csv` before moving on.
- Model artifacts are copied to `website/backend/` when ready to demo.
- The website must be runnable locally in under 2 minutes — judges will try it.
