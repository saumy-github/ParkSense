import numpy as np
import pandas as pd
from sklearn.model_selection import KFold, StratifiedKFold


def get_kfold(n_folds: int, seed: int):
    return KFold(n_splits=n_folds, shuffle=True, random_state=seed)


def get_stratified_kfold(n_folds: int, seed: int):
    return StratifiedKFold(n_splits=n_folds, shuffle=True, random_state=seed)


def run_cv(model_fn, X: pd.DataFrame, y: pd.Series, cv, fit_params: dict = None):
    """
    Generic CV runner. model_fn(X_tr, y_tr, X_val) -> (model, val_preds).
    Returns (oof_preds, models).
    """
    fit_params = fit_params or {}
    oof = np.zeros(len(y))
    models = []

    for fold, (tr_idx, val_idx) in enumerate(cv.split(X, y)):
        X_tr, X_val = X.iloc[tr_idx], X.iloc[val_idx]
        y_tr = y.iloc[tr_idx]

        model, val_preds = model_fn(X_tr, y_tr, X_val, **fit_params)
        oof[val_idx] = val_preds
        models.append(model)
        print(f"  fold {fold + 1} done")

    return oof, models
