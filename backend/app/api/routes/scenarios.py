from __future__ import annotations

from fastapi import APIRouter, Depends, status

from app.api.dependencies import get_scenario_service
from app.schemas.common import MessageResponse
from app.schemas.scenario import ScenarioCreate, ScenarioResponse, ScenarioUpdate
from app.services.scenario_service import ScenarioService

router = APIRouter(prefix="/scenarios", tags=["scenarios"])


@router.get("", response_model=list[ScenarioResponse])
async def list_scenarios(service: ScenarioService = Depends(get_scenario_service)) -> list[ScenarioResponse]:
    return await service.list_scenarios()


@router.get("/{scenario_id}", response_model=ScenarioResponse)
async def get_scenario(scenario_id: str, service: ScenarioService = Depends(get_scenario_service)) -> ScenarioResponse:
    return await service.get_scenario(scenario_id)


@router.post("", response_model=ScenarioResponse, status_code=status.HTTP_201_CREATED)
async def create_scenario(
    payload: ScenarioCreate,
    service: ScenarioService = Depends(get_scenario_service),
) -> ScenarioResponse:
    return await service.create_scenario(payload)


@router.put("/{scenario_id}", response_model=ScenarioResponse)
async def update_scenario(
    scenario_id: str,
    payload: ScenarioUpdate,
    service: ScenarioService = Depends(get_scenario_service),
) -> ScenarioResponse:
    return await service.update_scenario(scenario_id, payload)


@router.delete("/{scenario_id}", response_model=MessageResponse)
async def delete_scenario(
    scenario_id: str,
    service: ScenarioService = Depends(get_scenario_service),
) -> MessageResponse:
    await service.delete_scenario(scenario_id)
    return MessageResponse(message="Scenario deleted successfully.")
