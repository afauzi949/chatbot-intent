from fastapi import APIRouter
from app.schemas import IntentClassifyRequest, IntentClassifyResponse
from app.services.intent_classifier import classify_intent

router = APIRouter(prefix="/api/intent", tags=["intent"])


@router.post("/classify", response_model=IntentClassifyResponse)
def classify_text_intent(payload: IntentClassifyRequest):
    """Classify user text to determine if it is an explicit memory action or chat."""
    result = classify_intent(payload.text)
    return IntentClassifyResponse(
        intent=result.intent,
        confidence=result.confidence,
        extracted_fact=result.extracted_fact,
    )
