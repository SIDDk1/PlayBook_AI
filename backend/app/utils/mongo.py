from __future__ import annotations

from datetime import datetime
from typing import Any

from bson import ObjectId


def is_valid_object_id(value: str) -> bool:
    return ObjectId.is_valid(value)


def to_object_id(value: str) -> ObjectId:
    if not is_valid_object_id(value):
        raise ValueError(f"Invalid ObjectId: {value}")
    return ObjectId(value)


def normalize_document(document: dict[str, Any] | None) -> dict[str, Any] | None:
    if not document:
        return None

    normalized = dict(document)
    normalized["id"] = str(normalized.pop("_id"))
    return normalized


def prepare_write_payload(payload: dict[str, Any]) -> dict[str, Any]:
    cleaned = {key: value for key, value in payload.items() if value is not None}
    if "id" in cleaned:
        cleaned.pop("id")

    for key, value in list(cleaned.items()):
        if isinstance(value, datetime):
            cleaned[key] = value

    return cleaned
