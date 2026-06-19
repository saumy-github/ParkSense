import pandas as pd
import numpy as np


def basic_features(df: pd.DataFrame) -> pd.DataFrame:
    """Placeholder — add competition-specific feature engineering here."""
    df = df.copy()
    return df


def encode_categoricals(df: pd.DataFrame, cat_cols: list) -> pd.DataFrame:
    df = df.copy()
    for col in cat_cols:
        df[col] = df[col].astype("category").cat.codes
    return df
