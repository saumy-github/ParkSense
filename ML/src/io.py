import pandas as pd
import numpy as np
import yaml
from pathlib import Path

ML_ROOT = Path(__file__).parents[1]
cfg = yaml.safe_load(open(ML_ROOT / "configs/global.yml"))

# All paths in global.yml are relative to ML_ROOT
RAW = ML_ROOT / cfg["paths"]["raw"]
PROCESSED = ML_ROOT / cfg["paths"]["processed"]


def load_raw(filename: str) -> pd.DataFrame:
    """Load a file from data/raw/ by exact filename."""
    f = RAW / filename
    if not f.exists():
        raise FileNotFoundError(f"{f} not found. Files in raw/: {list(RAW.iterdir())}")
    return pd.read_parquet(f) if f.suffix == ".parquet" else pd.read_csv(f)


def list_raw() -> list:
    """List all files in data/raw/."""
    return sorted(RAW.iterdir())


def load_processed(name: str) -> pd.DataFrame:
    return pd.read_parquet(PROCESSED / f"{name}.parquet")


def save_processed(df: pd.DataFrame, name: str) -> None:
    PROCESSED.mkdir(parents=True, exist_ok=True)
    out = PROCESSED / f"{name}.parquet"
    df.to_parquet(out, index=False)
    print(f"Saved {out}  shape={df.shape}")


def save_outputs(arr: np.ndarray, name: str, outputs_dir: str = "outputs") -> None:
    Path(outputs_dir).mkdir(parents=True, exist_ok=True)
    np.save(f"{outputs_dir}/{name}.npy", arr)
