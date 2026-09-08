import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import AuditLog, Conversation, Message
from app.schemas import (
    ConversationCreate,
    ConversationResponse,
    ConversationUpdate,
    MessageCreate,
    MessageResponse,
)
from app.services.intent_classifier import classify_intent
from app.services.memory_service import (
    forget_memory_by_text,
    save_or_update_memory,
)

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


@router.get("", response_model=List[ConversationResponse])
def get_conversations(db: Session = Depends(get_db)):
    """List all non-deleted conversations ordered by updated_at descending."""
    return (
        db.query(Conversation)
        .filter(Conversation.is_deleted == False)
        .order_by(Conversation.updated_at.desc())
        .all()
    )


@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(
    payload: ConversationCreate,
    db: Session = Depends(get_db),
):
    """Create a new conversation."""
    conv = Conversation(
        title=payload.title,
        model_id=payload.model_id,
        skill_id=payload.skill_id,
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)

    # Record audit log
    audit = AuditLog(
        entity_type="conversation",
        entity_id=conv.id,
        action="save",
        detail={"title": conv.title, "model_id": conv.model_id},
    )
    db.add(audit)
    db.commit()

    return conv


@router.patch("/{conversation_id}", response_model=ConversationResponse)
def rename_conversation(
    conversation_id: uuid.UUID,
    payload: ConversationUpdate,
    db: Session = Depends(get_db),
):
    """Rename a conversation title."""
    conv = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id, Conversation.is_deleted == False)
        .first()
    )
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    conv.title = payload.title
    audit = AuditLog(
        entity_type="conversation",
        entity_id=conv.id,
        action="rename",
        detail={"new_title": payload.title},
    )
    db.add(audit)
    db.commit()
    db.refresh(conv)
    return conv


@router.delete("/{conversation_id}", status_code=status.HTTP_200_OK)
def delete_conversation(
    conversation_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Soft delete a conversation."""
    conv = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id, Conversation.is_deleted == False)
        .first()
    )
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    conv.is_deleted = True
    audit = AuditLog(
        entity_type="conversation",
        entity_id=conv.id,
        action="delete",
        detail={"title": conv.title},
    )
    db.add(audit)
    db.commit()
    return {"status": "deleted", "id": str(conversation_id)}


# --- Messages Endpoints ---

@router.get("/{conversation_id}/messages", response_model=List[MessageResponse])
def get_messages(
    conversation_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """List messages for a conversation ordered chronologically."""
    conv = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id, Conversation.is_deleted == False)
        .first()
    )
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    return (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .all()
    )


@router.post(
    "/{conversation_id}/messages",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_message(
    conversation_id: uuid.UUID,
    payload: MessageCreate,
    db: Session = Depends(get_db),
):
    """
    Add a message to a conversation.
    If role is 'user' and intent indicates explicit memory command,
    process memory facts automatically.
    """
    conv = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id, Conversation.is_deleted == False)
        .first()
    )
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    detected_intent = payload.intent
    # Check intent for user message if intent is not specified or set to auto
    if payload.role == "user" and (not detected_intent or detected_intent == "auto"):
        intent_res = classify_intent(payload.content)
        detected_intent = intent_res.intent

        # Process explicit memory trigger
        if intent_res.intent == "save_memory" and intent_res.extracted_fact:
            save_or_update_memory(
                db=db,
                content=intent_res.extracted_fact,
                source_conversation_id=conversation_id,
                source="explicit",
            )
        elif intent_res.intent == "forget_memory" and intent_res.extracted_fact:
            forget_memory_by_text(
                db=db,
                query_text=intent_res.extracted_fact,
            )

    msg_id = None
    if payload.id:
        if isinstance(payload.id, uuid.UUID):
            msg_id = payload.id
        else:
            try:
                msg_id = uuid.UUID(str(payload.id))
            except ValueError:
                msg_id = uuid.uuid4()
    else:
        msg_id = uuid.uuid4()

    msg = Message(
        id=msg_id,
        conversation_id=conversation_id,
        role=payload.role,
        content=payload.content,
        model_id=payload.model_id,
        skill_id=payload.skill_id,
        intent=detected_intent,
        mcp_tools=payload.mcp_tools,
        tool_executions=payload.tool_executions,
        response_time_ms=payload.response_time_ms,
        created_at=payload.created_at,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


@router.delete("/{conversation_id}/messages", status_code=status.HTTP_200_OK)
def delete_messages_from(
    conversation_id: uuid.UUID,
    from_message_id: Optional[str] = Query(None, alias="from"),
    db: Session = Depends(get_db),
):
    """Delete messages starting from fromMessageId forward (for re-send/edit flows)."""
    conv = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id, Conversation.is_deleted == False)
        .first()
    )
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    if from_message_id:
        from_uuid = None
        try:
            from_uuid = uuid.UUID(str(from_message_id))
        except ValueError:
            pass

        if from_uuid:
            target_msg = (
                db.query(Message)
                .filter(
                    Message.id == from_uuid,
                    Message.conversation_id == conversation_id,
                )
                .first()
            )
            if target_msg:
                db.query(Message).filter(
                    Message.conversation_id == conversation_id,
                    Message.created_at >= target_msg.created_at,
                ).delete()
                db.commit()
                return {"status": "deleted_from", "fromMessageId": str(from_uuid)}

    return {"status": "no_action"}
