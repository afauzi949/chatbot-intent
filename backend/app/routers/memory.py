import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import MemoryFactCreate, MemoryFactResponse
from app.services.memory_service import (
    forget_memory_by_id,
    format_memories_for_prompt,
    get_active_memories,
    save_or_update_memory,
)

router = APIRouter(prefix="/api/memory", tags=["memory"])


@router.get("", response_model=List[MemoryFactResponse])
def list_active_memories(db: Session = Depends(get_db)):
    """Retrieve all active long-term memories."""
    return get_active_memories(db)


@router.post("", response_model=MemoryFactResponse, status_code=status.HTTP_201_CREATED)
def create_memory_fact(
    payload: MemoryFactCreate,
    db: Session = Depends(get_db),
):
    """Explicitly save or update a long-term memory fact with deduplication."""
    return save_or_update_memory(
        db=db,
        content=payload.content,
        source_conversation_id=payload.source_conversation_id,
        source=payload.source,
    )


@router.delete("/{memory_id}", status_code=status.HTTP_200_OK)
def delete_memory_fact(
    memory_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Soft delete / forget a long-term memory fact."""
    fact = forget_memory_by_id(db, memory_id)
    if not fact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Memory fact not found",
        )
    return {"status": "forgotten", "id": str(memory_id)}


@router.get("/prompt-context")
def get_prompt_context(db: Session = Depends(get_db)):
    """Get active memories formatted for LLM system prompt injection."""
    memories = get_active_memories(db)
    prompt_snippet = format_memories_for_prompt(memories)
    return {
        "count": len(memories),
        "promptContext": prompt_snippet,
    }
