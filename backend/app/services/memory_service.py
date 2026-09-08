import re
import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models import AuditLog, MemoryFact


def get_active_memories(db: Session, user_id: Optional[uuid.UUID] = None) -> List[MemoryFact]:
    """Retrieve all active memory facts, ordered by updated_at descending."""
    query = db.query(MemoryFact).filter(MemoryFact.is_active == True)
    if user_id:
        query = query.filter(MemoryFact.user_id == user_id)
    return query.order_by(MemoryFact.updated_at.desc()).all()


def save_or_update_memory(
    db: Session,
    content: str,
    source_conversation_id: Optional[uuid.UUID] = None,
    user_id: Optional[uuid.UUID] = None,
    source: str = "explicit",
) -> MemoryFact:
    """
    Save or update a memory fact with deduplication.
    If an existing active fact contains or is contained in content (case-insensitive), update it.
    Otherwise, insert a new memory fact.
    """
    cleaned_content = content.strip()
    active_facts = get_active_memories(db, user_id=user_id)

    # Deduplication and update matching
    stop_words = {"yang", "dan", "di", "ke", "dari", "ini", "itu", "untuk", "pada", "adalah"}
    matched_fact = None
    c_words = set(re.findall(r"\w+", cleaned_content.lower())) - stop_words

    for fact in active_facts:
        f_text = fact.content.lower().strip()
        c_text = cleaned_content.lower()
        if f_text == c_text or f_text in c_text or c_text in f_text:
            matched_fact = fact
            break
        # Check token overlap for related preference / topic
        f_words = set(re.findall(r"\w+", f_text)) - stop_words
        if f_words and c_words:
            overlap = len(f_words & c_words)
            min_len = min(len(f_words), len(c_words))
            if overlap / min_len >= 0.5:
                matched_fact = fact
                break

    if matched_fact:
        action = "update"
        matched_fact.content = cleaned_content
        if source_conversation_id:
            matched_fact.source_conversation_id = source_conversation_id
        matched_fact.source = source
        matched_fact.is_active = True
        db_fact = matched_fact
    else:
        action = "save"
        db_fact = MemoryFact(
            user_id=user_id,
            content=cleaned_content,
            source_conversation_id=source_conversation_id,
            source=source,
            is_active=True,
        )
        db.add(db_fact)

    db.flush()

    # Record audit log
    audit = AuditLog(
        entity_type="memory_fact",
        entity_id=db_fact.id,
        action=action,
        detail={"content": db_fact.content, "source": source},
    )
    db.add(audit)
    db.commit()
    db.refresh(db_fact)
    return db_fact


def forget_memory_by_id(db: Session, memory_id: uuid.UUID) -> Optional[MemoryFact]:
    """Soft-delete a memory fact by ID."""
    fact = db.query(MemoryFact).filter(MemoryFact.id == memory_id).first()
    if not fact:
        return None

    fact.is_active = False
    audit = AuditLog(
        entity_type="memory_fact",
        entity_id=fact.id,
        action="delete",
        detail={"content": fact.content},
    )
    db.add(audit)
    db.commit()
    db.refresh(fact)
    return fact


def forget_memory_by_text(
    db: Session, query_text: str, user_id: Optional[uuid.UUID] = None
) -> List[MemoryFact]:
    """Soft-delete active memory facts matching query text."""
    cleaned = query_text.lower().strip()
    active_facts = get_active_memories(db, user_id=user_id)
    forgotten: List[MemoryFact] = []

    for fact in active_facts:
        f_text = fact.content.lower().strip()
        if cleaned in f_text or f_text in cleaned:
            fact.is_active = False
            audit = AuditLog(
                entity_type="memory_fact",
                entity_id=fact.id,
                action="delete",
                detail={"content": fact.content, "query": query_text},
            )
            db.add(audit)
            forgotten.append(fact)

    if forgotten:
        db.commit()
        for f in forgotten:
            db.refresh(f)
    return forgotten


def format_memories_for_prompt(memories: List[MemoryFact]) -> str:
    """Format active memory facts into a clean system prompt injection block."""
    if not memories:
        return ""

    facts_lines = [f"- {m.content}" for m in memories]
    return (
        "[User Long-Term Memory & Context]\n"
        "Fakta dan preferensi pengguna yang diingat dari percakapan sebelumnya:\n"
        + "\n".join(facts_lines)
        + "\n\nGunakan fakta-fakta di atas secara alami untuk mempersonalisasi jawaban Anda tanpa harus meminta konfirmasi ulang dari pengguna kecuali relevan."
    )
