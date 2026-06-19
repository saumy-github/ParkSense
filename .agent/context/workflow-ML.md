# ML Workflow

## Setup boilerplate

Paste this at the top of every notebook. Adjust `src_path` depth based on where the notebook lives.

```python
import sys
from pathlib import Path

# Adjust depth: 1 level deep  → ML/notebooks/1.ipynb
#               2 levels deep → ML/notebooks/Data Cleaning/initial_cleaning.ipynb
src_path = Path("../src")       # 1 level deep
# src_path = Path("../../src")  # 2 levels deep
sys.path.insert(0, str(src_path.resolve()))

import yaml
cfg_path = src_path.parent / "configs/global.yml"
cfg = yaml.safe_load(open(cfg_path))
SEED = cfg["seed"]
N_FOLDS = cfg["n_folds"]
```

---

## Per-run checklist

1. Write `params/*.yml` before training — never hardcode hyperparameters in a notebook
2. Save model artifacts to `outputs/` after every run
3. Append a row to `ML/experiments.csv` immediately after evaluating results
4. Note what changed and what the result was — one line is enough

---

## Logging a run to experiments.csv

```python
import csv, datetime

with open("../../experiments.csv", "a", newline="") as f:  # adjust depth
    csv.writer(f).writerow([
        "nb01_lgbm_v1",              # run_id: short unique name
        "Data Cleaning",             # notebook folder
        "lgbm",                      # model_type: lgbm / xgb / catboost / nn / rule-based
        0.0,                         # cv_score (OOF score on this dataset)
        "hotspot_grid,time_of_day",  # features (comma-separated tags)
        "params/lgbm_v1.yml",        # params_file
        "outputs/preds_lgbm_v1.npy", # output_file
        "baseline clustering run",   # note: what changed, what you were testing
        datetime.datetime.now().isoformat(timespec="minutes"),
    ])
```

---

## experiments.csv columns

| Column | Description |
|---|---|
| run_id | short unique name — e.g. `nb01_lgbm_v1` |
| notebook | folder name under `ML/notebooks/` |
| model_type | lgbm / xgb / catboost / nn / clustering / rule-based |
| cv_score | OOF or validation score on this dataset |
| features | comma-separated feature tags |
| params_file | relative path to the `.yml` used |
| output_file | relative path to saved prediction/output `.npy` |
| note | one line — what changed and what you were testing |
| timestamp | ISO format |

---

## shared/ notebook rules

- Do not run them as-is. Read to extract ideas, then re-implement cleanly.
- For every shared notebook worth studying, create `{name}_notes.md` covering:
  - Where it came from and any known score / result
  - Key techniques or features we haven't tried
  - What looks wrong or unreliable
  - What we will adapt into our next plan
- A technique only enters the pipeline after it shows measurable improvement.

---

## How code is delivered

- Code is given one block at a time — never the entire notebook at once
- Every block is preceded by a plain-English explanation of what it does and why
- Markdown cells are included wherever a section changes
- Do not paste a block until you have read the explanation
