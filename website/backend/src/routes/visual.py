from fastapi import APIRouter
from src.services import visual_service

router = APIRouter(prefix="/hotspots", tags=["visual"])


@router.get("/{cluster_id}/visual-summary")
def visual_summary(cluster_id: str):
    return visual_service.get_visual_summary(cluster_id)


@router.get("/{cluster_id}/frame")
def annotated_frame(cluster_id: str):
    return visual_service.get_annotated_frame(cluster_id)
