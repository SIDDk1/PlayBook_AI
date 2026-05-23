from typing import List
import numpy as np
from openai import OpenAI
from config.settings import settings

class EmbeddingService:
    def __init__(self):
        self.enabled = bool(settings.OPENAI_API_KEY)
        if self.enabled:
            self.client = OpenAI(api_key=settings.OPENAI_API_KEY)

    def get_embedding(self, text: str) -> List[float]:
        if not self.enabled:
            # Generate deterministic mock embedding of size 1536 based on string hash for offline demo stability
            np.random.seed(abs(hash(text)) % (2**32))
            mock_emb = np.random.normal(0, 1, 1536)
            norm = np.linalg.norm(mock_emb)
            return (mock_emb / (norm if norm > 0 else 1)).tolist()
        
        try:
            response = self.client.embeddings.create(
                input=[text.replace("\n", " ")],
                model="text-embedding-3-small"
            )
            return response.data[0].embedding
        except Exception as e:
            # Fallback in case of API failure
            print(f"Error calling OpenAI embedding: {e}. Falling back to mock embedding.")
            np.random.seed(abs(hash(text)) % (2**32))
            return np.random.normal(0, 1, 1536).tolist()

embedding_service = EmbeddingService()
