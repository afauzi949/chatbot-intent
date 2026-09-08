from datetime import datetime
from typing import Any, Optional, Union
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


# --- Conversation Schemas ---

class ConversationCreate(BaseSchema):
    title: str = "New conversation"
    model_id: str
    skill_id: Optional[str] = None


class ConversationUpdate(BaseSchema):
    title: str


class ConversationResponse(BaseSchema):
    id: UUID
    user_id: Optional[UUID] = None
    title: str
    model_id: str
    skill_id: Optional[str] = None
    is_pinned: bool = False
    created_at: datetime
    updated_at: datetime


# --- Message Schemas ---

class MessageCreate(BaseSchema):
    id: Optional[Union[UUID, str]] = None
    role: str
    content: str
    model_id: Optional[str] = None
    skill_id: Optional[str] = None
    intent: Optional[str] = None
    mcp_tools: Optional[list[str]] = None
    tool_executions: Optional[list[dict[str, Any]]] = None
    response_time_ms: Optional[int] = None
    created_at: Optional[datetime] = None


class MessageResponse(BaseSchema):
    id: UUID
    conversation_id: UUID
    role: str
    content: str
    model_id: Optional[str] = None
    skill_id: Optional[str] = None
    intent: Optional[str] = None
    mcp_tools: Optional[list[str]] = None
    tool_executions: Optional[list[dict[str, Any]]] = None
    response_time_ms: Optional[int] = None
    created_at: datetime


# --- Memory Fact Schemas ---

class MemoryFactCreate(BaseSchema):
    content: str
    source_conversation_id: Optional[UUID] = None
    source: str = "explicit"


class MemoryFactResponse(BaseSchema):
    id: UUID
    user_id: Optional[UUID] = None
    content: str
    source: str
    is_active: bool
    source_conversation_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime


# --- Intent Schemas ---

class IntentClassifyRequest(BaseSchema):
    text: str


class IntentClassifyResponse(BaseSchema):
    intent: str
    confidence: float
    extracted_fact: Optional[str] = None
