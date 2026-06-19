import numpy as np


def rmse(y_true, y_pred) -> float:
    return float(np.sqrt(np.mean((np.array(y_true) - np.array(y_pred)) ** 2)))


def mae(y_true, y_pred) -> float:
    return float(np.mean(np.abs(np.array(y_true) - np.array(y_pred))))


def score_report(y_true, y_pred) -> None:
    print(f"RMSE : {rmse(y_true, y_pred):.6f}")
    print(f"MAE  : {mae(y_true, y_pred):.6f}")
