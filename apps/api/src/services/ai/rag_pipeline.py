from typing import List, Tuple, Dict, Any
import numpy as np
from sqlalchemy.orm import Session
from models.playbook import Playbook
from services.ai.embeddings import embedding_service

# Thread-safe global cache for playbook embeddings to avoid redundant LLM calls
_playbook_embeddings_cache: Dict[int, List[float]] = {}

def get_cosine_similarity(v1: List[float], v2: List[float]) -> float:
    a = np.array(v1)
    b = np.array(v2)
    dot = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(dot / (norm_a * norm_b))

def index_playbook(playbook: Playbook) -> List[float]:
    # Index playbook content by embedding its name, description, trigger conditions, and compliance rules
    index_text = f"Name: {playbook.name}\nDescription: {playbook.description or ''}\nTrigger Conditions: {playbook.trigger_conditions}\nCompliance: {playbook.compliance_rules}"
    
    # Check cache first
    if playbook.id in _playbook_embeddings_cache:
        return _playbook_embeddings_cache[playbook.id]
        
    emb = embedding_service.get_embedding(index_text)
    if playbook.id:
        _playbook_embeddings_cache[playbook.id] = emb
    return emb

def search_playbooks(
    db: Session, query_text: str, limit: int = 3
) -> List[Tuple[Playbook, float]]:
    playbooks = db.query(Playbook).all()
    if not playbooks:
        return []

    # Get query embedding
    query_emb = embedding_service.get_embedding(query_text)

    scored_playbooks = []
    for playbook in playbooks:
        playbook_emb = index_playbook(playbook)
        sim = get_cosine_similarity(query_emb, playbook_emb)
        scored_playbooks.append((playbook, sim))

    # Sort descending by similarity score
    scored_playbooks.sort(key=lambda x: x[1], reverse=True)
    return scored_playbooks[:limit]
