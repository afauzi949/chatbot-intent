import re
from typing import Optional, Tuple
from pydantic import BaseModel


class IntentResult(BaseModel):
    intent: str
    confidence: float
    extracted_fact: Optional[str] = None


# Regex patterns for save_memory intent
SAVE_MEMORY_PATTERNS = [
    r"^(?:tolong\s+)?ingat\s+(?:bahwa|ya\b|ini\b)?\s*[:,-]?\s*(.+)$",
    r"^(?:tolong\s+)?catat\s+(?:bahwa|ini\b)?\s*[:,-]?\s*(.+)$",
    r"^(?:tolong\s+)?simpan\s+(?:informasi\s+bahwa|fakta\s+bahwa|bahwa|ini\b)?\s*[:,-]?\s*(.+)$",
    r"^(?:please\s+)?remember\s+(?:that)?\s*[:,-]?\s*(.+)$",
    r"^(?:please\s+)?note\s+(?:that)?\s*[:,-]?\s*(.+)$",
    r"^(?:tolong\s+)?ingat-ingat\s+(?:bahwa)?\s*[:,-]?\s*(.+)$",
]

# Regex patterns for forget_memory intent
FORGET_MEMORY_PATTERNS = [
    r"^(?:tolong\s+)?lupakan\s+(?:bahwa|tentang|soal|mengenai)?\s*[:,-]?\s*(.+)$",
    r"^(?:tolong\s+)?hapus\s+(?:memori|ingatan|fakta)?\s+(?:bahwa|tentang|soal|mengenai)?\s*[:,-]?\s*(.+)$",
    r"^(?:please\s+)?forget\s+(?:that|about)?\s*[:,-]?\s*(.+)$",
    r"^(?:please\s+)?delete\s+memory\s+(?:about)?\s*[:,-]?\s*(.+)$",
]


def classify_intent(text: str) -> IntentResult:
    """
    Classify intent of user input text into:
    - save_memory: Explicit instruction to remember a fact
    - forget_memory: Explicit instruction to forget a fact
    - general_chat: Standard conversation
    """
    cleaned = text.strip()
    if not cleaned:
        return IntentResult(intent="general_chat", confidence=1.0, extracted_fact=None)

    # 1. Check forget_memory patterns
    for pattern in FORGET_MEMORY_PATTERNS:
        match = re.search(pattern, cleaned, re.IGNORECASE)
        if match:
            fact = match.group(1).strip()
            # Remove trailing punctuation
            fact = re.sub(r"[.!?]+$", "", fact).strip()
            if fact:
                return IntentResult(
                    intent="forget_memory",
                    confidence=0.95,
                    extracted_fact=fact,
                )

    # 2. Check save_memory patterns
    for pattern in SAVE_MEMORY_PATTERNS:
        match = re.search(pattern, cleaned, re.IGNORECASE)
        if match:
            fact = match.group(1).strip()
            # Remove trailing punctuation
            fact = re.sub(r"[.!?]+$", "", fact).strip()
            if fact:
                return IntentResult(
                    intent="save_memory",
                    confidence=0.95,
                    extracted_fact=fact,
                )

    # 3. Default to general_chat
    return IntentResult(intent="general_chat", confidence=0.85, extracted_fact=None)
