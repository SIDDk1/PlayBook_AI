from __future__ import annotations

from app.schemas.engine import PlaybookMatchCandidate, PlaybookMatchResult, ScenarioDetectionResult
from app.schemas.playbook import PlaybookResponse


class PlaybookMatchingEngine:
    def match(
        self,
        detection: ScenarioDetectionResult,
        playbooks: list[PlaybookResponse],
    ) -> PlaybookMatchResult:
        candidates: list[PlaybookMatchCandidate] = []

        for playbook in playbooks:
            score = 0.0
            reasons: list[str] = []

            if playbook.scenario_type == detection.scenario:
                score += 70
                reasons.append("Scenario type matched directly.")

            if detection.severity.value in " ".join(playbook.guardrails).lower():
                score += 8
                reasons.append("Guardrails mention matching risk posture.")

            shared_terms = [
                sector
                for sector in detection.signals
                if sector.lower() in " ".join(playbook.trigger_conditions + playbook.tags).lower()
            ]
            if shared_terms:
                score += min(20, len(shared_terms) * 5)
                reasons.append("Trigger terms overlap with detected signals.")

            score += min(10, len(playbook.approval_workflow) * 2)

            candidates.append(
                PlaybookMatchCandidate(
                    playbook_id=playbook.id,
                    playbook_name=playbook.name,
                    score=score,
                    reasons=reasons or ["Baseline scenario alignment."],
                )
            )

        candidates.sort(key=lambda item: item.score, reverse=True)
        top_candidate = candidates[0] if candidates else None

        return PlaybookMatchResult(
            selected_playbook_id=top_candidate.playbook_id if top_candidate else None,
            selected_playbook_name=top_candidate.playbook_name if top_candidate else None,
            confidence=round((top_candidate.score / 100), 2) if top_candidate else 0.0,
            candidates=candidates[:3],
        )
