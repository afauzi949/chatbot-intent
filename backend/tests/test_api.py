import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "connected"


def test_conversations_crud():
    # 1. Create conversation
    create_res = client.post(
        "/api/conversations",
        json={"title": "Test Chat Conversation", "modelId": "qwen3.8-max-free"},
    )
    assert create_res.status_code == 201
    conv = create_res.json()
    conv_id = conv["id"]
    assert conv["title"] == "Test Chat Conversation"
    assert conv["modelId"] == "qwen3.8-max-free"
    assert "createdAt" in conv
    assert "updatedAt" in conv

    # 2. Get conversations list
    list_res = client.get("/api/conversations")
    assert list_res.status_code == 200
    convs = list_res.json()
    assert any(c["id"] == conv_id for c in convs)

    # 3. Rename conversation
    rename_res = client.patch(
        f"/api/conversations/{conv_id}",
        json={"title": "Renamed Chat Conversation"},
    )
    assert rename_res.status_code == 200
    renamed = rename_res.json()
    assert renamed["title"] == "Renamed Chat Conversation"

    # 4. Soft delete conversation
    del_res = client.delete(f"/api/conversations/{conv_id}")
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "deleted"

    # 5. Verify conversation no longer in active list
    list_res2 = client.get("/api/conversations")
    convs2 = list_res2.json()
    assert not any(c["id"] == conv_id for c in convs2)


def test_messages_flow():
    # Create conversation
    conv_res = client.post(
        "/api/conversations",
        json={"title": "Message Flow Test", "modelId": "qwen3.8-max-free"},
    )
    conv_id = conv_res.json()["id"]

    # Add user message
    msg1_res = client.post(
        f"/api/conversations/{conv_id}/messages",
        json={
            "role": "user",
            "content": "Halo apa kabar?",
        },
    )
    assert msg1_res.status_code == 201
    msg1 = msg1_res.json()
    assert msg1["role"] == "user"
    assert msg1["content"] == "Halo apa kabar?"
    msg1_id = msg1["id"]

    # Add assistant response
    msg2_res = client.post(
        f"/api/conversations/{conv_id}/messages",
        json={
            "role": "assistant",
            "content": "Halo! Saya asisten AI, ada yang bisa dibantu?",
            "responseTimeMs": 350,
        },
    )
    assert msg2_res.status_code == 201

    # Get messages
    get_msgs_res = client.get(f"/api/conversations/{conv_id}/messages")
    assert get_msgs_res.status_code == 200
    msgs = get_msgs_res.json()
    assert len(msgs) == 2
    assert msgs[0]["content"] == "Halo apa kabar?"

    # Delete message from msg1
    del_from_res = client.delete(
        f"/api/conversations/{conv_id}/messages?from={msg1_id}"
    )
    assert del_from_res.status_code == 200

    # Verify messages cleared
    get_msgs_res2 = client.get(f"/api/conversations/{conv_id}/messages")
    assert len(get_msgs_res2.json()) == 0

    # Cleanup conversation
    client.delete(f"/api/conversations/{conv_id}")


def test_memory_crud_and_deduplication():
    # 1. Create memory fact
    mem_res = client.post(
        "/api/memory",
        json={"content": "Saya suka minum matcha latte hangat tanpa gula"},
    )
    assert mem_res.status_code == 201
    mem = mem_res.json()
    mem_id = mem["id"]
    assert mem["content"] == "Saya suka minum matcha latte hangat tanpa gula"
    assert mem["isActive"] is True

    # 2. List active memories
    list_res = client.get("/api/memory")
    assert list_res.status_code == 200
    mems = list_res.json()
    assert any(m["id"] == mem_id for m in mems)

    # 3. Deduplication / update
    update_res = client.post(
        "/api/memory",
        json={"content": "Saya suka minum matcha latte dingin dengan sedikit gula"},
    )
    assert update_res.status_code == 201
    updated_mem = update_res.json()
    assert updated_mem["id"] == mem_id
    assert "matcha latte" in updated_mem["content"]

    # 4. Prompt context generation
    ctx_res = client.get("/api/memory/prompt-context")
    assert ctx_res.status_code == 200
    ctx_data = ctx_res.json()
    assert ctx_data["count"] > 0
    assert "matcha latte" in ctx_data["promptContext"]

    # 5. Soft delete memory
    del_res = client.delete(f"/api/memory/{mem_id}")
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "forgotten"

    # 6. Verify not in active list
    list_res2 = client.get("/api/memory")
    assert not any(m["id"] == mem_id for m in list_res2.json())


def test_intent_classification_benchmark():
    test_cases = [
        ("Ingat bahwa saya alergi udang dan kacang", "save_memory", "saya alergi udang dan kacang"),
        ("Tolong ingat ya: nama panggilan saya Alex", "save_memory", "nama panggilan saya Alex"),
        ("Catat bahwa deadline laporan akhir adalah hari Jumat depan", "save_memory", "deadline laporan akhir adalah hari Jumat depan"),
        ("Simpan informasi bahwa alamat kantor saya di Jakarta Selatan", "save_memory", "alamat kantor saya di Jakarta Selatan"),
        ("Please remember that my email is user@example.com", "save_memory", "my email is user@example.com"),
        ("Lupakan bahwa saya suka minum kopi tanpa gula", "forget_memory", "saya suka minum kopi tanpa gula"),
        ("Tolong hapus memori tentang alamat kantor saya", "forget_memory", "alamat kantor saya"),
        ("Please forget about my previous email address", "forget_memory", "my previous email address"),
        ("Halo, apa kabar hari ini?", "general_chat", None),
        ("Jelaskan perbedaan antara CNN dan RNN dalam deep learning", "general_chat", None),
    ]

    for sentence, expected_intent, expected_fact_substr in test_cases:
        res = client.post("/api/intent/classify", json={"text": sentence})
        assert res.status_code == 200, f"Failed for sentence: {sentence}"
        data = res.json()
        assert data["intent"] == expected_intent, f"Expected {expected_intent} but got {data['intent']} for: {sentence}"
        if expected_fact_substr:
            assert data["extractedFact"] is not None
            assert expected_fact_substr.lower() in data["extractedFact"].lower()


def test_automatic_memory_extraction_on_chat():
    conv_res = client.post(
        "/api/conversations",
        json={"title": "Auto Memory Chat Test", "modelId": "qwen3.8-max-free"},
    )
    conv_id = conv_res.json()["id"]

    # User message with explicit memory trigger
    msg_res = client.post(
        f"/api/conversations/{conv_id}/messages",
        json={
            "role": "user",
            "content": "Ingat bahwa hobi saya adalah fotografi landscape",
        },
    )
    assert msg_res.status_code == 201
    msg_data = msg_res.json()
    assert msg_data["intent"] == "save_memory"

    # Check that it appeared in active memory_facts
    mems = client.get("/api/memory").json()
    found = [m for m in mems if "fotografi landscape" in m["content"].lower()]
    assert len(found) > 0

    # Forget memory via message
    forget_res = client.post(
        f"/api/conversations/{conv_id}/messages",
        json={
            "role": "user",
            "content": "Lupakan bahwa hobi saya adalah fotografi landscape",
        },
    )
    assert forget_res.status_code == 201
    assert forget_res.json()["intent"] == "forget_memory"

    # Verify no longer active
    mems2 = client.get("/api/memory").json()
    found2 = [m for m in mems2 if "fotografi landscape" in m["content"].lower()]
    assert len(found2) == 0

    # Cleanup conversation
    client.delete(f"/api/conversations/{conv_id}")
