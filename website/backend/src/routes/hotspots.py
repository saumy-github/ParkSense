from fastapi import APIRouter
from src.services import hotspot_service

router = APIRouter(prefix="/hotspots", tags=["hotspots"])


@router.get("")
def list_hotspots():
    return hotspot_service.get_all_hotspots()


@router.get("/details")
def all_hotspot_details():
    return hotspot_service.get_all_hotspot_details()


@router.get("/{cluster_id}")
def hotspot_detail(cluster_id: str):
    return hotspot_service.get_hotspot_by_id(cluster_id)
